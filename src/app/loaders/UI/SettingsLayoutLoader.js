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
                    if (!Auth.instance.authed) {
                        return new SettingsActLink([() => { Navigation.url = { module: "auth" } }, $$("@settings/auth/log_in")])
                    }


                    return new WarningConstructorButton({
                        content: $$("@settings/auth/logined"),
                        button: {
                            content: $$("@settings/auth/log_out"),
                            async handler() {
                                await Promise.all([SettingsStorage.set("token", ""), SettingsStorage.set("auth_domain", null)])
                                Navigation.url = { module: "settings" }
                            },
                        },
                    })
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
