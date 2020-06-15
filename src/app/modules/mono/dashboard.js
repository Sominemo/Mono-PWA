import Navigation from "@Core/Services/navigation"
import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import { $$ } from "@Core/Services/Language/handler"
import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import { Title } from "@Environment/Library/DOM/object"

export default class DashboardUI {
    static Init() {
        Navigation.updateTitle($$("dashboard"))
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)
        w.render(new Title("В разработке..."))
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
