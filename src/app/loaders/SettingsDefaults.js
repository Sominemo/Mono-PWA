import SettingsCheckProvider from "@Core/Services/Settings/SettingsCheckProvider"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import App from "@Core/Services/app"
import { CoreLoader, CoreLoaderResult } from "@Core/Init/CoreLoader"
import { API } from "@App/tools/API"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"

CoreLoader.registerTask({
    id: "settings-defaults",
    presence: "Set Setings defaults and checkers",
    async task() {
        SettingsCheckProvider.setRules([
            {
                name: "miscellaneous_in_settings",
                rule: {
                    default: App.debug,
                    checker: new FieldChecker({ type: "boolean" }),
                    onfail: async (a, b, c) => { await c(!!a); return true },
                },
            },
            {
                name: "ui_wm_adv_transitions",
                rule: {
                    default: true,
                    checker: new FieldChecker({ type: "boolean" }),
                    onfail: async (a, b, c) => { await c(!!a); return true },
                },
            },
            {
                name: "ui_wm_adv_css_transitions",
                rule: {
                    default: true,
                    checker: new FieldChecker({ type: "boolean" }),
                    onfail: async (a, b, c) => { await c(!!a); return true },
                },
            },
            {
                name: "ui_wm_no_transitions",
                rule: {
                    default: false,
                    checker: new FieldChecker({ type: "boolean" }),
                    onfail: async (a, b, c) => { await c(!!a); return true },
                },
            },
            {
                name: "deny_analytics",
                rule: {
                    default: !!window.navigator.doNotTrack || false,
                    checker: new FieldChecker({ type: "boolean" }),
                    onfail: async (a, b, c) => { await c(!!a); return true },
                },
            },
            {
                name: "offline_mode",
                rule: {
                    default: !window.navigator.onLine,
                    checker: new FieldChecker({ type: "boolean" }),
                    onfail: async (a, b, c) => { await c(!!a); return true },
                    onupdate(a) { API.offlineMode = a },
                },
            },
        ], "flags")

        SettingsCheckProvider.setRules([
            {
                name: "statement_db_version",
                rule: {
                    default: 0,
                    checker: new FieldChecker({ isInt: true }),
                    onfail: async (a, b, c) => { await c(0); return true },
                },
            },
        ])

        API.offlineMode = await SettingsStorage.getFlag("offline_mode")

        return new CoreLoaderResult(true, { SettingsCheckProvider })
    },
})
