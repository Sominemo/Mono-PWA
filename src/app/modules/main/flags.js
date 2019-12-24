/* global __PACKAGE_ANALYTICS */
import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import Navigation from "@Core/Services/navigation"
import { Title, Icon } from "@Environment/Library/DOM/object"
import { Card, CardContent } from "@Environment/Library/DOM/object/card"
import { $$ } from "@Core/Services/Language/handler"
import Design from "@Core/Services/design"
import { Button, SwitchLabel } from "@Environment/Library/DOM/object/input"
import App from "@Core/Services/app"
import DOM from "@DOMPath/DOM/Classes/dom"
import { SVG } from "@Environment/Library/DOM/basic"
import { CoreLoader } from "@Core/Init/CoreLoader"
import PWA from "./PWA"

export default class FlagsUI {
    static async Init() {
        Navigation.updateTitle($$("experiments"))
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)
        const testEnabled = !!await SettingsStorage.getFlag("test_field_enabled")
        Navigation.Current = {
            navMenu: [
                ...(testEnabled
                    ? [
                        {
                            icon: "markunread_mailbox",
                            title: "Test Field",
                            handler() {
                                Navigation.url = { module: "test" }
                            },
                        },
                    ] : []),
            ],
        }
        w.render(new Title($$("experiments")))
        w.render(new Card([
            new Title($$("@experiments/warning"), 3, {}, new Icon("warning",
                {
                    marginRight: ".2em",
                    fontSize: "1.5em",
                    color: Design.getVar("color-attention"),
                })),
            new CardContent($$("@experiments/harmful_actions")),
            new CardContent([
                new Button({
                    content: $$("@experiments/reload_page"),
                    handler() {
                        window.location.reload()
                    },
                }),
                new Button({
                    content: $$("@experiments/reset_flags"),
                    type: ["light"],
                    handler() {
                        SettingsStorage.reset("flags")
                        window.location.reload()
                    },
                }),
            ]),
        ]))
        const exps = []

        if (__PACKAGE_ANALYTICS) {
            if (!PWA.isWG) {
                exps.push({
                    title: "Отказаться от сбора данных",
                    about: `Отключить сервис Google Analytics и прекратить сбор деперсонифицированных данных,
которые используются для улучшения опыта использования (подробнее в меню "О программе" › "Дисклеймер").
Данная настройка включается автоматически, если в браузере включены Do Not Track запросы`,
                    id: "deny_analytics",
                })
            }
        }

        if (App.debug) {
            exps.push({
                title: "Показать меню «Эксперименты» в меню",
                about: "Добавляет эту страницу в меню настроек",
                id: "miscellaneous_in_settings",
            })
            exps.push({
                title: "Навигация с помощью клавиши TAB",
                about: `Симуляция навигации по приложению, где нажатие на TAB равноценно
переходу к следующему элементу, а нажатие Enter — клику по элементу`,
                id: "enable_tab_navigation",
            })
        }

        w.render(new Title($$("@experiments/list"), 2))
        exps.forEach(async (e) => {
            const re = await this.renderSwitch(e.title, e.about, e.id)
            return w.render(re)
        })

        if (exps.length === 0) this.EmptyExperiments(w)
    }

    static async EmptyExperiments(w) {
        const pic = require("@Resources/images/placeholders/experiments.svg")
        w.render(new DOM({
            new: "div",
            style: {
                padding: "20px 0",
            },
            content: [
                new SVG(pic, {
                    width: "30vmin",
                    margin: "auto",
                    display: "block",
                }),
                new DOM({
                    new: "div",
                    style: {
                        textAlign: "center",
                        marginTop: "20px",
                        fontFamily: Design.getVar("font-accent"),
                        fontSize: "20px",
                    },
                    content: $$("@experiments/no_exps_placeholder"),
                }),
            ],
        }))
    }

    static async renderSwitch(title, about, id) {
        const r = await SettingsStorage.getFlag(id)
        return new Card([
            new SwitchLabel(
                [r, (n) => {
                    SettingsStorage.setFlag(id, n)
                }],
                new DOM({
                    new: "div",
                    content: [
                        new DOM({ new: "div", content: title, style: { fontWeight: "500", fontSize: "20px" } }),
                        new DOM({ new: "div", content: id, style: { color: "lightgray", fontSize: "12px" } }),
                    ],
                    id: `flag-id-${id}`,
                }),
            ),
            new CardContent(about),
        ])
    }
}

CoreLoader.registerTask({
    id: "flags_module",
    presence: "Flags and experiments",
    task() {
        Navigation.addModule({
            name: "Flags",
            id: "flags",
            callback() { FlagsUI.Init() },
        })
    },
})
