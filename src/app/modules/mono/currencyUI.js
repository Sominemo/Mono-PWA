import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { CoreLoader } from "@Core/Init/CoreLoader"
import { Title } from "@Environment/Library/DOM/object"
import loadingPopup from "@App/library/loadingPopup"
import {
    Card, CardList,
} from "@Environment/Library/DOM/object/card"
import DOM from "@DOMPath/DOM/Classes/dom"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import { ContentEditable, RadioLabel, TextInput } from "@Environment/Library/DOM/object/input"
import Toast from "@Environment/Library/DOM/elements/toast"
import Sleep from "@Core/Tools/objects/sleep"
import { APIError } from "@App/tools/API"
import WarningConstructorButton from "@Environment/Library/DOM/object/warnings/WarningConstructorButton"
import reflect from "@Core/Tools/objects/reflect"
import SlideOut from "@Environment/Library/Animations/slideOut"
import EaseOutCubic from "@DOMPath/Animation/Library/Timing/easeOutCubic"
import Auth from "./services/Auth"
import Money from "./API/classes/Money"
import OfflineCache from "./services/OfflineCache"
import parseCurrencyRAW from "./API/parsers/currency"

export default class CurrencyUI {
    static async Init() {
        const self = this
        const w = new WindowContainer()
        const b = new DOM({ new: "div" })
        WindowManager.newWindow().append(w)

        async function retry(caller) {
            const text = new DOM({
                new: "div",
                content: $$("@currency/refreshing"),
                style: {
                    padding: "15px",
                },
            })
            const [cur, toast] = (await Promise.all(
                [
                    Auth.instance.currency(true),
                    Toast.add(text, -1),
                ].map(reflect),
            )).map(e => e.data)

            if (cur instanceof APIError || cur instanceof Error) {
                text.clear(new DOM({ type: "text", new: $$("@currency/error_refresh") }))
            } else {
                if (typeof caller === "function") await caller()
                b.clear()
                self.renderList(b, cur)
                text.clear(new DOM({ type: "text", new: $$("@currency/refreshed") }))
            }
            await Sleep(3000)
            toast.pop()
        }

        Navigation.Current = {
            navMenu: [
                {
                    icon: "refresh",
                    title: $$("@currency/refresh"),
                    handler: retry,
                },
            ],
        }

        w.render(new Title($$("@currency")))
        const loader = loadingPopup()
        let cur
        let cache = false

        try {
            try {
                cur = await Auth.instance.currency()
            } catch (e) {
                cur = parseCurrencyRAW(await OfflineCache.getCurrencies())
                cache = true
            }
        } catch (e) {
            cur = await Auth.instance.currency(true)
        }

        if (cur !== undefined) {
            this.renderList(b, cur, (cache ? retry : false))
        } else {
            b.render(new WarningConstructorButton({
                type: 3,
                button: {
                    content: $$("@currencies/retry"),
                    handler: () => retry(),
                },
                title: $$("@currencies/fetch_fail"),
                content: $$("@currencies/try_later"),
            }))
        }
        w.render(b)
        loader.close()
    }

