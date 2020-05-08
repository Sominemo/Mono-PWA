import Sortable from "sortablejs"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import {
    CardList, CardContent, CardTextList, Card,
} from "@Environment/Library/DOM/object/card"
import {
    TwoSidesWrapper, Icon, Title, Preloader,
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
import StatementUI from "../statementUI"

export default class CardCustomization {
    static async cardList(refresh = false) {
        const self = this
        let visualizationProfiles
        let accounts

        async function getCards() {
            accounts = await StatementStorage.getAccountList(true, true)
            const config = await StatementUI.cardConfig(accounts)
            visualizationProfiles = accounts.map((account) => {
                account.params = config[account.id]
                return account
            })
        }

        const pr = new Preloader({ style: { margin: "auto" } })
        const cont = new DOM({ new: "div", content: pr })

        async function updateList() {
            await getCards()
            const cl = new CardList(visualizationProfiles.map((profile) => ({
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
                                content: cardItemGenerator(profile.params),
                            }),
                            new DOM({
                                new: "div",
                                class: ["mono-card-list-pw", "mono-card-list-pw-size"],
                                content: `**${profile.cards[0].mask.end} `,

                            }),
                        ],
                    }),
                    new DOM({
                        new: "div",
                        style: { display: "flex", alignItems: "center" },
                        content: [
                            new DOM({
                                new: "div",
                                style: {
                                    marginLeft: ".5em", fontWeight: "300", marginRight: "10px",
                                },
                                class: ["mono-card-list-pw-size"],
                                content: (profile.isOverdraft ? "-" : "") + printMoney(profile.balance),

                            }),
                            new DOM({
                                new: "div",
                                class: ["icon-clicker", "side-card-settings-button"],
                                content: new Icon("settings"),
                                events: [
                                    {
                                        event: "click",
                                        handler() {
                                            self.cardSettings(profile.params, () => {
                                                updateList()
                                            })
                                        },
                                    },
                                ],
                            }),
                        ],
                    }),
                ),
                classes: ["mono-card-custom-list"],
                attributes: {
                    dataCardId: profile.id,
                },
            }
            )), false, { customClass: ["mono-card-subj-list"] })

            // eslint-disable-next-line no-unused-vars
            const sortable = new Sortable(cl.elementParse.native, {
                handle: ".icon-clicker",
                ghostClass: "card-sortable-ghost",
                animation: 150,
                forceFallback: false,
                async onUpdate(ev) {
                    const newOrder = Array.from(cl.elementParse.native.children).map((el) => el.getAttribute("data-card-id"))
                    await SettingsStorage.set("card_order", newOrder)
                    getCards()
                },
                onStart() {
                    cl.classList.add("is-dragging")
                },
                onEnd() {
                    cl.classList.remove("is-dragging")
                },
                filter: ".side-card-settings-button",
            })

            pr.destructSelf()
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
            delete params.fallback
            config[id] = params
            const l = loadingPopup()
            await SettingsStorage.set("mono_cards_config", config)
            l.close()
        }

        async function setColor(newColor) {
            const config = await SettingsStorage.get("mono_cards_config") || {}
            params.look = newColor
            delete params.fallback
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
                                new DOM({ new: "div", content: $$("customization/cardholder") }),
                                new DOM({ new: "div", content: cardholder }),
                            ),
                            new TwoSidesWrapper(
                                new DOM({ new: "div", content: "ID" }),
                                new DOM({ new: "div", content: id }),
                            ),
                            new TwoSidesWrapper(
                                new DOM({ new: "div", content: $$("customization/currency") }),
                                new DOM({ new: "div", content: currencyCode }),
                            ),
                        ], {}, true),
                    ),
                    new CardContent($$("customization/warning")),
                    new Title($$("customization/bank"), 3),
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
                    new Title($$("customization/look"), 3),
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
                                            content: $$(`customization/looks/${selectedColor}`),
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
