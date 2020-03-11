import Account from "./Account"

export default class BankCard {
    constructor(account, mask, paymentSystem = null, type = null, level = null, { color = null }) {
        if (!(account instanceof Account)) throw new TypeError("Incorrect Account")
        if (typeof mask.start !== "string" || typeof mask.end !== "string") throw new TypeError("Incorrect mask")

        this.account = account
        this.paymentSystem = paymentSystem
        this.type = type
        this.level = level
        this.mask = mask
        this.color = color
    }
}
