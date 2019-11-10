import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { CoreLoader } from "@Core/Init/CoreLoader"
import { SVG } from "@Environment/Library/DOM/basic"
import DOM from "@DOMPath/DOM/Classes/dom"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import printMoney from "@App/tools/transform/printMoney"
import cubicBeizer from "@DOMPath/Animation/Library/Timing/cubicBeizer"
import randBetween from "@Core/Tools/objects/randBetween"
import randomFromArray from "@Core/Tools/objects/randomFromArray"
import Sleep from "@Core/Tools/objects/sleep"
import Currency from "./API/classes/Currency"
import Account from "./API/classes/Account"
import Money from "./API/classes/Money"

export default class StatementUI {
    static async Init() {
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)
        w.style({ padding: 0 })
        w.render(await this.makeCardGallery())
    }

    static cardItemGenerator({
        bank = "mono", look = "black", cardholder = "", currency = null,
    }) {
        const bankImg = this.bankImg(bank)
        const [cardBG, invert] = this.cardBG(look)
        const cardDecoration = this.cardDecoration(currency)
        const cardSign = String(cardholder)

        return new DOM({
            new: "div",
            class: ["mono-card", ...(cardDecoration === null ? [] : ["mono-card-decorator", cardDecoration]), ...(invert ? ["mono-card-inverted"] : [])],
            style: {
                background: cardBG,
            },
            content: [
                new DOM({
                    new: "div",
                    class: "mono-card-bank-image",
                    content: bankImg,
                    style: {
                        filter: (invert ? "brightness(0)" : ""),
                    },
                }),
                new DOM({
                    new: "div",
                    class: "mono-card-cardholder",
                    content: cardSign,
                    style: {
                        filter: (invert ? "brightness(0)" : ""),
                    },
                }),
            ],
        })
    }

    static async cardList(accounts) {
        const settings = await SettingsStorage.get("mono_cards_config") || {}
        const banks = ["mono", "mono", "mono", "iron"]
        const looks = ["black", "grey", "pink"]

        const cards = accounts.map((card) => {
            const params = settings[card.id]
                || {
                    bank: randomFromArray(banks),
                    look: randomFromArray(looks),
                    cardholder: `${randomFromArray([
                        "Олексій", "Степан", "Захар",
                        "Сергій", "Макар", "Андрій",
                        "Богдан", "Євген", "Григорій"])
                    } ${
                        randomFromArray([
                            "Мірошниченко", "Вороний", "Шевченко",
                            "Радченко", "Хмельницький", "Скиба",
                            "Куліш", "Гончаренко", "Грушевський"])}`,
                    currency: card.balance.currency,
                }

            /*
|| {
                    bank: "mono",
                    look: "black",
                    cardholder: card.client.name,
                    currency: card.balance.currency,
                }
                */

            const cardVisual = this.cardItemGenerator(params)

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
                                new DOM({
                                    new: "div",
                                    content: printMoney(card.balance),
                                    class: "mono-card-absolute-balance-number",
                                }),
                            ],
                            class: "mono-card-absolute-balance-block",
                        }),
                    ],
                }),
            })
        })

        return cards
    }

    static async allCardInfo() {
        // const cardList = await StatementStorage.getCardList(true)
        const currs = [Currency.code("UAH"), Currency.code("UAH"), Currency.code("UAH"), Currency.code("USD"), Currency.code("EUR"), Currency.code("PLN")]
        const cardList = Array(20).fill(null).map(() => {
            const cur = randomFromArray(currs)
            return new Account({
                id: "id",
                balance: new Money(randBetween(0, 99999), randBetween(0, 99), cur),
                creditLimit: new Money(0, 0, cur),
                cashbackType: cur.code,
            })
        })
        const cardVisuals = await this.cardList(cardList)
        return [cardList, cardVisuals]
    }

    static async makeCardGallery() {
        const cubicB = cubicBeizer(0.3, 0.6, 0, 3)
        const [cardList, cardVisuals] = await this.allCardInfo()
        let currentSelection = 0
        let speed
        let gallery


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

            currentSelection = visibleWidths.indexOf(Math.max(...visibleWidths))

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
                        left: deltaX * cubicB(Math.abs(fullDelta) / el.sizes.width) * Math.max(1, speed),
                    })
                },
            })
        }

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
            ],
            onRender(ev, el) {
                window.addEventListener("resize", rem)
            },

            onClear() {
                window.removeEventListener("resize", rem)
            },
        })

        return gallery
    }

    static bankImg(bank) {
        let img = require("@Resources/images/banklogos/mono.svg")
        if (bank === "iron") img = require("@Resources/images/banklogos/iron.svg")
        return new SVG(img)
    }

    static cardBG(look) {
        let gradient = "linear-gradient(45deg, #333333 0%, #000 100%)"
        let invert = false
        if (look === "grey") {
            gradient = "linear-gradient(45deg, #d8d8d8 0%, #9d9d9d 100%)"
            invert = true
        } else
        if (look === "pink") {
            gradient = "linear-gradient(45deg, #ffe6e5 0%, #ca9695 100%)"
            invert = true
        }

        return [gradient, invert]
    }

    static cardDecoration(currency) {
        let decoration = null
        if (currency instanceof Currency) {
            if (currency.number === 840) decoration = "--card-green-sideline"; else
            if (currency.number === 978) decoration = "--card-red-sideline"; else
            if (currency.number === 985) decoration = "--card-blue-sideline"
        }

        return decoration
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
