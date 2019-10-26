import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import Listeners from "@Core/Services/Listeners"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import DOMController from "@DOMPath/DOM/Helpers/domController"

CoreLoader.registerTask({
    id: "accesibility",
    presence: "Accesibility features",
    async task() {
        if (!await SettingsStorage.getFlag("enable_tab_navigation")) return new CoreLoaderSkip()

        DOMController.setConfig({
            eventsOnClickAutoTabIndex: true,
        })

        Listeners.add(document, "keypress", (a) => { if (a.code === "Enter") { document.activeElement.click() } })

        return new CoreLoaderResult()
    },
})
