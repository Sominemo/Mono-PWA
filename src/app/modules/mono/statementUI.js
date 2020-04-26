import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { CoreLoader } from "@Core/Init/CoreLoader"
import DOM from "@DOMPath/DOM/Classes/dom"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import printMoney from "@App/tools/transform/printMoney"
import cubicBeizer from "@DOMPath/Animation/Library/Timing/cubicBeizer"
import { Card } from "@Environment/Library/DOM/object/card"
import {
    Preloader, TwoSidesWrapper, Title, Icon,
} from "@Environment/Library/DOM/object"
import { Align } from "@Environment/Library/DOM/style"
import LottieAnimation from "@App/library/LottieAnimation"
import { Button } from "@Environment/Library/DOM/object/input"
import { $$, $ } from "@Core/Services/Language/handler"
import { sameDay, relativeDate } from "@App/tools/transform/relativeDates"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import { Report } from "@Core/Services/Report"
import WarningConstructorButton from "@Environment/Library/DOM/object/warnings/WarningConstructorButton"
import SlideInCSS from "@Environment/Library/Animations/SlideInCSS"
import EaseOutCubic from "@DOMPath/Animation/Library/Timing/easeOutCubic"
import Sleep from "@Core/Tools/objects/sleep"
import WarningConstructor from "@Environment/Library/DOM/object/warnings/WarningConstructor"
import LanguageCore from "@Core/Services/Language/core"
import StatementStorage from "./services/StatementStorage"
import NoCashback from "./API/classes/cashbacks/NoCashback"
import MoneyCashback from "./API/classes/cashbacks/MoneyCashback"
import MilesCashback from "./API/classes/cashbacks/MilesCashback"
import Auth from "./services/Auth"
import MonoAPI from "./API/clients/MonoAPI"
import Account from "./API/classes/Account"
import { cardItemGenerator } from "./functions/cardItemGenerator"
import CardCustomization from "./controllers/CardCustomization"
import { statementDownloaderUI } from "./functions/statementDownloader"

export default class StatementUI {
    static async Init() {
        Navigation.updateTitle($$("statement"))

        Navigation.Current = {
            navMenu: [
                {
                    icon: "credit_card",
                    title: $$("customization/open"),
                    handler() { CardCustomization.cardList(true) },
                },
                {
                    icon: "cloud_download",
                    title: $$("download_statement"),
                    handler() { statementDownloaderUI() },
                },
            ],
        }

        if (!Auth.isAnyAuthed) {
            Navigation.url = { module: "auth" }
            return
        }
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)
        w.style({ padding: 0 })
        let statementBody
        let curAccount

