export default class LiteralActions {
    static reg = {}

    static add(name, cb) {
        this.reg[name] = cb
    }

    static execute(name, params, options = []) {
        if (typeof name === "function") return name(...params)
        if (typeof this.reg[name] !== "function") return null
        return this.reg[name](options, ...params)
    }
}
