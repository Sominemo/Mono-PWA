import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import Flags from "./Flags"
import Auth from "./Auth"

CoreLoader.registerTask({
    id: "upgrade-manager",
    presence: "Upgrade",
    async task() {
        const accounts = (await (await Auth.accountsDB()).getAll())
            .filter((account) => (
                account.settings.type === "corp"
                && !("notificationServer" in account.settings)
                && !(account.settings.mask & Flags.Auth.PUSH_SUPPORTED)))

        if (!accounts.length) return new CoreLoaderSkip()

        await Promise.all(
            accounts.map(async (account) => {
                if (account.settings.domain === `${Flags.AuthConfig.domain}/request`) {
                    account.settings.notificationServer = Flags.AuthConfig.notificationServer
                }

                account.settings.mask |= Flags.Auth.PUSH_SUPPORTED
                await Auth.updateInstance(account.id, account.settings)
            }),
        )

        return new CoreLoaderResult()
    },
})
