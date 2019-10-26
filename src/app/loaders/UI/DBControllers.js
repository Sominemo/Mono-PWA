import DBUserPresence from "@Core/Services/DBUserPresence"
import { $$ } from "@Core/Services/Language/handler"
import Report from "@Core/Services/report"
import download from "@App/tools/interaction/download"
import { CoreLoader } from "@Core/Init/CoreLoader"
import OfflineCache from "@App/modules/mono/services/OfflineCache"

CoreLoader.registerTask({
    id: "db-presence",
    presence: "Register DBs",
    task() {
        DBUserPresence.registerNewPresence({
            id: "LogData",
            name: $$("@settings/storage/dbs/logs"),
            description: $$("@settings/storage/dbs/logs/description"),
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
                    name: $$("@settings/storage/actions/clear"),
                    handler: () => DBUserPresence.get("LogData").functions.find(e => e.name === "clear").handler(),
                },
                {
                    name: $$("@settings/storage/actions/export"),
                    handler: () => DBUserPresence.get("LogData").functions.find(e => e.name === "export").handler(),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => new Promise(async (resolve, reject) => {
                        const db = await Report.DBConnection()
                        db.getObjectStore("console-output", true)
                            .then(a => a.clear())
                            .then(() => resolve())
                            .catch(e => reject(e))
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
            name: $$("@settings/storage/dbs/offline_cache"),
            description: $$("@settings/storage/dbs/offline_cache/description"),
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
                    name: $$("@settings/storage/actions/clear"),
                    handler: () => DBUserPresence.get("OfflineCache").functions.find(e => e.name === "clear").handler(),
                },
            ],
            functions: [
                {
                    name: "clear",
                    handler: () => new Promise(async (resolve, reject) => {
                        const db = await OfflineCache.DBConnection()
                        db.getObjectStore("main", true)
                            .then(a => a.clear())
                            .then(() => resolve())
                            .catch(e => reject(e))
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
    },
})
