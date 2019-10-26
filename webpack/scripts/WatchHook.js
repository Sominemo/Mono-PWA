class WatchHook {
    constructor(func) {
        if (typeof func !== "function") throw new TypeError("Function expected")
        this.func = func
    }

    apply(compiler) {
        compiler.hooks.watchRun.tap("WatchHook", () => {
            this.func()
        })
    }
}

module.exports = WatchHook