    static renderList(w, cur, cache = false) {
        const general = []
        const cross = []

        if (cache) {
            const warnCache = new WarningConstructorButton({
                type: 2,
                button: {
                    content: $$("@currency/refresh"),
                    handler: () => cache(() => new SlideOut({
                        duration: 100,
                        timingFunc: EaseOutCubic,
                    }).apply(warnCache)),
                },
                title: $$("@currency/cached_title"),
                content: `${$$("@currency/cache_for")} ${cur[0].date.toLocaleDateString()} ${cur[0].date.toLocaleTimeString()}`,
            })
            w.render(warnCache)
        }

        function converter(data) {
            let recalc
            let sell = true
            let amount = 1
            const result = new ContentEditable({
                editable: false,
                placeholder: $$("@currency/result"),
                content: String(data.rateSell),
            })
            const input = new TextInput({
                events: [
                    {
                        event: "input",
                        handler: () => recalc(),
                    },
                ],
                set: {
                    min: "0.01",
                    type: "number",
                    step: "0.01",
                    placeholder: $$("@currency/amount"),
                    value: "1.00",
                },
            })

            const chooser = new RadioLabel([
                {
                    handler(s) {
                        if (!s) return
                        sell = true
                        recalc()
                    },
                    content: data.currencyA.code,
                    selected: true,
                },
                {
                    handler(s) {
                        if (!s) return
                        sell = false
                        recalc()
                    },
                    content: data.currencyB.code,
                },
            ], [], false, true)

            recalc = (value) => {
                amount = Number.parseFloat(input.currentValue)
                if (Number.isNaN(amount)) return
                result.emitEvent(
                    "editValue",
                    {
                        content:
                            data.exchange(
                                Money.float(
                                    amount,
                                    (sell
                                        ? data.currencyA
                                        : data.currencyB),
                                ),
                            ).float.toFixed(2),
                    },
                )
            }
            recalc()


            Prompt({
                title: $$("@currency/convert"),
                text: new DOM({
                    new: "div",
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    },
                    content: [
                        input,
                        new DOM({
                            new: "div",
                            content: [`${$$("@currency/sell")}:`, ...chooser],
                            style: {
                                display: "flex",
                                justifyContent: "start",
                                alignItems: "center",
                            },
                        }),
                        result,
                    ],
                }),
                buttons: [
                    {
                        content: $$("close"),
                        handler: "close",
                    },
                ],
                centredTitle: true,
            })
        }

        cur.forEach((element) => {
            (element.cross ? cross : general).push(
                {
                    content: new DOM(
                        {
                            new: "div",
                            style: {
                                display: "grid",
                                gridTemplateColumns: (element.cross ? "1fr 1fr" : "2fr 1fr 1fr"),
                            },
                            content: [
                                (element.currencyB.code === "UAH" ? element.currencyA.code : `${element.currencyA.code}/${element.currencyB.code}`),
                                ...(element.cross
                                    ? [String(element.rateBuy)]
                                    : [String(element.rateBuy), String(element.rateSell)])
                                    .map(e => new DOM({
                                        new: "div",
                                        content: e,
                                        style: {
                                            textAlign: (element.cross ? "right" : "center"),
                                        },
                                    })),
                            ],
                        },
                    ),
                    handler() {
                        converter(element)
                    },
                },
            )
        })

        if (general.length) {
            w.render(
                new Card(
                    new CardList([
                        {
                            content: new DOM(
                                {
                                    new: "div",
                                    style: {
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr 1fr",
                                        fontWeight: "500",
                                    },

                                    content: [
                                        new DOM({
                                            new: "div",
                                            content: $$("@currency/one"),
                                        }),
                                        new DOM({
                                            new: "div",
                                            content: $$("@currency/buy"),
                                            style: { textAlign: "center" },
                                        }),
                                        new DOM({
                                            new: "div",
                                            content: $$("@currency/sell"),
                                            style: { textAlign: "center" },
                                        }),
                                    ],
                                },
                            ),
                        },
                        ...general,
                    ], true),
                ),
            )
        }

        if (cross.length) {
            w.render(new Title($$("@currency/payment_systems"), 2))
            w.render(
                new Card(
                    new CardList([
                        {
                            content: new DOM(
                                {
                                    new: "div",
                                    style: {
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        fontWeight: "500",
                                    },
                                    content: [
                                        new DOM({
                                            new: "div",
                                            content: $$("@currency/one"),
                                        }),
                                        new DOM({
                                            new: "div",
                                            content: $$("@currency/numbers"),
                                            style: { textAlign: "right" },
                                        }),
                                    ],
                                },
                            ),
                        },

                        ...cross,
                    ], true),
                ),
            )
        }

        return w
    }
}


CoreLoader.registerTask({
    id: "currency_module",
    presence: "Currency",
    task() {
        Navigation.addModule({
            name: "Currency",
            id: "currency",
            callback() { CurrencyUI.Init() },
        })
    },
})
