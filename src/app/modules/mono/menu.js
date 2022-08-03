import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { CoreLoader, CoreLoaderResult } from "@Core/Init/CoreLoader"
import { Title } from "@Environment/Library/DOM/object"
import { Card, CardList } from "@Environment/Library/DOM/object/card"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import Tip from "@App/library/Tip"
import EaseOutCubic from "@DOMPath/Animation/Library/Timing/easeOutCubic"
import SlideInCSS from "@Environment/Library/Animations/SlideInCSS"
import delayAction from "@Core/Tools/objects/delayAction"
import LanguageCore from "@Core/Services/Language/core"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import Sleep from "@Core/Tools/objects/sleep"
import { ContextMenu } from "@Environment/Library/DOM/elements"
import Auth from "./services/Auth"
import PWA from "../main/PWA"

const lastChangelog = {
    version: PWA.version,
    get link() {
        return PWA.changelog || `https://sominemo.com/mono/help/release/${LanguageCore.language.info.code}/${this.version}`
    },
}

export default class MenuUI {
    static async Init() {
        Navigation.updateTitle($$("menu"))
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)

        const list = [
            {
                name: $$("statement"),
                icon: "account_balance_wallet",
                go: "statement",
                display: Auth.instance.authed,
            },
            {
                name: $$("currency"),
                icon: "assessment",
                go: "currency",
            },
            {
                name: $$("p4"),
                icon: "store",
                go: "partners",
            },
            {
                name: $$("settings"),
                icon: "settings",
                go: "settings",
            },
        ]

        w.render(new Title($$("menu")))

        w.render(new Card(
            new CardList(list.map((el) => {
                if ("display" in el) {
                    if (typeof el.display === "function" && !el.display()) return { content: null }
                    if (!el.display) return { content: null }
                }

                return {
                    content: new IconSide(el.icon, el.name, { style: { paddingRight: "10px" } }),
                    handler: (typeof el.go === "string"
                        ? () => { Navigation.url = { module: el.go } }
                        : el.go),
                }
            }), true),
        ))

        delayAction(async () => {
            const lastSeen = await SettingsStorage.getFlag("changelog_seen")
            if (lastSeen === lastChangelog.version) return

            const tip = new Tip({
                title: $$("menu/app_upgraded"),
                sub: $$("menu/see_whats_new"),
                icon: "new_releases",
                async onclick() {
                    window.open(lastChangelog.link, "_blank")
                    delayAction(() => tip.destructSelf())
                    await SettingsStorage.setFlag("changelog_seen", lastChangelog.version)
                },
                async context(event) {
                    ContextMenu({
                        event,
                        content: [
                            {
                                icon: "close",
                                title: $$("close"),
                                handler() {
                                    delayAction(() => tip.destructSelf())
                                    SettingsStorage.setFlag("changelog_seen", lastChangelog.version)
                                },
                            },
                        ],
                    })
                },
            })

            new SlideInCSS({
                renderAwait: true,
                minHeight: "120px",
                duration: 300,
                timingFunc: EaseOutCubic,
            }).apply(tip)

            await Sleep(1000)
            requestAnimationFrame(() => w.render(tip))
        })
    }
}

CoreLoader.registerTask({
    id: "menu_module",
    presence: "Menu",
    task() {
        Navigation.addModule({
            name: "Menu",
            id: "menu",
            callback() { MenuUI.Init() },
        })

        Navigation.InitNavigationError = () => {
            Navigation.url = { module: "menu" }
        }

        Navigation.defaultScreen = () => {
            Navigation.url = { module: "menu" }
        }

        Navigation.titleFallback = "monobank"

        return new CoreLoaderResult()
    },
})
