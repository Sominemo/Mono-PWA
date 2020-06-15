import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { CoreLoader } from "@Core/Init/CoreLoader"
import { Title, Icon } from "@Environment/Library/DOM/object"
import loadingPopup from "@App/library/loadingPopup"
import DOM from "@DOMPath/DOM/Classes/dom"
import Toast from "@Environment/Library/DOM/elements/toast"
import Sleep from "@Core/Tools/objects/sleep"
import { APIError, API } from "@App/tools/API"
import WarningConstructorButton from "@Environment/Library/DOM/object/warnings/WarningConstructorButton"
import reflect from "@Core/Tools/objects/reflect"
import SlideOut from "@Environment/Library/Animations/slideOut"
import EaseOutCubic from "@DOMPath/Animation/Library/Timing/easeOutCubic"
import { Card } from "@Environment/Library/DOM/object/card"
import FadeIn from "@Environment/Library/Animations/fadeIn"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import SlideOutCSS from "@Environment/Library/Animations/SlideOutCSS"
import SlideInCSS from "@Environment/Library/Animations/SlideInCSS"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import { SelectInput } from "@Environment/Library/DOM/object/input"
import { Align } from "@Environment/Library/DOM/style"
import Design from "@Core/Services/design"
import OfflineCache from "./services/OfflineCache"

export default class PartnersUI {
    static domain = "https://goose.ml"

    static partnersMethod = "/api/credit/divided-payment/partners"

    static categories = new Map()

    static async partnersGetter() {
        try {
            if (API.offlineMode) throw new APIError(0, { type: 1 })
            const r = await fetch(`${this.domain}${this.partnersMethod}`)
            const j = await r.json()
            OfflineCache.savePartners(j)
            return j
        } catch (e) {
            return []
        }
    }

    static async Init() {
        Navigation.updateTitle($$("p4"))
        const self = this
        const w = new WindowContainer()
        const b = new DOM({ new: "div" })
        const filterKey = Navigation.parse.params[0] || null
        WindowManager.newWindow().append(w)

        async function retry(caller) {
            const text = new DOM({
                new: "div",
                content: $$("currency/refreshing"),
                style: {
                    padding: "15px",
                },
            })
            const [cur, toast] = (await Promise.all(
                [
                    self.partnersGetter(),
                    Toast.add(text, -1),
                ].map(reflect),
            )).map((e) => e.data)

            if (cur instanceof APIError || cur instanceof Error) {
                text.clear(new DOM({ type: "text", new: $$("currency/error_refresh") }))
            } else {
                if (typeof caller === "function") await caller()
                b.clear()
                self.renderList(b, cur, false, filterKey)
                text.clear(new DOM({ type: "text", new: $$("currency/refreshed") }))
            }
            await Sleep(3000)
            toast.pop()
        }

        async function filter(key) {
            Navigation.url = { module: "partners", params: (key ? [key] : []) }
        }

        function filterUI() {
            const opts = []
            function interator(i) {
                const ir = i.next()
                const e = ir.value
                if (!e) return
                opts.push({ content: e.title, value: e.id })
                if (!ir.done) interator(i)
            }
            interator(self.categories.values())

            let selection = false
            if (filterKey) selection = opts.findIndex((e) => e.value === filterKey)
            if (selection === -1) opts.push({ content: filterKey, value: filterKey })

            const p = Prompt({
                title: $$("p4/categories"),
                text: [
                    $$("p4/choose_category"),
                    new SelectInput({
                        placeholder: $$("p4/category"),
                        options: opts,
                        emptySelection: $$("p4/all"),
                        change(o) {
                            filter(o.value)
                            p.close()
                        },
                        defaultOption: (selection === false
                            ? -1
                            : (selection === -1 ? opts.length - 1 : selection)),
                    }),
                ],
            })
        }

        Navigation.Current = {
            navMenu: [
                {
                    icon: "refresh",
                    title: $$("currency/refresh"),
                    handler: retry,
                },
                {
                    icon: "filter_list",
                    title: $$("p4/category"),
                    handler: filterUI,
                },
            ],
        }

        w.render(new Title($$("p4")))
        const loader = loadingPopup()
        let cur
        let cache = false

        try {
            cur = await self.partnersGetter()
        } catch (e) {
            ({ data: cur, time: cache } = await OfflineCache.getPartners())
        }
        if (cur !== undefined) {
            this.renderList(b, cur, (cache ? [cache, retry] : false), filterKey)
        } else {
            b.render(new WarningConstructorButton({
                type: 3,
                button: {
                    content: $$("p4/retry"),
                    handler: () => retry(),
                },
                title: $$("p4/fetch_fail"),
                content: $$("p4/try_later"),
            }))
        }
        w.render(b)
        loader.close()
    }

