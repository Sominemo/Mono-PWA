import hashCode from "@Core/Tools/transformation/text/hashCode"
import NotificationManager from "@Core/Services/Push/NotificationManager"
import MonoNotificationService from "./MonoNotificationService"

export default class MonoNotificationCluster extends MonoNotificationService {
    constructor(data) {
        super(data)
        const service = new MonoNotificationService(data)
        service.cluster = this
        this.items[service.id] = service
        this.initiator = service
        this.api = data.api
        this.key = data.cert
        this.updateEndpoint = (subscription) => {
            Object.values(this.items).forEach((s) => s.updateEndpoint(subscription))
        }

        this.waiter = this.pushManagerRegister(this, ("endpoint" in data ? data.endpoint : null))
    }

    items = {}

    async pushManagerRegister(...data) {
        await NotificationManager.register(...data)
        return this.initiator
    }

    register(data) {
        if (data.api !== this.api || data.cert !== this.key) throw new TypeError("This Service can't be maintained by this cluster")
        const service = new MonoNotificationService(data)
        const { id } = service

        if (id in this.items) return this.items[id]

        this.items[id] = service
        service.cluster = this

        return service
    }

    get id() {
        return hashCode(JSON.stringify({ type: "cluster", api: this.api, key: this.key }))
    }

    async getList(sub) {
        const self = this
        const lists = await Promise.all(
            Object.values(this.items).map((service) => service.getList(sub)),
        )

        const res = new Map()
        lists.forEach((list) => list.forEach((channel) => {
            res.set(
                JSON.stringify({ id: channel.descriptor.id, type: channel.descriptor.type }),
                channel,
            )
        }))

        return Array.from(res.values()).map((channel) => {
            channel.shadowService = channel.service
            channel.service = self
            return channel
        })
    }

    async subscribe(channel, sub) {
        await channel.shadowService.subscribe(channel, sub)
        this.activated(sub)
    }

    unsubscribe(channel, sub) {
        return channel.shadowService.unsubscribe(channel, sub)
    }
}
