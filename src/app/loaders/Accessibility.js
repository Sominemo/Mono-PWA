import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import Listeners from "@Core/Services/Listeners"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import DOMController from "@DOMPath/DOM/Helpers/domController"
import { Scaffold } from "@Environment/Library/DOM/buildBlock"

CoreLoader.registerTask({
    id: "accesibility",
    presence: "Accesibility features",
    async task() {
        if (!await SettingsStorage.getFlag("enable_tab_navigation")) {
            return new CoreLoaderSkip()
        }

        DOMController.setConfig({
            eventsOnClickAutoTabIndex: true,
        })

        Listeners.add(document, "keypress", (a) => { if (a.keyCode === 13 || a.which === 13) { document.activeElement.click() } })

        Scaffold.accessibility = true

        return new CoreLoaderResult()
    },
})
