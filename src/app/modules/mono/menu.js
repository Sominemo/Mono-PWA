import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { CoreLoader } from "@Core/Init/CoreLoader"
import { Title } from "@Environment/Library/DOM/object"
import { Card, CardList } from "@Environment/Library/DOM/object/card"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import Auth from "./services/Auth"

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
    },
})
