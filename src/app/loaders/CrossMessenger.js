/*  eslint-disable no-restricted-globals */
/* globals __TRUSTED_ORIGINS */
import Listeners from "@Core/Services/Listeners"
import Auth from "@App/modules/mono/services/Auth"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import { Report } from "@Core/Services/Report"
import DBTool from "@Core/Tools/db/DBTool"
import ObjectStoreTool from "@Core/Tools/db/ObjectStoreTool"

const trustedOrigins = __TRUSTED_ORIGINS

async function messageListener(m) {
    if (m.data.type === "transfer") {
        if (!trustedOrigins.includes(m.origin)) {
            top.postMessage({ type: "error", info: "Недовірене джерело команд", command: m.data }, "*")
            return
        }

        try {
            if (m.data.command === "clear") {
                let dbs = [{ name: "AuthStorage" }, { name: "OfflineCache" }, { name: "SettingsStorage" }, { name: "StatementStorage" }]
                if ("databases" in indexedDB) {
                    dbs = await window.indexedDB.databases()
                }
                await Promise.all(dbs.map(async (db) => new Promise(async (resolve, reject) => {
                    try {
                        const dbase = new DBTool(db.name, null)
                        const osList = await dbase.getTablesList()
                        await Promise.all(osList.map((r) => new ObjectStoreTool(dbase, r).clear()))
                        resolve()
                    } catch (e) {
                        reject(e)
                    }
                })))
            } else if (m.data.command === "import-accounts") {
                const accounts = (await Auth.accountsDB())
                await Promise.all(m.data.accounts.map((item) => accounts.put(item)))

                const settings = (await Auth.accountSettingsDB())
                await Promise.all(m.data.settings.map((item) => settings.put(item)))
            } else if (m.data.command === "import-settings") {
                const settings = (await SettingsStorage.db())
                    .OSTool(SettingsStorage.ObjectStoreNames[0])
                await Promise.all(m.data.settings.map((item) => settings.put(item)))

                const flags = (await SettingsStorage.db())
                    .OSTool(SettingsStorage.ObjectStoreNames[1])
                await Promise.all(m.data.flags.map((item) => flags.put(item)))
            }
        } catch (e) {
            Report.add(e, ["crossMessaging.commandError"])
            top.postMessage({ type: "error", info: String(e), command: m.data }, m.origin)
        }

        top.postMessage({ type: "success", command: m.data }, m.origin)
    }
}

export default function crossMessenger() {
    CoreLoader.registerTask({
        id: "cross-messenger",
        async: true,
        presence: "Message Reciever",
        async task() {
            if (Object.is(self, top)) {
                SettingsStorage.setFlag("not_iframe_start", true)
                return new CoreLoaderSkip()
            }

            Listeners.add(window, "message", messageListener)
            top.postMessage({
                type: "channel-established",
                isFirst: !(await SettingsStorage.getFlag("not_iframe_start")),
            }, "*")
            return new CoreLoaderResult()
        },
    })
}
