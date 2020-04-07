import DBUserPresence from "@Core/Services/DBUserPresence"
import { $$ } from "@Core/Services/Language/handler"
import Report from "@Core/Services/reportOld"
import download from "@App/tools/interaction/download"
import { CoreLoader } from "@Core/Init/CoreLoader"
import OfflineCache from "@App/modules/mono/services/OfflineCache"
import StatementStorage from "@App/modules/mono/services/StatementStorage"
import Auth from "@App/modules/mono/services/Auth"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"

CoreLoader.registerTask({
    id: "db-presence",
    presence: "Register DBs",
    task() {
        DBUserPresence.registerNewPresence({
            id: "LogData",
            name: $$("settings/storage/dbs/logs"),
            description: $$("settings/storage/dbs/logs/description"),
            icon: "description",
            quota: () => (1024 ** 2) * 15,
            size: async () => {
                const db = await Report.DBConnection()
                const res = await db.getDBSize()
                return res
            },
            config: {
                changeable: true,
                min: (1024 ** 2) * 10,
                max: (1024 ** 2) * 300,
                display: true,
            },
            actions: [
                {
                    name: $$("settings/storage/actions/clear"),
                    handler: () => DBUserPresence.get("LogData").functions.find((e) => e.name === "clear").handler(),
                },
                {
                    name: $$("settings/storage/actions/export"),
                    handler: () => DBUserPresence.get("LogData").functions.find((e) => e.name === "export").handler(),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => new Promise(async (resolve, reject) => {
                        const db = await Report.DBConnection()
                        try {
                            await db.OSTool("console-output").clear()
                            resolve()
                        } catch (e) {
                            reject()
                        }
                    }),
                },
                {
                    name: "export",
                    async handler() {
                        const db = JSON.stringify(await Report.allLog())

                        download([db], "text/plain", "app-log.json")
                    },
                },
                {
                    name: "auto-clean",
                    async handler() {
                        const db = (await Report.DBConnection()).OSTool("console-output")
                        await db.clearPercent(0.5)
                    },
                },
            ],
        })

        DBUserPresence.registerNewPresence({
            id: "OfflineCache",
            name: $$("settings/storage/dbs/offline_cache"),
            description: $$("settings/storage/dbs/offline_cache/description"),
            icon: "offline_pin",
            size: async () => {
                const db = await OfflineCache.DBConnection()
                const res = await db.getDBSize()
                return res
            },
            config: {
                changeable: false,
                display: true,
            },
            actions: [
                {
                    name: $$("settings/storage/actions/clear"),
                    handler: () => DBUserPresence.get("OfflineCache").functions.find((e) => e.name === "clear").handler(),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => new Promise(async (resolve, reject) => {
                        const db = await OfflineCache.DBConnection()
                        db.OSTool("main").clear()
                            .then(() => resolve())
                            .catch((e) => reject(e))
                    }),
                },
                {
                    name: "auto-clean",
                    async handler() {
                        const db = (await OfflineCache.DBConnection()).OSTool("main")
                        await db.clearPercent(0.5)
                    },
                },
            ],
        })

        DBUserPresence.registerNewPresence({
            id: "Accounts",
            name: $$("settings/storage/dbs/accounts"),
            description: $$("settings/storage/dbs/accounts/description"),
            icon: "account_circle",
            size: async () => {
                const db = await Auth.db.onReady()
                const res = await db.getDBSize()
                return res
            },
            config: {
                changeable: false,
                display: true,
            },
            actions: [
                {
                    name: $$("settings/storage/actions/log_out"),
                    handler: () => new Promise((resolve, reject) => {
                        try {
                            const p = Prompt({
                                title: $$("settings/storage/actions/log_out"),
                                text: $$("settings/storage/actions/log_out/you_will_log_out"),
                                buttons: [
                                    {
                                        content: $$("close"),
                                        handler() {
                                            p.close()
                                            reject()
                                        },
                                        type: "light",
                                    },
                                    {
                                        content: $$("continue"),
                                        handler() {
                                            DBUserPresence.get("Accounts").functions.find((e) => e.name === "clear").handler()
                                            p.close()
                                            resolve()
                                        },
                                    },
                                ],
                            })
                        } catch (e) {
                            reject()
                        }
                    }),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => new Promise(async (resolve, reject) => {
                        try {
                            await Promise.all(Auth.all.map((e) => Auth.destroyInstance(e.id)))
                            const db = await Auth.db.onReady()
                            await db.OSTool("accounts").clear()
                            await Auth.initInstances()
                            resolve()
                        } catch (e) {
                            reject()
                        }
                    }),
                },
            ],
        })

        DBUserPresence.registerNewPresence({
            id: "CardSettings",
            name: $$("settings/storage/dbs/card_settings"),
            description: $$("settings/storage/dbs/card_settings/description"),
            icon: "credit_card",
            size: async () => {
                const db = await Promise.all([SettingsStorage.get("card_order"), SettingsStorage.get("mono_cards_config")])
                const res = db.reduce((pr, cur) => pr + (cur ? JSON.stringify(cur).length : 0), 0)
                return res
            },
            config: {
                changeable: false,
                display: true,
            },
            actions: [
                {
                    name: $$("settings/storage/actions/clear"),
                    handler: () => DBUserPresence.get("CardSettings").functions.find((e) => e.name === "clear").handler(),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => Promise.all([SettingsStorage.delete("card_order"), SettingsStorage.delete("mono_cards_config")]),
                },
            ],
        })

        DBUserPresence.registerNewPresence({
            id: "StatementCache",
            name: $$("settings/storage/dbs/statement_cache"),
            description: $$("settings/storage/dbs/statement_cache/description"),
            icon: "account_balance_wallet",
            size: async () => {
                const db = await (await StatementStorage.statementDB()).onReady()
                const res = await db.getDBSize()
                return res
            },
            config: {
                changeable: false,
                display: true,
            },
            actions: [
                {
                    name: $$("settings/storage/actions/clear"),
                    handler: () => DBUserPresence.get("StatementCache").functions.find((e) => e.name === "clear").handler(),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => new Promise(async (resolve, reject) => {
                        try {
                            const db = await StatementStorage.statementDB()
                            await Promise.all((await db.getTablesList()).map(
                                (e) => db.OSTool(e).clear(),
                            ))
                            resolve()
                        } catch (e) {
                            reject()
                        }
                    }),
                },
                {
                    name: "auto-clean",
                    async handler() {
                        const db = await StatementStorage.statementDB()
                        await Promise.all((await db.getTablesList()).map(
                            (e) => async () => db.OSTool(e).clearPercent(0.5),
                        ))
                    },
                },
            ],
        })
    },
})
