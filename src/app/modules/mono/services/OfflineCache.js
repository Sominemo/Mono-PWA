import DBTool from "@Core/Tools/db/DBTool"

export default class OfflineCache {
    static StorageName = "main"

    static _dbConnectionInstance = null

    static async DBConnection() {
        const self = this

        if (!this._dbConnectionInstance) {
            this._dbConnectionInstance = new DBTool("OfflineCache", 1, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    if (oldVersion === 0) {
                        db.createObjectStore(self.StorageName, {
                            keyPath: "key",
                        })
                    }
                },
            })
        }

        return this._dbConnectionInstance.onReady()
    }

    static async DBOS() {
        if (this._dbOS) return this._dbOS
        const db = await this.DBConnection()
        this._dbOS = db.OSTool(this.StorageName)
        return this._dbOS
    }

    static async saveCurrencies(raw) {
        return (await this.DBOS()).put({ key: "bank/currency", data: raw })
    }

    static async getCurrencies() {
        return (await (await this.DBOS()).get("bank/currency")).data
    }

    static async savePartners(raw) {
        return (await this.DBOS()).put({ key: "divided-payment/partners", data: raw, time: Date.now() })
    }

    static async getPartners() {
        const d = await (await this.DBOS()).get("divided-payment/partners")
        return { data: d.data, time: d.time }
    }
}
