import { API } from "@App/tools/API"
import currency from "./methods/currency"
import clientInfo from "./methods/clientInfo"
import destroyInstance from "./methods/destroyInstance"
import Auth from "../../services/Auth"
import MonoNotificationClusterController from "../../services/Push/MonoNotificationClusterController"

export default class MonoCorpAPI extends API {
    constructor(token, domain, clientId, id = null, name = "Mono Account", notificationServer = false, directDomain = "https://api.monobank.ua") {
        if (typeof token !== "string") throw new TypeError("String token expected")
        if (typeof domain !== "string") throw new TypeError("String domain expected")

        super({
            domain,
            requestTimeouts: {
                "bank/currency": 60000,
                "personal/client-info": 0,
                "personal/statement": 0,
                "personal/auth/request": 0,
            },
            globalTimeout: 0,
            token,
            clientId,
            id,
            name,
            noAuthDomain: directDomain,
            notificationServer,
        })

        const updateEndpoint = (endpoint) => {
            Auth.updatePushEndpoint(id, endpoint)
        }

        if (notificationServer) {
            this.push = MonoNotificationClusterController.register({
                token,
                ...notificationServer,
                updateEndpoint,
            })
        }
    }

    get authed() {
        return true
    }

    currency = currency.bind(this)

    clientInfo = clientInfo.bind(this)

    #tokenErrorHandler = destroyInstance.bind(this)

    authAttacher(object, request) {
        object.headers["X-Request-Id"] = this.token
        return object
    }
}
