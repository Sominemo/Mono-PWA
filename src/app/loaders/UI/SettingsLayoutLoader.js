import {
    SettingsActContainer, SettingsSectionElement, SettingsGroupContainer, SettingsActLink,
} from "@App/modules/main/settings"
import { isRecoveryMode } from "@App/debug/recovery"
import WarningConstructor from "@Environment/Library/DOM/object/warnings/WarningConstructor"
import SettingsLayout from "@Core/Services/Settings/user/layout"
import { $$, $ } from "@Core/Services/Language/handler"
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
import { SwitchLabel } from "@Environment/Library/DOM/object/input"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import BRify from "@Core/Tools/transformation/text/BRify"
import generateDBSettingsLayout from "../SettingsLayout/DBPresence"
import generateLanguageList from "../SettingsLayout/LanguageList"
import generateTFSettingsLayout from "../SettingsLayout/Transformators"
import generateNotificationsSettingsLayout from "../SettingsLayout/Notifications"
import generatePrivacyLayout from "../SettingsLayout/Privacy"

function sideLogo(icon, text, moreText) {
    return new Align([
        new Icon(icon, { margin: "0 15px 0 5px" }),
        new Align([
            new DOM({ new: "div", content: text }),
            ...(moreText ? [new DOM({
                new: "div", style: { opacity: "0.6", fontSize: "0.8em" }, content: moreText,
            })] : []),
        ], ["column"]),
    ], ["row", "middle"], { marginRight: "5px" })
}


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
                options: { name: $$("settings/storage") },
            })
            .createAct({
                id: "language",
                dom: SettingsActContainer,
                options: { name: $$("settings/language") },
            })
            .createAct({
                id: "transformators",
                dom: SettingsActContainer,
                options: { name: $$("settings/tf") },
            })
            .createAct({
                id: "notifications",
                dom: SettingsActContainer,
                options: { name: $$("settings/notifications") },
            })
            .createAct({
                id: "privacy",
                dom: SettingsActContainer,
                options: { name: $$("settings/privacy") },
            })


        const isPushSupported = "ServiceWorkerRegistration" in window
            && "pushManager" in ServiceWorkerRegistration.prototype

        const settingsMain = layout.getAct("settings")
            .createSection({
                id: "recovery-mode-section",
                display: isRecoveryMode,
                dom: SettingsSectionElement,
                options: {},
            })
            .createSection({ id: "auth-promo", dom: SettingsSectionElement, options: {} })
            .createSection({ id: "fast-settings", dom: SettingsSectionElement, options: { name: $$("quick_settings") } })
            .createSection({ id: "general", dom: SettingsSectionElement, options: { name: $$("settings/general") } })
            .getSection("general")
            .createGroup({ id: "main-group", dom: SettingsGroupContainer, options: {} })
            .getGroup("main-group")

        if ("serviceWorker" in navigator) {
            settingsMain.createItem({
                dom: SettingsActLink,
                options: [
                    (isPushSupported
                        ? "notifications"
                        : () => Prompt({
                            title: $$("push/not_supported_title"),
                            text: BRify($$("push/not_supported_text")),
                            buttons: [{ content: $$("close"), handler: "close" }],
                        })),
                    sideLogo("notifications",
                        $$("settings/notifications"),
                        (isPushSupported ? $("settings/descriptions/notifications")
                            : $("push/not_supported"))),
                    !isPushSupported,
                    !isPushSupported,
                ],
                id: "notifications-link",
            })
        }

        settingsMain
            .createItem({ dom: SettingsActLink, options: ["storage", sideLogo("storage", $$("settings/storage"), $("settings/descriptions/storage"))], id: "storage-link" })
            .createItem({ dom: SettingsActLink, options: ["language", sideLogo("translate", $$("settings/language"), $("settings/descriptions/language"))], id: "language-link" })
            .createItem({ dom: SettingsActLink, options: ["privacy", sideLogo("https", $$("settings/privacy"), $("settings/privacy/info"))], id: "privacy-link" })
            .createItem({
                dom: SettingsActLink, options: [() => { Navigation.url = { module: "about" } }, sideLogo("info", $$("about/app"), $("settings/descriptions/about_app"))], id: "about-screen-link",
            })

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
                            title: $$("settings/auth/not_logined_title"),
                            content: $$("settings/auth/not_logined_text"),
                            icon: "person_pin",
                            button: {
                                content: $$("settings/auth/log_in"),
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
                                new Icon("account_circle", { fontSize: "32px", opacity: 0.5, marginRight: "15px" }),
                                new Align([
                                    new DOM({ new: "div", content: account.name }),
                                    new DOM({
                                        new: "div",
                                        content:
                                            (account instanceof MonoAPI ? $$("settings/auth/personal_token") : $$("settings/auth/monobank_account")),
                                        style: {
                                            opacity: 0.6,
                                            fontSize: "0.8em",
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
                                class: ["clickable-square"],
                            }),
                        )
                        elements.push(element)
                    })

                    return new CardList([
                        ...elements.map((content) => ({ content })),
                        {
                            content: new Align([
                                new Icon("add", { opacity: 0.5, margin: "0 15px 0 5px" }),
                                new Align([
                                    new DOM({ new: "div", content: $$("settings/auth/add_account") }),
                                ], ["column"]),
                            ], ["row", "middle"]),
                            handler() {
                                Navigation.url = { module: "auth" }
                            },
                        },
                        {
                            content: new Align([
                                new Icon("credit_card", { color: "var(--color-main)", margin: "0 15px 0 5px" }),
                                new Align([
                                    new DOM({ new: "div", content: $$("customization/open") }),
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

        layout.getAct("settings").getSection("fast-settings")
            .createGroup({
                id: "fast-settings-group", dom: SettingsGroupContainer, options: {},
            })
            .getGroup("fast-settings-group")
            .createItem({
                async dom() {
                    return new CardList([
                        {
                            content: new SwitchLabel(
                                [
                                    await SettingsStorage.getFlag("offline_mode"), (n) => {
                                        SettingsStorage.setFlag("offline_mode", n)
                                    },
                                ],
                                sideLogo("signal_wifi_off", $$("offline_mode"), $("settings/descriptions/offline_mode")),
                            ),

                        },
                        {
                            content: new SwitchLabel(
                                [
                                    await SettingsStorage.getFlag("show_minor_part"), (n) => {
                                        SettingsStorage.setFlag("show_minor_part", n)
                                    },
                                ],
                                sideLogo("attach_money", $$("show_minor_part"), $("settings/descriptions/show_minor_part")),
                            ),
                        },
                        {
                            content: new SwitchLabel(
                                [
                                    await SettingsStorage.getFlag("hide_credit_limit"), (n) => {
                                        SettingsStorage.setFlag("hide_credit_limit", n)
                                    },
                                ],
                                sideLogo("label_off", $$("hide_credit_limit"), $("settings/descriptions/hide_credit_limit")),
                            ),
                        },
                    ])
                },
                options: [],
                id: "fast-settings-toggle",
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
                    title: $$("recovery_mode/now"),
                    content: $$("recovery_mode/back_to_normal"),
                },
            })


        layout.getAct("settings")
            .createSection({
                id: "miscellaneous",
                dom: SettingsSectionElement,
                options: { name: $$("experiments/miscellaneous") },
                display: async () => !!await SettingsStorage.getFlag("miscellaneous_in_settings"),
            })
            .getSection("miscellaneous")
            .createGroup({ id: "experiments-menus", dom: SettingsGroupContainer, options: {} })
            .getGroup("experiments-menus")
            .createItem({ dom: SettingsActLink, options: [() => { Navigation.url = { module: "flags" } }, sideLogo("category", $$("experiments"), $("settings/descriptions/experiments"))], id: "experiments-menu-link" })

        generateDBSettingsLayout(layout.getAct("storage"))
        generateLanguageList(layout.getAct("language"))
        generateTFSettingsLayout(layout.getAct("transformators"))
        generateNotificationsSettingsLayout(layout.getAct("notifications"))
        generatePrivacyLayout(layout.getAct("privacy"))

        SettingsLayoutManager.applyLayout(layout)
    },
})
