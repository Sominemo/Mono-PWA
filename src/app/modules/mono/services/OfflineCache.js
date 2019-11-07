import DBTool from "@Core/Tools/db/DBTool"

export default class OfflineCache {
    static StorageName = "main"

    static AdditionalStorageName = "int"

    static _dbConnectionInstance = null

    static async DBConnection() {
        const self = this

        if (!this._dbConnectionInstance) {
            this._dbConnectionInstance = new DBTool("OfflineCache", 2, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    if (oldVersion === 0) {
                        db.createObjectStore(self.StorageName, {
                            keyPath: "key",
                        })
                        db.createObjectStore(self.AdditionalStorageName, {
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

    static async ADBOS() {
        if (this._adbOS) return this._adbOS
        const db = await this.DBConnection()
        this._adbOS = db.OSTool(this.AdditionalStorageName)
        return this._adbOS
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

    static async getAccounts(id) {
        try {
            return (await (await this.ADBOS()).get(`personal/client-info[${id}]`)).data
        } catch (e) {
            return []
        }
    }

    static async updateAccounts(id, data) {
        return (await this.ADBOS()).put({ data, key: `personal/client-info[${id}]` })
    }

    static async destroyAccounts(id) {
        return (await this.ADBOS()).delete(`personal/client-info[${id}]`)
    }
}
