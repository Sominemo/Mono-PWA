import { API } from "@App/tools/API"
import currency from "./methods/currency"

export default class MonoAnonymousAPI extends API {
    constructor(id = null) {
        super({
            domain: "https://api.monobank.ua",
            requestTimeouts: {
                "bank/currency": 60000,
            },
            globalTimeout: 0,
            token: null,
            id,
        })
    }

    get authed() {
        return false
    }

    currency = currency.bind(this)
}
