import Block from "@Environment/Library/DOM/elements/block"
import DOM from "@DOMPath/DOM/Classes/dom"
import { $$ } from "@Core/Services/Language/handler"
import { Icon } from "@Environment/Library/DOM/object"
import Toast from "@Environment/Library/DOM/elements/toast"
import LanguageCore from "@Core/Services/Language/core"
import PWA from "@App/modules/main/PWA"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import randomFromArray from "@Core/Tools/objects/randomFromArray"
import Help from "@App/modules/main/Help"
import SetupError from "../../setup/SetupError"
import SetupFramework from "../../setup/SetupFramework"

export default class HintsWidget {
    static tipsList = [
        {
            name: "pushes",
            icon: "notifications",
            article: "dummy",
        },
        {
            name: "updates",
            icon: "new_releases",
            article: "dummy",
        },
        {
            name: "change_order",
            icon: "credit_card",
            article: "dummy",
        },
        {
            name: "offline_statement",
            icon: "offline_pin",
            article: "dummy",
        },
        {
            name: "convert_currencies",
            icon: "swap_horiz",
            article: "dummy",
        },
        {
            name: "find_currencies",
            icon: "search",
            article: "dummy",
        },
        {
            name: "partner_sections",
            icon: "filter_list",
            article: "dummy",
        },
    ]

    static greetings() {
        const hour = new Date().getHours()
        if (hour >= 0 && hour <= 5) return $$("greeting/night")
        if (hour >= 6 && hour <= 11) return $$("greeting/morning")
        if (hour >= 11 && hour <= 18) return $$("greeting/afternoon")
        if (hour >= 19 && hour <= 23) return $$("greeting/evening")
        return $$("greeting/generic")
    }

    static async hint(disabled) {
        if (!disabled.changelog) {
            const lastChangelog = {
                version: PWA.version,
                get link() {
                    return PWA.changelog || `https://sominemo.com/mono/help/release/${LanguageCore.language.info.code}/${this.version}`
                },
            }
            const lastSeen = await SettingsStorage.getFlag("changelog_seen")
            if (lastSeen !== lastChangelog.version) {
                return {
                    icon: "new_releases",
                    title: $$("menu/app_upgraded"),
                    content: $$("menu/see_whats_new"),
                    type: $$("message"),
                    handler() {
                        window.open(lastChangelog.link, "_blank")
                        SettingsStorage.setFlag("changelog_seen", lastChangelog.version)
                    },
                }
            }
        }

        if (!disabled.tips) {
            const tip = randomFromArray(this.tipsList)
            return {
                icon: tip.icon,
                title: $$(`hints/list/${tip.name}/title`),
                content: $$(`hints/list/${tip.name}/info`),
                type: $$("tip"),
                handler() {
                    Help.open(tip.article)
                },
            }
        }

        return {
            icon: "emoji_objects",
            title: this.greetings(),
            content: $$("dashboard/hints/will_be_soon"),
            type: "",
        }
    }

    constructor({ data: { disabled = {} } = {} }) {
        const self = this.constructor
        const colors = { main: "#ffc107", light: "#ffe082" }

        return new Block({
            data: [],
            colors,
            icon: "emoji_objects",
            name: $$("dashboard/hints"),
            size: { x: 2, y: 1 },
            async render() {
                const hint = await self.hint(disabled)
                return {
                    content: [
                        new DOM({
                            new: "div",
                            style: {
                                display: "flex",
                                alignItems: "center",
                                padding: ".5em",
                            },
                            content: [
                                new Icon(hint.icon, { fontSize: "3em", color: colors.main }),
                                new DOM({
                                    new: "div",
                                    style: {
                                        display: "flex",
                                        flexDirection: "column",
                                        textAlign: "initial",
                                        marginLeft: ".5em",
                                        flexGrow: "1",
                                        fontSize: "1.1em",
                                    },
                                    content: [
                                        new DOM({
                                            new: "div",
                                            content: hint.title,
                                        }),
                                        new DOM({
                                            new: "div",
                                            content: hint.content,
                                            style: {
                                                fontSize: ".7em",
                                                opacity: ".6",
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        new DOM({
                            new: "div",
                            content: hint.type,
                            style: {
                                position: "absolute",
                                right: "0",
                                bottom: "0",
                                margin: "1em",
                                textTransform: "uppercase",
                                fontSize: ".5em",
                                color: colors.main,
                            },
                        }),
                    ],
                    style: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        ...(typeof hint.handler === "function" ? { cursor: "pointer" } : {}),
                        flexDirection: "column",
                    },
                    shadow: colors.main,
                    events: [
                        {
                            event: "click",
                            handler() {
                                if (typeof hint.handler === "function") hint.handler()
                            },
                        },
                    ],
                }
            },
        })
    }

    static icon = "emoji_objects"

    static name = $$("dashboard/hints")

    static setup({ checkFit }) {
        return new SetupFramework({
            name: this.name,
            func: (data, state) => {
                if (!checkFit(2, 1)) {
                    Toast.add($$("dashboard/cant_fit"))
                    throw new SetupError("This widget doesn't fit")
                }

                return {}
            },
        }, checkFit)
    }
}
