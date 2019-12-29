import { CoreLoader } from "@Core/Init/CoreLoader"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import DOM from "@DOMPath/DOM/Classes/dom"
import { Title } from "@Environment/Library/DOM/object"
import BlockBox from "@App/library/blockBox"
import Navigation from "@Core/Services/navigation"
import { Button, ContentEditable } from "@Environment/Library/DOM/object/input"
import { Nav } from "@Environment/Library/DOM/buildBlock"
import { $$ } from "@Core/Services/Language/handler"
import { CardContent, Card } from "@Environment/Library/DOM/object/card"
import { Link } from "@Environment/Library/DOM/basic"
import Toast from "@Environment/Library/DOM/elements/toast"
import MonoAPI from "../API/clients/MonoAPI"

export default class MonoAuth {
    static instance = null

    static InitAuthBox() {
        let box
        const text = new DOM({
            new: "div",
            style: {
                display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between",
            },
        })
        text.render(new DOM({
            new: "div",
            content: [
                new Title("Auth"),
                new CardContent((MonoAuth.instance.authed
                    ? "You are authorized already. What would you like to do?"
                    : "Link the app to your Monobank profile to get statement")),
            ],
        }))
        text.render(new DOM({
            new: "div",
            content: [
                new Button({
                    content: "Don't auth",
                    async handler() {
                        await SettingsStorage.set("token", "")
                        MonoAuth.updateIcons()
                        Navigation.defaultScreen()
                        box.close()
                    },
                }),
                new Button({
                    content: "I have a token",
                    handler() {
                        MonoAuth.enterToken(box)
                    },
                }),
                new Button({
                    content: "Auth with Mono app",
                    type: ["light"],
                    handler() {
                        Toast.add("In development")
                    },
                }),
            ].map((e) => new DOM({ new: "div", content: e, style: { display: "flex", flexDirection: "column" } })),
            style: {
                display: "flex",
                flexDirection: "column",
                margin: "10px 0 0 10px",
                textAlign: "center",
            },
        }))


        box = new BlockBox(text)

        return box
    }

    static enterToken(boxUp = null) {
        let token = ""
        let box
        const text = new DOM({
            new: "div",
            style: {
                display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between",
            },
        })
        text.render(new DOM({
            new: "div",
            content: [
                new Title("Enter your token"),
                new CardContent([
                    "You can get it at ",
                    new Link("https://api.monobank.ua", "api.monobank.ua"),
                ]),
            ],
        }))
        text.render(new DOM({
            new: "div",
            content: [
                new Card(new CardContent(new ContentEditable({
                    placeholder: "Token",
                    change(t) { token = t },
                    onRendered(ev, me) {
                        setTimeout(() => {
                            me.focus()
                        }, 0)
                    },
                })), { style: { marginRight: "20px", textAlign: "start" } }),
                new Button({
                    content: "Save",
                    async handler() {
                        try {
                            await MonoAuth.instance.clientInfo(true, token)
                        } catch (e) {
                            Toast.add("Failed to proof the token")
                            return
                        }
                        await SettingsStorage.set("token", token)
                        Toast.add("Saved")
                        MonoAuth.updateIcons()
                        Navigation.defaultScreen()
                        box.close()
                        if (boxUp) boxUp.close()
                    },
                }),
                new Button({
                    content: "Cancel",
                    type: ["light"],
                    async handler() {
                        box.close()
                    },
                }),
            ].map((e) => new DOM({ new: "div", content: e, style: { display: "flex", flexDirection: "column" } })),
            style: {
                display: "flex",
                flexDirection: "column",
                margin: "10px 0 0 10px",
                textAlign: "center",
            },
        }))
        box = new BlockBox(text)

        return box
    }

    static updateIcons() {
        if (MonoAuth.instance.authed) {
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
        MonoAuth.instance = new MonoAPI(await SettingsStorage.get("token") || null)
    }
}

CoreLoader.registerTask({
    id: "auth-loader",
    presence: "Auth",
    async task() {
        await MonoAuth.reloadInstance()
        MonoAuth.updateIcons()
        Navigation.addModule({
            name: "Auth",
            id: "oldauth",
            callback() { MonoAuth.InitAuthBox() },
        })
    },
})