        const gallery = await this.makeCardGallery(async (account, visual) => {
            curAccount = account
            let isLoading = true
            let prevDate = Date.now()
            let fromDate = prevDate - 1000 * 60 * 60 * 24 * 7
            let loadMoreCount = 0
            if (!account) {
                const p = Prompt({
                    title: $$("statement/accounts_changed"),
                    text: $$("statement/accounts_changed_text"),
                    buttons: [
                        {
                            content: $$("reload"),
                            handler() {
                                Navigation.reload()
                                p.close()
                            },
                        },
                    ],
                })
            }
            if (account.client instanceof MonoAPI) {
                if (!(await SettingsStorage.getFlag("seen_token_throttling_warn"))) {
                    Prompt({
                        title: $$("statement/warning"),
                        text: $("statement/requests_throttling"),
                        buttons: [
                            {
                                content: $$("close"),
                                handler: "close",
                            },
                        ],
                    })
                    SettingsStorage.setFlag("seen_token_throttling_warn", true)
                }
            }

            let genList
            const contentCard = new Card(
                new Preloader({ style: { margin: "auto" } }),
                { style: { display: "flex", flexDirection: "column" } },
            )
            statementBody.clear(contentCard)

            let loader

            const loadMore = () => {
                isLoading = true

                if (loader) loader.destructSelf()

                const thisLoader = new Align(
                    new Preloader(),
                    ["center", "row"], { padding: "15px" },
                )
                statementBody.render(thisLoader)

                loadMoreCount++
                window.requestAnimationFrame(async () => {
                    prevDate = fromDate
                    fromDate -= 1000 * 60 * 60 * 24 * 7
                    genList(Array.from(
                        await account.statement(new Date(fromDate), new Date(prevDate)),
                    ), true)
                    thisLoader.destructSelf()
                    isLoading = false
                }, { timeout: 100 })
            }

            genList = (items, noReplace = false) => {
                if (account !== curAccount) return
                const toRender = []

                items.forEach((item, i) => {
                    try {
                        if (
                            (i - 1 in items && !sameDay(items[i - 1].time.getTime(),
                                item.time.getTime()))
                            || (!(i - 1 in items))
                        ) {
                            toRender.push(new Title(relativeDate(item.time), 3))
                        }

                        const descriptionArray = []

                        if (item.comment) descriptionArray.push([new Icon("chat_bubble"), new DOM({ type: "t", new: `${item.comment}` })])
                        descriptionArray.push([
                            new DOM({
                                type: "t",
                                new: (LanguageCore.language.info.code === "ru" ? item.mcc.ruTitle : item.mcc.ukTitle)
                                    || item.mcc.title,
                            }),
                        ])

                        if (!(item.cashback instanceof NoCashback || item.cashback.amount === 0)) {
                            if (item.cashback instanceof MoneyCashback) {
                                if (!item.cashback.object.isZero) descriptionArray.push([new Icon("account_balance_wallet"), new DOM({ type: "t", new: `${(item.cashback.sign === -1 ? "-" : "") + printMoney(item.cashback.object, true)}` })])
                            } else if (item.cashback instanceof MilesCashback) {
                                descriptionArray.push([new Icon("flight"), new DOM({ type: "t", new: `${item.cashback.amount} mi` })])
                            } else {
                                descriptionArray.push([new Icon("assistant"), new DOM({ type: "t", new: `${item.cashback.amount} ${item.cashback.type}` })])
                            }
                        }

                        if (!item.commissionRate.isZero) {
                            descriptionArray.push([new Icon("remove_circle"), new DOM({ type: "t", new: `${item.commissionRate.string}` })])
                        }

                        const description = descriptionArray.reduce(
                            (r, a, ind) => r.concat(
                                ...[...a,
                                    ...(ind + 1 === descriptionArray.length
                                        ? []
                                        : [new DOM({ type: "t", new: " | " })]),
                                ],
                            ), [],
                        )

                        toRender.push(new DOM({
                            new: "div",
                            class: "statement-item-list",
                            intersections: (i === items.length - Math.floor(items.length * 0.3) - 1
                                ? [
                                    {
                                        config: {
                                            root: WindowManager.controlWin.elementParse.native,
                                        },
                                        handler(e, obs) {
                                            if (
                                                !e.some((el) => el.isIntersecting) || isLoading
                                            ) return
                                            obs.disconnect()

                                            loadMore()
                                        },
                                    },
                                ] : []),
                            content:
                                new TwoSidesWrapper(
                                    new Align([
                                        new DOM({
                                            new: "div",
                                            class: "statement-item-category",
                                            content: new Icon(item.mcc.md.icon),
                                            style: {
                                                background: item.mcc.md.color,
                                            },
                                        }),
                                        new DOM({
                                            new: "div",
                                            class: "statement-row-container-text",
                                            content: [
                                                new DOM({
                                                    new: "div",
                                                    class: "statement-item-title",
                                                    content: item.description,
                                                }),
                                                new DOM({
                                                    new: "div",
                                                    class: "statement-item-descr",
                                                    content: description,
                                                }),
                                            ],
                                        }),
                                    ], ["row"], { align: "center" }),
                                    new DOM({
                                        new: "div",
                                        class: ["amount-statement-item", (item.out ? "out" : "in")],
                                        content: String((item.out ? "-" : "")
                                            + printMoney(item.amount, null, true)),
                                    }),
                                ),
                        }))
                    } catch (e) {
                        Report.add([e, JSON.parse(JSON.stringify(item))], ["statement.renderError"])
                    }
                })

                contentCard.render(...toRender)


                if (items.length === 0) {
                    if (!noReplace || contentCard.classList.contains("originally-null")) {
                        contentCard.classList.add("originally-null")
                        contentCard.clear(
                            new DOM({
                                new: "div",
                                style: { margin: "auto", textAlign: "center" },
                                content: [
                                    new LottieAnimation(require("@Resources/animations/failed.json"),
                                        { lottieOptions: { loop: false }, size: "33vmin", style: { margin: "auto" } }),
                                    new Title((loadMoreCount > 0 ? $$("statement/still_nothing") : $$("statement/no_operations_for_last_week")), 3, { marginLeft: "5px", marginRight: "5px" }),
                                    new Button({
                                        content: $$("statement/load_more"),
                                        handler() {
                                            contentCard.clear()
                                            loadMore()
                                        },
                                    }),
                                ],
                            }),
                        )
                    } else if (!contentCard.classList.contains("originally-null")) {
                        loader = new Align(
                            new Button({
                                content: $$("statement/load_more"),
                                handler() {
                                    loadMore()
                                },
                            }),
                            ["center", "row"], { padding: "15px" },
                        )
                        statementBody.render(loader)
                    } else if (loader) loader.destructSelf()
                } else {
                    contentCard.style({ display: "" })
                    contentCard.classList.remove("originally-null")
                    loader = new Align(
                        new Button({
                            content: $$("statement/load_more"),
                            handler() {
                                loadMore()
                            },
                        }),
                        ["center", "row"], { padding: "15px" },
                    )
                    statementBody.render(loader)
                }

                if (account.cards[0].type === "platinum" && "fallback" in visual.params) {
                    const setColor = async (newColor) => {
                        const config = await SettingsStorage.get("mono_cards_config") || {}
                        visual.params.look = newColor
                        delete visual.params.fallback
                        config[account.id] = visual.params
                        await SettingsStorage.set("mono_cards_config", config)
                        Navigation.reload()
                    }
                    const colorHint = new WarningConstructor({
                        type: 2,
                        content: new DOM({
                            new: "div",
                            style: {
                                display: "flex",
                                flexDirection: "column",
                            },
                            content: [
                                new Title($$("statement/choose_platinum_color"), 3, { marginTop: "0", textAlign: "center" }),
                                new Align(
                                    [
                                        new DOM({
                                            new: "div",
                                            style: {
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(45deg, #d0d0d0 0%, #6b6b6b 100%)", // grey
                                                margin: "0 10px",
                                                cursor: "pointer",
                                            },
                                            events: [
                                                {
                                                    event: "click",
                                                    handler() {
                                                        setColor("grey")
                                                    },
                                                },
                                            ],
                                        }),
                                        new DOM({
                                            new: "div",
                                            style: {
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(45deg, #ffe6e5 0%, #ca9695 100%)", // pink
                                                margin: "0 10px",
                                                cursor: "pointer",
                                            },
                                            events: [
                                                {
                                                    event: "click",
                                                    handler() {
                                                        setColor("pink")
                                                    },
                                                },
                                            ],
                                        }),
                                        new DOM({
                                            new: "div",
                                            style: {
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(45deg, #333333 0%, #000 100%)", // black
                                                margin: "0 10px",
                                                cursor: "pointer",
                                            },
                                            events: [
                                                {
                                                    event: "click",
                                                    handler() {
                                                        setColor("black")
                                                    },
                                                },
                                            ],
                                        }),
                                    ],
                                    ["row", "center"],
                                ),
                            ],
                        }),
                        style: {
                            margin: "15px",
                        },
                    })

                    new SlideInCSS({
                        renderAwait: true,
                        duration: 300,
                        timingFunc: EaseOutCubic,
                    }).apply(colorHint).then(() => { colorHint.style({ margin: "15px" }) })
                    Sleep(1000).then(() => {
                        contentCard.prepend(colorHint)
                    })
                }

                SettingsStorage.get("my_cards_hint_shown").then((v) => {
                    if (v || curAccount !== account) return
                    const warning = new WarningConstructorButton({
                        type: 3,
                        title: $$("statement/hint_customize"),
                        content: $$("statement/hint_customize_text"),
                        icon: "credit_card",
                        button: {
                            content: $$("statement/open"),
                            handler() {
                                CardCustomization.cardList(true)
                            },
                        },
                        style: {
                            margin: "15px",
                        },
                    })

                    new SlideInCSS({
                        renderAwait: true,
                        duration: 300,
                        timingFunc: EaseOutCubic,
                    }).apply(warning).then(() => { warning.style({ margin: "15px" }) })

                    Sleep(1000).then(() => {
                        contentCard.prepend(warning)
                        SettingsStorage.set("my_cards_hint_shown", true)
                    })
                })

                isLoading = false
            }

            const requestFirstData = async () => {
                const cont = Array.from(
                    await account.statement(
                        new Date(fromDate),
                    ),
                )

                contentCard.clear()
                window.requestAnimationFrame(() => genList(cont))
            }

            window.requestAnimationFrame(requestFirstData)
        })

        statementBody = new DOM({
            new: "div",
            class: "statement-body-container",
            onRendered() {
                gallery.calculate()
            },
        })

        w.render(gallery)
        w.render(statementBody)
    }

    static detectLook(type) {
        if (type === "white") return "white"
        if (type === "yellow") return "yellow"
        if (type === "iron") return "iron"
        if (type === "platinum") return "grey"
        return "black"
    }

    static async cardConfig(accounts) {
        const settings = await SettingsStorage.get("mono_cards_config") || {}

        const res = {}

        accounts.forEach((account, i) => {
            res[account.id] = settings[account.id] || {
                id: account.id,
                bank: (account.cards[0].type === "iron" ? "iron" : "mono"),
                look: this.detectLook(account.cards[0].type),
                cardholder: account.client.name,
                currency: account.balance.currency.number,
                fallback: true,
            }
        })

        return res
    }

    static async cardList(accounts) {
        const settings = await this.cardConfig(accounts)

        const cards = accounts.map((account, i) => {
            const params = settings[account.id]

            const cardVisual = cardItemGenerator(params)

            const balanceItem = new DOM({
                new: "div",
                content: printMoney(account.balance),
                class: "mono-card-absolute-balance-number",
            })

            const setAmount = (state) => {
                if (state === true) {
                    balanceItem.classList.add("updating")
                    return
                }
                balanceItem.classList.remove("updating")
                if (state instanceof Account) {
                    balanceItem.clear(new DOM({ type: "text", new: (state.isOverdraft ? "-" : "") + printMoney(state.balance) }))
                }
            }

            return new DOM({
                new: "div",
                class: "mono-card-scroll-block",
                content: new DOM({
                    new: "div",
                    class: "mono-card-absolute-holder",
                    content: [
                        new DOM({
                            new: "div",
                            content: cardVisual,
                            class: "mono-card-absolute-visual-block",
                        }),
                        new DOM({
                            new: "div",
                            content: [
                                balanceItem,
                            ],
                            class: "mono-card-absolute-balance-block",
                        }),
                    ],
                }),
                objectProperty: [
                    {
                        name: "updateState",
                        handler: setAmount,
                    },
                    {
                        name: "params",
                        handler: params,
                    },
                ],
            })
        })

        return cards
    }

    static async makeCardGallery(callback = () => { }) {
        const cubicB = cubicBeizer(0.3, 0.6, 0, 3)
        const [cardList, cardVisuals] = await this.allCardInfo()
        let currentSelection = null
        let speed
        let gallery

        cardVisuals.forEach((e) => e.updateState(true))
        const updateCards = async () => {
            const ci = await StatementStorage.getAccountList(true, false)

            ci.forEach((account) => {
                const id = cardList.findIndex((e) => e.id === account.id)
                if (id === -1) return

                cardVisuals[id].updateState(account)
            })
        }

        window.requestAnimationFrame(updateCards)


        function visibleWidth(card, container) {
            if (card.left >= container.left + container.width) return 0
            if (card.left < container.left) {
                return Math.max(0,
                    card.width - (container.left - card.left))
            }
            if (card.left >= container.left) {
                return Math.min(card.width, container.left + container.width - card.left)
            }
            return 0
        }

        const scrollTo = async (el) => {
            el = el || cardVisuals[currentSelection]
            const s = el.sizes
            const gallerySize = gallery.sizes
            const position = el.elementParse.native.offsetLeft + s.width / 2 - gallerySize.width / 2
            gallery.scrollTo({ left: position, behavior: "smooth" })
        }

        const calculateCurrent = () => {
            const gallerySize = gallery.sizes

            const visibleWidths = cardVisuals.map((card) => {
                const cardSizes = card.sizes
                return visibleWidth(cardSizes, gallerySize)
            })

            const cs = visibleWidths.indexOf(Math.max(...visibleWidths))

            if (currentSelection !== cs) {
                currentSelection = cs
                callback(cardList[currentSelection], cardVisuals[currentSelection])
            }

            scrollTo()
        }


        const rem = () => setTimeout(() => {
            scrollTo()
        }, 0)

        const interactionStartHandler = (isTouch, e, el) => {
            let lastX = e.clientX || e.touches[0].clientX
            let lastMove = Date.now()
            const startX = lastX
            let moveEv
            let oneTouchEv
            let mouseOut

            const stopSwipe = () => {
                oneTouchEv.destroy()
                moveEv.destroy()
                mouseOut.destroy()

                calculateCurrent()
            }

            oneTouchEv = el.setEvents({
                event: (isTouch ? "touchend" : "mouseup"),
                handler: stopSwipe,
            })

            mouseOut = el.setEvents({
                event: "mouseleave",
                handler: stopSwipe,
            })

            moveEv = el.setEvents({
                event: (isTouch ? "touchmove" : "mousemove"),
                handler(ev) {
                    const deltaX = lastX - (ev.clientX || ev.touches[0].clientX)
                    const fullDelta = lastX - startX
                    lastX = ev.clientX || ev.touches[0].clientX
                    const deltaTime = Date.now() - lastMove
                    lastMove = Date.now()

                    speed = Math.abs(deltaX / deltaTime / 4)
                    el.scrollBy({
                        left: deltaX * cubicB(Math.abs(fullDelta) / el.sizes.width)
                            * Math.max(1, speed),
                    })
                },
            })
        }

        let lastT = null

        gallery = new DOM({
            new: "div",
            content: new DOM({
                new: "div",
                class: "mono-cards-gallery-scroller",
                content: cardVisuals,
            }),
            class: "mono-cards-gallery",
            events: [
                {
                    event: "mousedown",
                    handler: (...e) => interactionStartHandler(false, ...e),
                    params: { passive: true },
                },
                {
                    event: "touchstart",
                    handler: (...e) => interactionStartHandler(true, ...e),
                    params: { passive: true },
                },
                {
                    event: "wheel",
                    handler(event) {
                        const deltaC = event.deltaX || (event.shiftKey ? event.deltaY : 0)
                        if (deltaC === 0) return
                        event.preventDefault()
                        const mouseScroll = Math.abs(deltaC) >= 100
                        this.scrollBy({
                            left: (mouseScroll
                                ? 35 * Math.sign(deltaC) : deltaC),
                        })
                        if (lastT !== null) clearTimeout(lastT)
                        lastT = setTimeout(() => {
                            calculateCurrent()
                            requestAnimationFrame(() => {
                                scrollTo(cardVisuals[currentSelection])
                            })
                        }, (mouseScroll ? 200 : 0))
                    },
                },
            ],
            onRender(ev, el) {
                window.addEventListener("resize", rem)
            },

            onClear() {
                window.removeEventListener("resize", rem)
            },

            objectProperty: [
                {
                    name: "calculate",
                    handler: calculateCurrent,
                },
            ],
        })

        return gallery
    }

    static async allCardInfo() {
        const cardList = await StatementStorage.getAccountList(true)

        const cardVisuals = await this.cardList(cardList)
        return [cardList, cardVisuals]
    }
}

CoreLoader.registerTask({
    id: "statement_module",
    presence: "Statement",
    task() {
        Navigation.addModule({
            name: "Statement",
            id: "statement",
            callback() { StatementUI.Init() },
        })
    },
})
