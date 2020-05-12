import DBTool from "@Core/Tools/db/DBTool"

export default class OfflineCache {
    static StorageName = "main"

    static AdditionalStorageName = "int"

    static #dbConnectionInstance = null

    static async DBConnection() {
        const self = this

        if (!this.#dbConnectionInstance) {
            this.#dbConnectionInstance = new DBTool("OfflineCache", 5, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    try {
                        db.createObjectStore(self.StorageName, {
                            keyPath: "key",
                        })
                    } catch (e) {
                        // Object Store exists
                    }

                    try {
                        db.createObjectStore(self.AdditionalStorageName, {
                            keyPath: "key",
                        })
                    } catch (e) {
                        // Object Store exists
                    }
                },
            })
        }

        return this.#dbConnectionInstance.onReady()
    }

    static #dbOS

    static #adbOS

    static async DBOS() {
        if (this.#dbOS) return this.#dbOS
        const db = await this.DBConnection()
        this.#dbOS = db.OSTool(this.StorageName)
        return this.#dbOS
    }

    static async ADBOS() {
        if (this.#adbOS) return this.#adbOS
        const db = await this.DBConnection()
        this.#adbOS = db.OSTool(this.AdditionalStorageName)
        return this.#adbOS
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
