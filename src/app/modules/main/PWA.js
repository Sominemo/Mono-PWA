/* global __PACKAGE_ANALYTICS */

import App from "@Core/Services/app"
import { SVG } from "@Environment/Library/DOM/basic"
import { Card, CardList } from "@Environment/Library/DOM/object/card"
import { Title, TwoSidesWrapper } from "@Environment/Library/DOM/object"
import { $$ } from "@Core/Services/Language/handler"
import Navigation from "@Core/Services/navigation"
import DOM from "@DOMPath/DOM/Classes/dom"
import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import getCounter from "@Core/Tools/objects/counter"
import AlignedContent from "@Environment/Library/DOM/object/AlignedContent"
import { CoreLoader } from "@Core/Init/CoreLoader"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import { SettingsActLink } from "./settings"

export default class PWA extends App {
    static get isWG() {
        return this.buildFlag("wg")
    }

    static get analyticsAllowed() {
        if (!this.isWG && this.analyticsDenyCache) return false
        return __PACKAGE_ANALYTICS
    }

    static analyticsDenyCache = false

    static InitAboutScreen() {
        Navigation.updateTitle($$("about/app"))
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)

        const counter = getCounter()
        function openFlags() {
            const r = counter()
            if (r < 4) return
            Navigation.url = { module: "flags" }
        }

        w.render(new Title($$("about/app")))
        w.render(new Card(
            new AlignedContent([
                new DOM({
                    new: "div",
                    content: new SVG(require("@Resources/images/logo/vector.svg"), { height: "60px", margin: "20px", cursor: "pointer" }),
                    events: [
                        {
                            event: "click",
                            handler: openFlags,
                        },
                    ],
                    style: {
                        display: "flex",
                    },
                }),
                [
                    new Title(this.appName, 2, { margin: 0 }),
                    this.version,
                ],
            ]),
        ))

        const infocard = new Card(new CardList(
            [
                {
                    content: new SettingsActLink([
                        () => this.disclaimer(),
                        $$("about/disclaimer_title")]),
                    disableWrapper: true,
                },
            ],
        ))
        w.render(infocard)

        w.render(new Card(new CardList(
            [
                { content: new TwoSidesWrapper($$("about/build_date"), this.buildDate) },
                { content: new TwoSidesWrapper($$("about/branch"), this.branch) },
                { content: new TwoSidesWrapper($$("about/build_flags"), this.buildFlags.join(", ")) },
                ...("Windows" in window ? [{ content: new TwoSidesWrapper("WinRT", "true") }] : []),
            ],
            {}, true,
        )))
    }

    static disclaimer() {
        Prompt({
            title: $$("about/disclaimer_title"),
            text: $$("about/disclaimer"),
            buttons: [
                {
                    content: $$("close"),
                    handler: "close",
                },
            ],
        })
    }
}

CoreLoader.registerTask({
    id: "about_app_module",
    presence: "About App Screen",
    task() {
        Navigation.addModule({
            name: "About",
            id: "about",
            callback() { PWA.InitAboutScreen() },
        })
    },
})
