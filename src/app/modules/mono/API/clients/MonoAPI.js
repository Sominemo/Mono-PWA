import { API } from "@App/tools/API"
import currency from "./methods/currency"
import clientInfo from "./methods/clientInfo"

export default class MonoAPI extends API {
    constructor(token, id = null) {
        super({
            domain: "https://api.monobank.ua",
            requestTimeouts: {
                "bank/currency": 60000,
                "personal/client-info": 60000,
                "personal/statement": 60000,
            },
            globalTimeout: 0,
            token,
            id,
        })
    }

    currency = currency.bind(this)

    clientInfo = clientInfo.bind(this)

    get authed() {
        return true
    }
}
