import { API } from "@App/tools/API"
import currency from "./methods/currency"
import clientInfo from "./methods/clientInfo"
import destroyInstance from "./methods/destroyInstance"

export default class MonoAPI extends API {
    constructor(token, clientId, id = null, name = "Mono Account") {
        super({
            domain: "https://api.monobank.ua",
            requestTimeouts: {
                "bank/currency": 60000,
                "personal/client-info": 60000,
                "personal/statement": 60000,
            },
            globalTimeout: 0,
            token,
            clientId,
            id,
            name,
        })
    }

    currency = currency.bind(this)

    clientInfo = clientInfo.bind(this)

    #tokenErrorHandler = destroyInstance.bind(this)

    get authed() {
        return true
    }
}
