import Navigation from "@Core/Services/navigation"
import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import { $$ } from "@Core/Services/Language/handler"
import WindowManager from "@Core/Services/SimpleWindowManager"
import ModernBlocks from "@Environment/Library/DOM/buildBlock/modernBlocks"
import TestWidget from "./widgets/TestWidget"
import NavWidget from "./widgets/NavWidget"

export default class DashboardUI {
    static Init() {
        Navigation.updateTitle($$("dashboard"))
        const w = new ModernBlocks({
            centering: false,
            widgets: [
                { item: new TestWidget(), x: 3, y: 1 },
                { item: new NavWidget({ data: { link: { module: "settings" } } }), x: 3, y: 2 },
                { item: new NavWidget({ data: { link: { module: "currency" } } }), x: 1, y: 1 },
                { item: new NavWidget({ data: { link: { module: "partners" } } }), x: 2, y: 1 },
                { item: new NavWidget({ data: { link: { module: "statement" } } }), x: 1, y: 2 },
            ],
        })
        WindowManager.newWindow().append(w)
    }
}

CoreLoader.registerTask({
    id: "dashboard_module",
    presence: "Dashboard",
    async task() {
        if (!(await SettingsStorage.getFlag("next_features"))) return new CoreLoaderSkip()
        Navigation.addModule({
            name: "Dashboard",
            id: "dashboard",
            callback() { DashboardUI.Init() },
        })

        Navigation.InitNavigationError = () => {
            Navigation.url = { module: "dashboard" }
        }

        Navigation.defaultScreen = () => {
            Navigation.url = { module: "dashboard" }
        }

        Navigation.titleFallback = "monobank"

        return new CoreLoaderResult()
    },
})
