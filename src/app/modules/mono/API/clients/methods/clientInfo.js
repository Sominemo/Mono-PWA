import OfflineCache from "@App/modules/mono/services/OfflineCache"
import Auth from "@App/modules/mono/services/Auth"
import Client from "../../classes/Client"

export default async function clientInfo({ preferOffline = false } = {}) {
    let data = {}
    let self = this
    let online = true
    try {
        if (preferOffline) throw new Error("Use offline")
        data = await this.call("personal/client-info", {
            methodID: "personal/client-info",
            useAuth: true,
        })

        if (this.id !== 0) OfflineCache.updateAccounts(this.id, data.accounts || [])
    } catch (e) {
        data.accounts = await OfflineCache.getAccounts(this.id) || []
        data.name = this.name
        online = false
    }


    if (!("name" in data && "accounts" in data)) throw Error("Incorrect Client Info")
    if (this.name !== data.name) {
        this.name = data.name
        await Auth.updateName(this.id, data.name)
        self = Auth.getInstanceByID(this.id)
    }
    return new Client(data.name, data.accounts, data.clientId, self, data, online)
}
