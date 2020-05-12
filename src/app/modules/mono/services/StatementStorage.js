import DBTool from "@Core/Tools/db/DBTool"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import delayAction from "@Core/Tools/objects/delayAction"
import modeString from "@App/tools/transform/modeString"
import PWA from "@App/modules/main/PWA"
import Auth from "./Auth"
import MonoCorpAPI from "../API/clients/MonoCorpAPI"
import MonoAPI from "../API/clients/MonoAPI"
import MCC from "../API/classes/MCC"

export default class StatementStorage {
    static async get(id, from, to) {
        const db = (await this.statementDB()).OSTool(id)
        return (await db.getWhere(null, (v) => (v.time >= from && v.time <= to)))
            .sort((a, b) => b.time - a.time)
    }

    static async syncAccountStorageList() {
        let dbConnection = null
        const dbTool = await this.statementDB()

        const db = async () => {
            if (!dbConnection) {
                dbTool.request.close()
                dbConnection = this.upgradeDB()
            }
            return (await dbConnection)[1]
        }
        const res = await Promise.all([this.getAccountList(), dbTool.getTablesList()])
        await Promise.all(res[0].map(async (e) => {
            if (!res[1].includes(e)) {
                await (await db()).createObjectStore(e, {
                    keyPath: "key",
                    autoIncrement: true,
                })
            }
            if (res[0].includes(e)) {
                delete res[1][res[1].findIndex((v) => v === e)]
            }
        }))

        await Promise.all(res[1].map(async (e) => (await db()).deleteObjectStore(e)))
    }

    static async getAccountList(objects = false, preferOffline = true) {
        const cardList = new Map()
        await Promise.all(Auth.authed.map(async (account) => {
            const ci = await account.clientInfo({ preferOffline })
            ci.accounts.forEach((e) => {
                if (!(e.client instanceof MonoAPI
                    && cardList.get(e.id) && cardList.get(e.id).client instanceof MonoCorpAPI)) {
                    cardList.set(e.id, e)
                }
            })
        }))

        const order = await SettingsStorage.get("card_order") || []
        const accounts = Array.from(cardList.values())
        const curOrder = ["UAH", "USD", "EUR", "PLN"]

        let list = [...order.map((el) => {
            const ind = accounts.findIndex((em) => em && em.id === el)
            if (ind !== -1) {
                const acc = accounts[ind]
                delete accounts[ind]
                return acc
            }
            return undefined
        }), ...accounts].filter((e) => e !== undefined)

        if (order.length === 0) {
            list = list.sort(
                (a, b) => {
                    if (a.id < b.id) return -1
                    if (a.id > b.id) return 1
                    return 0
                },
            )
            const uah = []
            const known = []
            const unknown = []
            list.forEach((e) => {
                let arr
                if (e.balance.currency.code === "UAH") arr = uah
                else arr = (curOrder.indexOf(e.balance.currency.code) === -1 ? unknown : known)
                arr.push(e)
            })
            list = [...uah.sort(
                (a, b) => {
                    if (a.cards[0].type === "white" && b.cards[0].type !== "white") return 1
                    return 0
                },
            ),
            ...known.sort(
                (a, b) => {
                    const indA = curOrder.indexOf(a.balance.currency.code)
                    const indB = curOrder.indexOf(b.balance.currency.code)
                    if (indA < indB) return -1
                    if (indA > indB) return 1
                    return 0
                },
            ), ...unknown]
        }

        return (objects ? list : list.map((e) => e.id))
    }

    static async addItems(id, data) {
        const dbTool = await this.statementDB()
        const db = (dbTool).OSTool(id)
        const cnt = (await Promise.all(data.map(async (e) => {
            if (!((await db.getWhere(null, (v) => v.id === e.id)).length)) db.put(e)
        }))).length

        if (cnt && PWA.analyticsAllowed) {
            delayAction(async () => {
                const t = await dbTool.getTablesList()

                const res = modeString([].concat(...await Promise.all(
                    t.map(async (p) => (await (dbTool).OSTool(p).getAll())
                        .map((e) => new MCC(e.mcc).title)),
                )))
                window.gtag("set", { user_properties: { popular_spend_category: res } })
            })
        }
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
                this.#db = dbTool
            } catch (e) {
                reject()
            }
        })
    }

    static #db = null

    static async statementDB(connection = false) {
        if (this.#db === null) await this.upgradeDB(await SettingsStorage.get("statement_db_version"), true)
        const db = await this.#db.onReady()
        return (connection ? this.#db : db)
    }
}
