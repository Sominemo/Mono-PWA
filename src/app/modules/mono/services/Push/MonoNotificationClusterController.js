import hashCode from "@Core/Tools/transformation/text/hashCode"
import MonoNotificationCluster from "./MonoNotificationCluster"

export default class MonoNotificationClusterController {
    static list = {}

    static register(data) {
        const id = hashCode(JSON.stringify({ api: data.api, key: data.key }))
        if (id in this.list) return this.list[id].register(data)

        this.list[id] = new MonoNotificationCluster(data)
        return this.list[id].waiter
    }
}