    static renderList(w, cur, cache = false, filter = false) {
        const self = this
        if (cache) {
            const warnCache = new WarningConstructorButton({
                type: 2,
                button: {
                    content: $$("currency/refresh"),
                    handler: () => cache[1](() => new SlideOut({
                        duration: 100,
                        timingFunc: EaseOutCubic,
                    }).apply(warnCache)),
                },
                title: $$("p4/cached_title"),
                content: `${$$("p4/cache_for")} ${new Date(cache[0]).toLocaleDateString()} ${new Date(cache[0]).toLocaleTimeString()}`,
            })
            w.render(warnCache)
        }

        function onlineIconExplanation() {
            Prompt({
                title: $$("p4/online"),
                text: $$("p4/online_exp"),
                buttons: [
                    {
                        handler: "close",
                        content: $$("close"),
                    },
                ],
            })
        }

        function deliveryIconExplanation() {
            Prompt({
                title: $$("p4/delivery"),
                text: $$("p4/delivery_exp"),
                buttons: [
                    {
                        handler: "close",
                        content: $$("close"),
                    },
                ],
            })
        }

        const wCards = []

        cur.forEach((item) => {
            const left = []
            const right = []
            const info = []

            item.categories.forEach((c) => this.categories.set(c.id, c))
            if (filter) if (!item.categories.find((e) => e.id === filter)) return

            if (typeof item.note === "string" && item.note.length > 0) {
                right.push(new Icon("info"))
                info.push(new IconSide("info", item.note, { style: { margin: ".5em 1em", alignSelf: "start" } }))
            }
            if (item.url) {
                info.push(new DOM({
                    new: "div",
                    content: new IconSide("link", item.url, { style: { margin: ".5em 1em", alignSelf: "start" } }),
                    class: ["card-list-item-clickable", "card-list-item", "no-border"],
                    events: [
                        {
                            event: "click",
                            handler() {
                                window.open(item.url, "_blank")
                            },
                        },
                    ],
                }))
            }
            if (item.is_partially_online && !item.is_full_online) {
                right.push(new Icon("laptop"))
                info.push(new DOM({
                    new: "div",
                    content: new IconSide("laptop", $$("p4/online"), { style: { margin: ".5em 1em", alignSelf: "start" } }),
                    class: ["card-list-item-clickable", "card-list-item", "no-border"],
                    events: [
                        {
                            event: "click",
                            handler() {
                                onlineIconExplanation()
                            },
                        },
                    ],
                }))
            }
            if (item.is_full_online) {
                right.push(new Icon("local_shipping"))
                info.push(new DOM({
                    new: "div",
                    content: new IconSide("local_shipping", $$("p4/delivery"), { style: { margin: ".5em 1em", alignSelf: "start" } }),
                    class: ["card-list-item-clickable", "card-list-item", "no-border"],
                    events: [
                        {
                            event: "click",
                            handler() {
                                deliveryIconExplanation()
                            },
                        },
                    ],
                }))
            }

            left.push(new DOM({
                new: "div",
                class: ["partner-logo"],
                content: [
                    item.title[0],
                    ...(item.logo_url === null
                        ? []
                        : [new DOM({
                            new: "img",
                            set: {
                                src: `${item.logo_url}?imagecache`,
                            },
                            events: [
                                {
                                    event: "load",
                                    handler(e, v) {
                                        new FadeIn({ duration: 300 }).apply(v)
                                    },
                                },
                                {
                                    event: "error",
                                    handler(e, v) {
                                        v.destructSelf()
                                    },
                                },
                            ],
                        })]),
                ],
            }))
            left.push(new DOM({ new: "div", content: item.title, class: ["partner-title"] }))

            let infoCard

            function genInfo() {
                return new DOM({
                    new: "div",
                    class: ["info-card"],
                    content: info,
                    style: { willChange: "height" },
                })
            }

            let blockClick = false

            const el = new Card([
                new DOM({
                    new: "div",
                    content: [
                        new DOM({
                            new: "div",
                            content: left,
                            class: ["left"],
                        }),
                        new DOM({
                            new: "div",
                            content: right,
                            class: ["right"],
                        }),
                        new DOM({
                            new: "div",
                            class: ["right-faker"],
                            content: new Icon("expand_less"),
                        })],
                    events: [
                        {
                            event: "click",
                            async handler(e) {
                                if (blockClick) return
                                blockClick = true
                                el.classList.toggle("shown")
                                if (el.classList.contains("shown")) {
                                    infoCard = genInfo()
                                    new SlideInCSS({
                                        duration: 300,
                                        timingFunc: EaseOutCubic,
                                        renderAwait: true,
                                    }).apply(infoCard)
                                    el.render(infoCard)
                                    await Sleep(300)
                                } else {
                                    await new SlideOutCSS({
                                        duration: 300,
                                        timingFunc: EaseOutCubic,
                                    })
                                        .apply(infoCard)
                                    infoCard.destructSelf()
                                }
                                blockClick = false
                            },
                        },
                    ],
                    class: ["partner-card", "card-list-item-clickable", "card-list-item"],
                }),
            ])

            wCards.push(el)
        })

        if (filter) {
            const f = self.categories.get(filter)
            if (f) w.render(new Title(f.title, 2))
        }

        w.render(...wCards)

        if (wCards.length === 0) {
            w.render(
                new DOM(
                    {
                        new: "div",
                        content: new Align(new DOM({
                            new: "div",
                            content: [
                                new Title($$("p4/no_data"), 2, { fontSize: "4vmin" }),
                                new DOM({
                                    new: "img",
                                    src: require("@Resources/images/placeholders/failed.png").default,
                                    style: {
                                        height: "33vh",
                                        margin: "auto",
                                    },
                                }),
                            ],
                        }), ["row", "center"]),
                        style: {
                            borderRadius: "50%",
                            background: Design.getVar("color-card-background"),
                            margin: "auto",
                            width: "60vmin",
                            height: "60vmin",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        },
                    },
                ),
            )
        }

        return w
    }
}

CoreLoader.registerTask({
    id: "p4_partners_module",
    presence: "P4 Partners",
    task() {
        Navigation.addModule({
            name: "Partners",
            id: "partners",
            callback() { PartnersUI.Init() },
        })
    },
})
