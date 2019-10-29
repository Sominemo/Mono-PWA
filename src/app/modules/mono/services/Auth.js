import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { Nav } from "@Environment/Library/DOM/buildBlock"
import { CoreLoader } from "@Core/Init/CoreLoader"
import DBTool from "@Core/Tools/db/DBTool"
import hashCode from "@Core/Tools/transformation/text/hashCode"
import MonoAPI from "../API/clients/MonoAPI"
import MonoCorpAPI from "../API/clients/MonoCorpAPI"
import MonoAnonymousAPI from "../API/clients/MonoAnonymousAPI"

export default class Auth {
    static _instances = new Map()

    static get all() {
        return Array.from(this._instances.values())
    }

    static get authed() {
        const i = this.all
        return i.filter(ir => ir.authed)
    }

    static get isAnyAuthed() {
        const i = this.all
        return i.some(ir => ir.authed)
    }

    static get instance() {
        const self = this
        function fallback() {
            const authList = self.authed
            if (authList.length > 0) {
                const corp = self.all.find(e => e instanceof MonoCorpAPI)
                if (corp) {
                    return corp
                }
                return authList[0]
            }
            return self.all[0]
        }

        if (this._mainInstance === null) return fallback()
        return this.getInstanceByID(this._mainInstance) || fallback()
    }

    static _mainInstance = null

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
                    name() { return $$("@p4/partners") },
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
        if (this._instances.get(id)) {
            (await this.accountSettingsDB()).put({ name: "default", value: id })
        }
    }

    static async resetMainInstance(id) {
        if (this._instances.get(id)) {
            (await this.accountSettingsDB()).delete("default")
        }
    }

    static async getMainInstance() {
        const id = (await this.accountSettingsDB()).get("default")
        if (!id) return null
        return id.value
    }

    static async initInstances() {
        const accounts = await (await this.accountsDB()).getAll()
        this._instances.clear()
        await Promise.all(accounts.map(async (account) => {
            const instance = await this.genInstance(account)
            this._instances.set(account.id, instance)
        }))

        if (this._instances.size === 0) {
            this._instances.set(0, await this.genInstance({ settings: { type: "anon" }, id: 0 }))
        }

        this._mainInstance = await this.getMainInstance()
        this.updateIcons()
    }

    static async addInstance(settings) {
        await (await this.accountsDB()).put({ settings, id: hashCode(JSON.stringify(settings)) })
        this.initInstances()
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
        this.initInstances()
    }

    static getInstanceByID(id) {
        return this._instances.get(id)
    }

    static async genInstance(account) {
        const { settings } = account
        let instance

        if (settings.type === "corp") {
            instance = new MonoCorpAPI(settings.token, settings.domain, account.id)
        } else if (settings.type === "user") {
            instance = new MonoAPI(settings.token, account.id)
        } else {
            instance = new MonoAnonymousAPI(account.id)
        }

        return instance
    }

    static _db = new DBTool("AuthStorage", 1, {
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
        const db = await this._db.onReady()
        return db.OSTool("accounts")
    }

    static async accountSettingsDB() {
        const db = await this._db.onReady()
        return db.OSTool("settings")
    }
}

CoreLoader.registerTask({
    id: "auth-loader",
    presence: "Auth",
    async task() {
        await Auth.initInstances()
    },
})
