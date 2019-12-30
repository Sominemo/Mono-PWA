import Sortable from "sortablejs"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import {
    CardList, CardContent, CardTextList, Card,
} from "@Environment/Library/DOM/object/card"
import {
    TwoSidesWrapper, Icon, Title,
} from "@Environment/Library/DOM/object"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import printMoney from "@App/tools/transform/printMoney"
import DOM from "@DOMPath/DOM/Classes/dom"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { RadioLabel } from "@Environment/Library/DOM/object/input"
import { Align } from "@Environment/Library/DOM/style"
import loadingPopup from "@App/library/loadingPopup"
import { cardItemGenerator } from "../functions/cardItemGenerator"
import StatementStorage from "../services/StatementStorage"
import { Currency } from "../API/classes/Currency"

export default class CardCustomization {
    static async cardList(refresh = false) {
        const self = this
        let cards
        let accounts
        let settings

        async function getCards() {
            ([accounts, settings] = await Promise.all([
                await StatementStorage.getCardList(true),
                await SettingsStorage.get("mono_cards_config") || {},
            ]))
            cards = accounts.map((card, i) => {
                card.params = settings[card.id] || {
                    id: card.id,
                    bank: "mono",
                    look: "black",
                    cardholder: card.client.name,
                    currency: card.balance.currency.number,
                }
                return card
            })
        }

        const cont = new DOM({ new: "div" })

        async function updateList() {
            await getCards()
            const cl = new CardList(cards.map((card) => ({
                content: new TwoSidesWrapper(
                    new DOM({
                        new: "div",
                        style: { display: "flex", alignItems: "center" },
                        content: [
                            new DOM({
                                new: "div",
                                class: "icon-clicker",
                                style: { marginRight: "5px" },
                                content: new Icon("unfold_more", { look: "#aeaeae", cursor: "pointer" }),
                            }),
                            new DOM({
                                new: "div",
                                class: ["card-selector"],
                                content: cardItemGenerator(card.params),
                            }),
                            new DOM({
                                new: "div",
                                style: { fontSize: "5vmin", marginLeft: ".5em", fontWeight: "300" },
                                content: printMoney(card.balance),
                            }),
                        ],
                    }),
                    new DOM({
                        new: "div",
                        class: ["icon-clicker", "side-card-settings-button"],
                        content: new Icon("settings"),
                        events: [
                            {
                                event: "click",
                                handler() {
                                    self.cardSettings(card.params, () => {
                                        updateList()
                                    })
                                },
                            },
                        ],
                    }),
                ),
                attributes: {
                    dataCardId: card.id,
                },
            }
            )))

            // eslint-disable-next-line no-unused-vars
            const sortable = new Sortable(cl.elementParse.native, {
                animation: 150,
                async onUpdate(ev) {
                    const newOrder = Array.from(cl.elementParse.native.children).map((el) => el.getAttribute("data-card-id"))
                    await SettingsStorage.set("card_order", newOrder)
                    getCards()
                },
                filter: ".side-card-settings-button",
            })

            cont.clear(cl)
        }

        updateList()


        Prompt({
            text: cont,
            // eslint-disable-next-line no-self-assign
            onClose() { if (refresh) Navigation.url = Navigation.url },
        })
    }

    static cardSettings(params, refresh = false) {
        const {
            bank, look, cardholder, id, currency,
        } = params

        const currencyCode = Currency.number(currency).code

        async function setBank(newBank) {
            const config = await SettingsStorage.get("mono_cards_config") || {}
            params.bank = newBank
            config[id] = params
            const l = loadingPopup()
            await SettingsStorage.set("mono_cards_config", config)
            l.close()
        }

        async function setColor(newColor) {
            const config = await SettingsStorage.get("mono_cards_config") || {}
            params.look = newColor
            config[id] = params
            const l = loadingPopup()
            await SettingsStorage.set("mono_cards_config", config)
            l.close()
        }

        Prompt({
            buttons: [
                {
                    content: $$("close"),
                    handler: "close",
                },
            ],
            onClose: refresh,
            text: new DOM({
                new: "div",
                content: [
                    new Card(
                        new CardTextList([
                            new TwoSidesWrapper(
                                new DOM({ new: "div", content: $$("@customization/cardholder") }),
                                new DOM({ new: "div", content: cardholder }),
                            ),
                            new TwoSidesWrapper(
                                new DOM({ new: "div", content: "ID" }),
                                new DOM({ new: "div", content: id }),
                            ),
                            new TwoSidesWrapper(
                                new DOM({ new: "div", content: $$("@customization/currency") }),
                                new DOM({ new: "div", content: currencyCode }),
                            ),
                        ], {}, true),
                    ),
                    new CardContent($$("@customization/warning")),
                    new Title($$("@customization/bank"), 3),
                    new Align([
                        ...new RadioLabel([
                            {
                                handler(s) {
                                    if (!s) return
                                    setBank("mono")
                                },
                                content: "monobank",
                                selected: bank === "mono",
                            },
                            {
                                handler(s) {
                                    if (!s) return
                                    setBank("iron")
                                },
                                content: "IRON BANK",
                                selected: bank === "iron",
                            },
                        ], [], false, true),
                    ], ["row", "middle"]),
                    new Title($$("@customization/look"), 3),
                    new DOM({
                        new: "div",
                        class: "three-column",
                        content: [
                            ...new RadioLabel(
                                ["black", "grey", "pink", "white", "iron", "yellow"]
                                    .map(
                                        (selectedColor) => ({
                                            handler(s) {
                                                if (!s) return
                                                setColor(selectedColor)
                                            },
                                            content: $$(`@customization/looks/${selectedColor}`),
                                            selected: look === selectedColor,
                                        }),
                                    ), [], false, true,
                            ),
                        ],
                    }),
                ],
            }),
        })
    }
}
