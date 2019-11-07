import Axios from "axios"
import Report from "@Core/Services/report"
import APIError from "./APIError"

export default class API {
    domain = null

    token = null

    globalTimeout = 0

    requestTimeouts = {}

    cart = []

    lastRequest = 0

    lastRequests = {}

    static flags = {
        waiting: 0b1,
        skip: 0b10,
        skipGlobal: 0b100,
        resend: 0b1000,
        resendOnFlood: 0b10000,
    }

    constructor({
        domain, globalTimeout = 0, requestTimeouts = {}, token = null, id = null, name = "Account",
    }) {
        this.domain = domain
        this.globalTimeout = globalTimeout
        this.requestTimeouts = requestTimeouts
        this.token = token
        this.id = id
        this.name = name
    }

    get _tokenError() {
        return new APIError(403, { type: 1 })
    }

    _floodError(errorObject) {
        return errorObject.info.data === 429
    }

    call(method, {
        methodID = null, data = {}, requestMethod = "get", useAuth = this.token !== null, settings = API.flags.waiting,
        customToken = null,
    } = {}) {
        if (this.token === null && useAuth && !customToken) return Promise.reject(this._tokenError)


        let resolve
        let reject
        const p = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })

        this.sendToCart({
            method, methodID, data, requestMethod, useAuth, settings, customToken,
        }, resolve, reject)

        return p
    }

    sendToCart(request, resolve, reject) {
        const dataObject = { request, resolve, reject }

        if (request.settings & API.flags.skipGlobal) {
            this._sendRequest(dataObject)
            return
        } if (request.settings & (API.flags.waiting | API.flags.skip)) {
            this.cart.push(dataObject)
            this._cartRunner()
            return
        }

        if (!this.cartStatus(request.methodID)) {
            reject(new APIError(2))
            return
        }
        this.cart.push(dataObject)
        this._cartRunner()
    }

    _cartBusy = false

    _cartRunner(myself = false) {
        if (this._cartBusy && !myself) return
        if (this.cart.length === 0) {
            this._cartBusy = false
            return
        }

        this._cartBusy = true
        let minValue = null
        try {
            const globalWait = this.lastRequest + this.globalTimeout - Date.now()
            if (globalWait > 0) {
                setTimeout(() => this._cartRunner(true), globalWait)
                return
            }


            this.cart.forEach((requestObject, index) => {
                if (requestObject.request.methodID !== null) {
                    const cartStatus = this.cartStatus(requestObject.request.methodID, true)
                    if (cartStatus !== 0 && !(requestObject.request.settings & API.flags.skip)) {
                        minValue = (minValue === null ? cartStatus : Math.min(minValue, cartStatus))
                        return
                    }

                    requestObject
                        .originalTimestamp = this.lastRequests[requestObject.request.methodID]

                    if (this.requestTimeouts[requestObject.request.methodID] === 0) {
                        this.lastRequests[requestObject.request.methodID] = true
                    }
                }

                this.lastRequest = Date.now()
                this._sendRequest(requestObject)
                this.cart.splice(index, 1)
                if (this.globalTimeout > 0) throw new APIError(1, { type: 2 })
            })
        } catch (e) {
            this._cartBusy = false
            if (!(e instanceof APIError && e.info.type === 2 && e.info.data === 1)) throw e
        }
        if (this.cart.length > 0 && minValue > 0) setTimeout(() => this._cartRunner(true), minValue)
        this._cartBusy = false
    }

    cartStatus(methodID = null, getValue = false) {
        const globalWait = Math.max(
            this.globalTimeout - (Date.now() - this.lastRequest),
            0,
        )

        if (Date.now() - this.lastRequest < this.globalTimeout) {
            return (getValue ? globalWait : false)
        }
        if (methodID === null || !(methodID in this.lastRequests)) return (getValue ? 0 : true)
        if (this.lastRequests[methodID] === true) return (getValue ? 1 : false)
        const value = Math.max(
            this.requestTimeouts[methodID] - (Date.now() - this.lastRequests[methodID]),
            0,
        )
        return (getValue ? value : value === 0)
    }

    async _sendRequest({
        request, resolve, reject, originalTimestamp = null,
    }) {
        const self = this
        const url = request.method

        let timestampTriggered = false

        try {
            let object = {
                method: request.requestMethod,
                url,
                baseURL: this.domain,
                responseType: "json",
                headers: {},
                data: request.data,
                onDownloadProgress(event) {
                    if (timestampTriggered) return
                    timestampTriggered = true
                    this.lastRequest = Date.now()
                    self.lastRequests[request.methodID] = Date.now()
                },
            }
            if (request.useAuth) object = this._authAttacher(object, request)

            const response = await Axios(object)

            resolve(response.data)
        } catch (error) {
            let errorObject
            if (error.response) {
                errorObject = new APIError(error.response.status, { type: 1 })
            } else if (error.request) {
                errorObject = new APIError(0, { type: 1 })
                self.lastRequests[request.methodID] = originalTimestamp || 0
            } else {
                errorObject = new APIError(-1, { type: 1 })
                self.lastRequests[request.methodID] = originalTimestamp || 0
                Report.write("Error", error.message)
            }

            if ((this._floodError(errorObject)
                && request.settings & API.flags.resendOnFlood)
                || request.settings & API.flags.resend) {
                this.sendToCart(request, resolve, reject)
                return
            }

            reject(errorObject)
        }
    }

    _authAttacher(object, request) {
        object.headers["X-Token"] = (request.customToken ? request.customToken : this.token)
        return object
    }
}
