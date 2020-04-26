import Axios from "axios"
import { Report } from "@Core/Services/Report"
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

    static offlineMode = false

    constructor({
        domain, globalTimeout = 0, requestTimeouts = {}, token = null, clientId = null, id = null, name = "Account",
        noAuthDomain = null, notificationServer = false,
    }) {
        this.domain = domain
        this.noAuthDomain = noAuthDomain || domain
        this.notificationServer = notificationServer
        this.globalTimeout = globalTimeout
        this.requestTimeouts = requestTimeouts
        this.token = token
        this.clientId = clientId
        this.id = id
        this.name = name
    }

    get tokenError() {
        return new APIError(403, { type: 1 })
    }

    floodError(errorObject) {
        return errorObject.info.data === 429
    }

    #tokenErrorHandler = () => { }

    call(method, {
        methodID = null, data = {}, requestMethod = "get", useAuth = this.token !== null, settings = API.flags.waiting,
        customToken = null,
    } = {}) {
        if (API.offlineMode) return Promise.reject(new APIError(0, { type: 1 }))

        if (this.token === null && useAuth && !customToken) {
            this.#tokenErrorHandler()
            return Promise.reject(this.tokenError)
        }


        let resolve
        let reject
        const p = new Promise((res, rej) => {
            resolve = res
            reject = (e) => {
                if (e instanceof APIError
                    && (e.data === 403 || e.data === 401)) this.#tokenErrorHandler()
                rej()
            }
        })

        this.sendToCart({
            method, methodID, data, requestMethod, useAuth, settings, customToken,
        }, resolve, reject)

        return p
    }

    sendToCart(request, resolve, reject) {
        const dataObject = { request, resolve, reject }

        if (request.settings & API.flags.skipGlobal) {
            this.sendRequest(dataObject)
            return
        } if (request.settings & (API.flags.waiting | API.flags.skip)) {
            this.cart.push(dataObject)
            this.cartRunner()
            return
        }

        if (!this.cartStatus(request.methodID)) {
            reject(new APIError(2))
            return
        }
        this.cart.push(dataObject)
        this.cartRunner()
    }

    #cartBusy = false

    cartRunner(myself = false) {
        if (this.#cartBusy && !myself) return
        if (this.cart.length === 0) {
            this.#cartBusy = false
            return
        }

        this.#cartBusy = true
        let minValue = null
        try {
            const globalWait = this.lastRequest + this.globalTimeout - Date.now()
            if (globalWait > 0) {
                setTimeout(() => this.cartRunner(true), globalWait)
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
                this.sendRequest(requestObject)
                this.cart.splice(index, 1)
                if (this.globalTimeout > 0) throw new APIError(1, { type: 2 })
            })
        } catch (e) {
            this.#cartBusy = false
            if (!(e instanceof APIError && e.info.type === 2 && e.info.data === 1)) throw e
        }
        if (this.cart.length > 0 && minValue > 0) setTimeout(() => this.cartRunner(true), minValue)
        this.#cartBusy = false
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

    async sendRequest({
        request, resolve, reject, originalTimestamp = null,
    }) {
        const self = this
        const url = request.method

        let timestampTriggered = false

        try {
            let object = {
                method: request.requestMethod,
                url,
                baseURL: (request.useAuth ? this.domain : this.noAuthDomain),
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
            if (request.useAuth) object = this.authAttacher(object, request)

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
                Report.add(error.message, ["api.error"])
            }

            if ((this.floodError(errorObject)
                && request.settings & API.flags.resendOnFlood)
                || request.settings & API.flags.resend) {
                this.sendToCart(request, resolve, reject)
                return
            }

            reject(errorObject)
        }
    }

    authAttacher(object, request) {
        object.headers["X-Token"] = (request.customToken ? request.customToken : this.token)
        return object
    }
}
