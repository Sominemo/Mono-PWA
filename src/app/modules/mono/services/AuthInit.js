import { CoreLoader } from "@Core/Init/CoreLoader"
import Auth from "./Auth"

CoreLoader.registerTask({
    id: "auth-loader",
    presence: "Auth",
    async task() {
        await Auth.initInstances()
    },
})
