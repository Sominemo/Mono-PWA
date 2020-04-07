import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { Nav } from "@Environment/Library/DOM/buildBlock"
import DBTool from "@Core/Tools/db/DBTool"
import hashCode from "@Core/Tools/transformation/text/hashCode"
import PWA from "@App/modules/main/PWA"
import delayAction from "@Core/Tools/objects/delayAction"
import NotificationManager from "@Core/Services/Push/NotificationManager"
import MonoAPI from "../API/clients/MonoAPI"
import MonoCorpAPI from "../API/clients/MonoCorpAPI"
import MonoAnonymousAPI from "../API/clients/MonoAnonymousAPI"
import StatementStorage from "./StatementStorage"
import OfflineCache from "./OfflineCache"

export default class Auth {
    static #instances = new Map()

    static inited = false

    static get all() {
        return Array.from(this.#instances.values())
    }

    static get authed() {
        const i = this.all
        return i.filter((ir) => ir.authed)
    }

    static get isAnyAuthed() {
        const i = this.all
        return i.some((ir) => ir.authed)
    }

    static get instance() {
        const self = this
        function fallback() {
            const authList = self.authed
            if (authList.length > 0) {
                const corp = self.all.find((e) => e instanceof MonoCorpAPI)
                if (corp) {
                    return corp
                }
                return authList[0]
            }
            return self.all[0]
        }

        if (this.#mainInstance === null) return fallback()
        return this.getInstanceByID(this.#mainInstance) || fallback()
    }

    static #mainInstance = null

    static updateIcons() {
        if (this.isAnyAuthed) {
            Nav.config = [
                {
                    name() { return $$("statement") },
                    icon: "account_balance_wallet",
                    id: "statement",
                    handler: () => {
                        Navigation.url = {
                            module: "statement",
                            params: {},
                        }
                    },
                },
                {
                    name() { return $$("currency") },
                    icon: "assessment",
                    id: "currency",
                    handler: () => {
                        Navigation.url = {
                            module: "currency",
                            params: {},
                        }
                    },
                },
                {
                    name() { return $$("menu") },
                    icon: "menu",
                    id: "menu",
                    handler: () => {
                        Navigation.url = {
                            module: "menu",
                            params: {},
                        }
                    },
                },
            ]
        } else {
            Nav.config = [
                {
                    name() { return $$("currency") },
                    icon: "assessment",
                    id: "currency",
                    handler: () => {
                        Navigation.url = {
                            module: "currency",
                            params: {},
                        }
                    },
                },
                {
                    name() { return $$("p4/partners") },
                    icon: "store",
                    id: "partners",
                    handler: () => {
                        Navigation.url = {
                            module: "partners",
                            params: {},
                        }
                    },
                },
                {
                    name() { return $$("menu") },
                    icon: "apps",
                    id: "menu",
                    handler: () => {
                        Navigation.url = {
                            module: "menu",
                            params: {},
                        }
                    },
                },
            ]
        }

        Nav.updateHTML()
    }

    static async setMainInstance(id) {
        if (this.#instances.get(id)) {
            (await this.accountSettingsDB()).put({ name: "default", value: id })
        }
    }

    static async resetMainInstance(id) {
        if (this.#instances.get(id)) {
            (await this.accountSettingsDB()).delete("default")
        }
    }

    static async getMainInstance() {
        const id = (await this.accountSettingsDB()).get("default")
        if (!id) return null
        return id.value
    }

    static async updateName(id, name) {
        const settings = await this.findInstanceSettings(id)
        this.updateInstance(id, { ...settings, name: `${name}` })
    }

    static async updatePushEndpoint(id, endpoint) {
        const settings = await this.findInstanceSettings(id)
        if (!("notificationServer" in settings)) throw new Error("This instance does not support notifications")
        settings.notificationServer.endpoint = endpoint
        this.updateInstance(id, settings)
    }

    static async updateInstance(id, settings) {
        if (id === 0) return
        await (await this.accountsDB()).put({ settings, id })
        this.initInstances()
    }

    static waitList = []

    static get waitListReady() {
        return Promise.all(this.waitList)
    }

    static async initInstances() {
        const accounts = await (await this.accountsDB()).getAll()
        this.#instances.clear()
        NotificationManager.reset()
        await Promise.all(accounts.map(async (account) => {
            const instance = await this.genInstance(account)
            if ("push" in instance) {
                this.waitList.push(instance.push)
            }
            this.#instances.set(account.id, instance)
        }))

        if (this.#instances.size === 0) {
            this.#instances.set(0, await this.genInstance({ settings: { type: "anon" }, id: 0 }))
        }

        this.#mainInstance = await this.getMainInstance()
        this.inited = true
        StatementStorage.syncAccountStorageList()
        this.updateIcons()

        if (PWA.analyticsAllowed) {
            delayAction(() => {
                const accountsCount = Auth.all.filter(
                    (obj, pos, arr) => arr.map((mapObj) => mapObj.clientId)
                        .indexOf(obj.clientId) === pos,
                ).length

                window.gtag("set", { user_properties: { bank_accounts_count: accountsCount } })
            })
        }

        this.onInitResolve()
    }

    static onInitResolve = () => { }

    static onInit = new Promise((resolve) => { this.onInitResolve = resolve })

    static async addInstance(settings, accountsCache = [], wait = false) {
        const id = hashCode(JSON.stringify(settings))
        await (await this.accountsDB()).put({ settings, id })
        await OfflineCache.updateAccounts(id, accountsCache)
        if (wait) {
            await this.initInstances()
        } else {
            this.initInstances()
        }
        return id
    }

    static async findInstanceSettings(id) {
        const data = await (await this.accountsDB()).get(id)
        if (data) {
            return data.settings
        }
        return undefined
    }

    static async destroyInstance(id) {
        await (await this.accountsDB()).delete(id)
        await OfflineCache.destroyAccounts(id)
        await this.initInstances()
    }

    static getInstanceByID(id) {
        return this.#instances.get(id)
    }

    static async genInstance(account) {
        const { settings } = account
        let instance

        if (settings.type === "corp") {
            instance = new MonoCorpAPI(
                settings.token,
                settings.domain,
                settings.clientId,
                account.id,
                settings.name,
                settings.notificationServer || false,
            )
        } else if (settings.type === "user") {
            instance = new MonoAPI(settings.token, settings.clientId, account.id, settings.name)
        } else {
            instance = new MonoAnonymousAPI(account.id)
        }

        return instance
    }

    static db = new DBTool("AuthStorage", 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (oldVersion === 0) {
                db.createObjectStore("accounts", {
                    keyPath: "id",
                })
                db.createObjectStore("settings", {
                    keyPath: "name",
                })
            }
        },
    })

    static async accountsDB() {
        const db = await this.db.onReady()
        return db.OSTool("accounts")
    }

    static async accountSettingsDB() {
        const db = await this.db.onReady()
        return db.OSTool("settings")
    }
}
