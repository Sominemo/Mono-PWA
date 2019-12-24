import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import Navigation from "@Core/Services/navigation"
import SettingsLayoutManager from "@Core/Services/Settings/user/manager"
import SettingsLayout from "@Core/Services/Settings/user/layout"
import { Title } from "@Environment/Library/DOM/object"
import { Card, CardList } from "@Environment/Library/DOM/object/card"
import { $$ } from "@Core/Services/Language/handler"
import Design from "@Core/Services/design"
import WindowManager from "@Core/Services/SimpleWindowManager"
import { CoreLoader } from "@Core/Init/CoreLoader"


export default class SettingsUI {
    static async Init() {
        Navigation.updateTitle($$("@settings"))
        const w = new WindowContainer()
        const l = SettingsLayoutManager.layout

        try {
            if (!(l instanceof SettingsLayout)) {
                throw new TypeError(`Incorrect Settings Layout applied of type ${typeof this._layout}`)
            }

            const path = Navigation.parse.params
            const tAct = (path.length > 0 ? path[0] : l.defaultAct)
            const actObj = l.getAct(tAct)

            if (!(typeof actObj === "object")) {
                w.clear()
                w.render(new Title("Oops!"))
                w.render(new Card(new CardList([
                    {
                        content: $$("@settings/errors/no_page"),
                    },

                    {
                        content: $$("@settings/actions/go_main"),
                        handler() { Navigation.url = { module: "settings" } },
                        style: {
                            background: Design.getVar("color-accent"),
                            color: Design.getVar("color-generic-inverted"),
                        },
                    },
                ])))
                return
            }

            w.render(await actObj.render())
            WindowManager.newWindow().append(w)
        } catch (e) {
            w.clear()
            w.render(new Title($$("unexpected_error")))
            w.render(new Card(new CardList([
                {
                    content: $$("@settings/errors/layout_failed"),
                },

                {
                    content: $$("@settings/actions/open_about"),
                    handler() { Navigation.url = { module: "about" } },
                    style: {
                        background: Design.getVar("color-accent"),
                        color: Design.getVar("color-generic-inverted"),
                    },
                },
            ])))

            throw e
        }
    }
}

CoreLoader.registerTask({
    id: "settings_module",
    presence: "Settings UI",
    task() {
        Navigation.addModule({
            name: "Settings",
            id: "settings",
            callback() { SettingsUI.Init() },
        })
    },
})
