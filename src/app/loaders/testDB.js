import {
    CoreLoader, CoreLoaderResult, CoreLoaderError,
} from "@Core/Init/CoreLoader"
import SettingsStorage from "../../core/Services/Settings/SettingsStorage"

CoreLoader.registerTask({
    id: "test-db-writable",
    presence: "IDB Usability",

    async task() {
        let test = true
        let err
        try {
            test = await SettingsStorage.setFlag("idb_compatible_test", true)
        } catch (e) {
            test = false
            err = e
        }
        if (!test) {
            throw new CoreLoaderError("Ваш браузер блокує доступ до бази даних. \nЗастосунок не може працювати у приватному режимі Firefox.", err)
        }
        return new CoreLoaderResult()
    },
})
