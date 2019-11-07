import DBTool from "@Core/Tools/db/DBTool"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import Auth from "./Auth"

export default class StatementStorage {
    static async get(id, from, to) {
        const db = (await this.statementDB()).OSTool(id)
        return (await db.getWhere(null, v => (v.time >= from && v.time <= to)))
            .sort((a, b) => a - b)
    }

    static async syncCardStorageList() {
        let _db = null
        const dbTool = await this.statementDB()

        const db = async () => {
            if (!_db) {
                dbTool.request.close()
                _db = this.upgradeDB()
            }
            return (await _db)[1]
        }
        const res = await Promise.all([this.getCardList(), dbTool.getTablesList()])
        await Promise.all(res[0].map(async (e) => {
            if (!res[1].includes(e)) {
                await (await db()).createObjectStore(e, {
                    keyPath: "key",
                    autoIncrement: true,
                })
            }
            if (res[0].includes(e)) {
                delete res[1][res[1].findIndex(v => v === e)]
            }
        }))

        await Promise.all(res[1].map(async e => (await db()).deleteObjectStore(e)))
    }

    static async getCardList(objects = false) {
        const cardList = new Set()
        await Promise.all(Auth.authed.map(async (account) => {
            const ci = await account.clientInfo({ preferOffline: true })
            ci.accounts.forEach((e) => {
                cardList.add((objects ? e : e.id))
            })
        }))

        return Array.from(cardList)
    }

    static async addItems(id, data) {
        const db = (await this.statementDB()).OSTool(id)
        await Promise.all(data.map(async (e) => {
            if (!((await db.getWhere(null, v => v.id === e.id)).length)) db.put(e)
        }))
    }

    static upgradeDB(explict = false, nonUpgrade = false) {
        return new Promise(async (resolve, reject) => {
            try {
                const version = explict || ((await SettingsStorage.get("statement_db_version")) + 1)
                const dbTool = new DBTool("StatementStorage", version, {
                    upgrade(db, oldVersion, newVersion, transaction) {
                        SettingsStorage.set("statement_db_version", version)
                        resolve([dbTool, db, oldVersion, newVersion, transaction])
                    },
                })
                if (nonUpgrade) resolve(dbTool)
                this._db = dbTool
            } catch (e) {
                reject()
            }
        })
    }

    static _db = null

    static async statementDB(connection = false) {
        if (this._db === null) await this.upgradeDB(await SettingsStorage.get("statement_db_version"), true)
        const db = await this._db.onReady()
        return (connection ? this._db : db)
    }
}
