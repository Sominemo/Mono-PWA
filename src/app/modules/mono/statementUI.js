import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { CoreLoader } from "@Core/Init/CoreLoader"
import { SVG } from "@Environment/Library/DOM/basic"
import DOM from "@DOMPath/DOM/Classes/dom"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import printMoney from "@App/tools/transform/printMoney"
import Currency from "./API/classes/Currency"
import StatementStorage from "./services/StatementStorage"

export default class StatementUI {
    static async Init() {
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)
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
            class: ["mono-card", ...(cardDecoration === null ? [] : [cardDecoration])],
            style: {
                background: cardBG,
            },
            content: [
                new DOM({
                    new: "div",
                    class: "mono-card-bank-image",
                    content: bankImg,
                    style: {
                        filter: (invert ? "" : ""),
                    },
                }),
                new DOM({
                    new: "div",
                    class: "mono-card-cardholder",
                    content: cardSign,
                    style: {
                        filter: (invert ? "" : ""),
                    },
                }),
            ],
        })
    }

    static async cardList() {
        const cardList = await StatementStorage.getCardList(true)
        const settings = await SettingsStorage.get("mono_cards_config") || {}

        const cards = cardList.map((card) => {
            const params = settings[card.id]
            || {
                bank: "mono",
                look: "black",
                placeholder: card.client.name,
                currency: card.balance.currency,
            }

            const cardVisual = this.cardItemGenerator(params)

            return new DOM({
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
            })
        })

        return cards
    }

    static async makeCardGallery() {
        return new DOM({
            new: "div",
            content: new DOM({
                new: "div",
                class: "mono-cards-gallery-scroller",
                content: await this.cardList(),
            }),
            class: "mono-cards-gallery",
        })
    }

    static bankImg(bank) {
        let img = require("@Resources/images/banklogos/mono.svg")
        if (bank === "iron") img = require("@Resources/images/banklogos/iron.svg")
        return new SVG(img)
    }

    static cardBG(look) {
        let gradient = "linear-gradient(45deg, #000 0%, #292929 100%)"
        if (look === "grey") gradient = "linear-gradient(45deg, #9d9d9d 0%, #d8d8d8 100%)"; else
        if (look === "pink") gradient = "linear-gradient(45deg, #ca9695 0%, #ffe6e5 100%)"
        return gradient
    }

    static cardDecoration(currency) {
        let decoration = null
        if (currency instanceof Currency) {
            if (Currency.number === 840) decoration = "--card-green-sideline"; else
            if (Currency.number === 978) decoration = "--card-red-sideline"; else
            if (Currency.number === 985) decoration = "--card-blue-sideline"
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
