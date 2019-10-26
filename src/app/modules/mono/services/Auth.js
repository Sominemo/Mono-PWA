import { API } from "@App/tools/API"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { Nav } from "@Environment/Library/DOM/buildBlock"
import { CoreLoader } from "@Core/Init/CoreLoader"
import MonoAPI from "../API/clients/MonoAPI"
import MonoCorpAPI from "../API/clients/MonoCorpAPI"

export default class Auth {
    __instance = null

    static get instance() {
        return this.__instance
    }

    static set instance(s) {
        if (!(s instanceof API)) throw new TypeError("API instance expected")

        this.__instance = s
    }

    static updateIcons() {
        if (Auth.instance.authed) {
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

    static async reloadInstance() {
        const [token, domain] = await Promise.all([SettingsStorage.get("token"), SettingsStorage.get("auth_domain")])
        if (!domain) Auth.instance = new MonoAPI(token || null)
        else {
            Auth.instance = new MonoCorpAPI(token, `${domain}/request`)
        }
        this.updateIcons()
    }
}

CoreLoader.registerTask({
    id: "auth-loader",
    presence: "Auth",
    async task() {
        await Auth.reloadInstance()
        Auth.updateIcons()
    },
})
