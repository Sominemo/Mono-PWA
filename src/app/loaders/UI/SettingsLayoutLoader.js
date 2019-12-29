import {
    SettingsActContainer, SettingsSectionElement, SettingsGroupContainer, SettingsActLink,
} from "@Environment/Library/DOM/settings"
import { isRecoveryMode } from "@App/debug/recovery"
import WarningConstructor from "@Environment/Library/DOM/object/warnings/WarningConstructor"
import SettingsLayout from "@Core/Services/Settings/user/layout"
import { $$ } from "@Core/Services/Language/handler"
import Navigation from "@Core/Services/navigation"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import SettingsLayoutManager from "@Core/Services/Settings/user/manager"
import { CoreLoader } from "@Core/Init/CoreLoader"
import Auth from "@App/modules/mono/services/Auth"
import WarningConstructorButton from "@Environment/Library/DOM/object/warnings/WarningConstructorButton"
import { TwoSidesWrapper, Icon } from "@Environment/Library/DOM/object"
import { Align } from "@Environment/Library/DOM/style"
import MonoAPI from "@App/modules/mono/API/clients/MonoAPI"
import { CardList } from "@Environment/Library/DOM/object/card"
import DOM from "@DOMPath/DOM/Classes/dom"
import CardCustomization from "@App/modules/mono/controllers/CardCustomization"
import generateDBSettingsLayout from "../SettingsLayout/DBPresence"
import generateLanguageList from "../SettingsLayout/LanguageList"
import generateTFSettingsLayout from "../SettingsLayout/Transformators"


CoreLoader.registerTask({
    id: "settings-layout",
    presence: "Settings Layout",
    async task() {
        const layout = new SettingsLayout()
            .createAct({
                id: "settings", dom: SettingsActContainer, options: { name: $$("settings") },
            })
            .createAct({
                id: "storage",
                dom: SettingsActContainer,
                options: { name: $$("@settings/storage") },
            })
            .createAct({
                id: "language",
                dom: SettingsActContainer,
                options: { name: $$("@settings/language") },
            })
            .createAct({
                id: "transformators",
                dom: SettingsActContainer,
                options: { name: $$("@settings/tf") },
            })


        layout.getAct("settings")
            .createSection({
                id: "recovery-mode-section",
                display: isRecoveryMode,
                dom: SettingsSectionElement,
                options: {},
            })
            .createSection({ id: "auth-promo", dom: SettingsSectionElement, options: {} })
            .createSection({ id: "general", dom: SettingsSectionElement, options: { name: $$("@settings/general") } })
            .getSection("general")
            .createGroup({ id: "main-group", dom: SettingsGroupContainer, options: {} })
            .getGroup("main-group")
            .createItem({ dom: SettingsActLink, options: [() => { Navigation.url = { module: "about" } }, $$("@about/app")], id: "about-screen-link" })
            .createItem({ dom: SettingsActLink, options: ["storage", $$("@settings/storage")], id: "storage-link" })
            .createItem({ dom: SettingsActLink, options: ["language", $$("@settings/language")], id: "language-link" })

        layout.getAct("settings").getSection("auth-promo")
            .createGroup({
                id: "auth-promo-group", dom: SettingsGroupContainer, options: {},
            })
            .getGroup("auth-promo-group")
            .createItem({
                dom() {
                    const accounts = Auth.authed

                    if (accounts.length === 0) {
                        return new WarningConstructorButton({
                            type: 1,
                            title: $$("@settings/auth/not_logined_title"),
                            content: $$("@settings/auth/not_logined_text"),
                            icon: "person_pin",
                            button: {
                                content: $$("@settings/auth/log_in"),
                                handler() {
                                    Navigation.url = { module: "auth" }
                                },
                            },
                        })
                    }

                    const elements = []

                    accounts.forEach((account) => {
                        const element = new TwoSidesWrapper(
                            new Align([
                                new Icon("account_circle", { fontSize: "32px", opacity: 0.5, marginRight: "10px" }),
                                new Align([
                                    new DOM({ new: "div", content: account.name }),
                                    new DOM({
                                        new: "div",
                                        content:
                                    (account instanceof MonoAPI ? $$("@settings/auth/personal_token") : $$("@settings/auth/monobank_account")),
                                        style: {
                                            opacity: 0.5,
                                            fontSize: "0.7em",
                                        },
                                    }),
                                ], ["column"]),
                            ], ["row", "middle"]),
                            new DOM({
                                new: "div",
                                content: new Icon("cancel"),
                                events: [
                                    {
                                        event: "click",
                                        async handler() {
                                            await Auth.destroyInstance(account.id)
                                            // eslint-disable-next-line no-self-assign
                                            Navigation.url = Navigation.url
                                        },
                                    },
                                ],
                                style: {
                                    cursor: "pointer",
                                    display: "flex",
                                },
                            }),
                        )
                        elements.push(element)
                    })

                    return new CardList([
                        ...elements.map((content) => ({ content })),
                        {
                            content: new Align([
                                new Icon("add", { fontSize: "32px", opacity: 0.5, marginRight: "10px" }),
                                new Align([
                                    new DOM({ new: "div", content: $$("@settings/auth/add_account") }),
                                ], ["column"]),
                            ], ["row", "middle"]),
                            handler() {
                                Navigation.url = { module: "auth" }
                            },
                        },
                        {
                            content: new Align([
                                new Icon("credit_card", { fontSize: "32px", color: "var(--color-main)", marginRight: "10px" }),
                                new Align([
                                    new DOM({ new: "div", content: $$("@customization/open") }),
                                ], ["column"]),
                            ], ["row", "middle"]),
                            handler() {
                                CardCustomization.cardList()
                            },
                        },
                    ], true)
                },
                options: [],
                id: "auth-link",
            })

        layout.getAct("settings").getSection("recovery-mode-section")
            .createGroup({
                id: "recovery-mode-alert", dom: SettingsGroupContainer, options: { type: ["warn-highlight"] },
            })
            .getGroup("recovery-mode-alert")
            .createItem({
                id: "recovery-mode-alert-text",
                dom: WarningConstructor,
                options: {
                    type: 3,
                    icon: "warning",
                    title: $$("@recovery_mode/now"),
                    content: $$("@recovery_mode/back_to_normal"),
                },
            })


        layout.getAct("settings")
            .createSection({
                id: "miscellaneous",
                dom: SettingsSectionElement,
                options: { name: $$("@experiments/miscellaneous") },
                display: async () => !!await SettingsStorage.getFlag("miscellaneous_in_settings"),
            })
            .getSection("miscellaneous")
            .createGroup({ id: "experiments-menus", dom: SettingsGroupContainer, options: {} })
            .getGroup("experiments-menus")
            .createItem({ dom: SettingsActLink, options: [() => { Navigation.url = { module: "flags" } }, $$("experiments")], id: "experiments-menu-link" })

        generateDBSettingsLayout(layout.getAct("storage"))

        generateLanguageList(layout.getAct("language"))

        generateTFSettingsLayout(layout.getAct("transformators"))

        SettingsLayoutManager.applyLayout(layout)
    },
})
