import NotificationService from "@Core/Services/Push/NotificationService"
import NotificationChannel from "@Core/Services/Push/NotificationChannel"
import hashCode from "@Core/Tools/transformation/text/hashCode"
import MonoNotificationChannelDescriptor from "./MonoNotificationChannelDescriptor"

export default class MonoNotificationService extends NotificationService {
    constructor({
        token, api, cert, name = "Mono Corp API Proxy-powered Push Server", updateEndpoint = (endpoint) => { },
    }) {
        super(cert, name)

        this.api = `${api}/${token}`
        this.updateEndpoint = updateEndpoint
    }

    get id() {
        return hashCode(JSON.stringify({ api: this.api, key: this.key }))
    }

    async activated(subscription) {
        await this.updateEndpoint(subscription.endpoint)
    }

    async getList(sub) {
        const self = this

        const formdata = new FormData()
        if (sub) formdata.append("endpoint", sub.endpoint)

        const requestOptions = {
            method: "POST",
            body: formdata,
        }

        const r = await (await fetch(`${this.api}/list`, requestOptions)).json()

        return r.map((channel) => new NotificationChannel(
            self,
            new MonoNotificationChannelDescriptor(
                {
                    type: channel.type,
                    id: channel.id,
                    icon: channel.icon,
                    sign: channel.sign,
                    description: channel.description,
                },
            ),
            {
                state: channel.state,
                status: null,
            },
        ))
    }

    async subscribe(channel, sub) {
        const key = sub.getKey("p256dh")
        const token = sub.getKey("auth")
        const contentEncoding = (PushManager.supportedContentEncodings || ["aesgcm"])[0]

        const formdata = new FormData()
        formdata.append("endpoint", sub.endpoint)
        formdata.append("key", key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null)
        formdata.append("cert", this.key)
        formdata.append("auth", token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null)
        formdata.append("type", channel.descriptor.type)
        formdata.append("id", channel.descriptor.id)
        formdata.append("encoding", contentEncoding)
        formdata.append("expires", (sub.expirationTime ? sub.expirationTime : 0))
        formdata.append("channels", JSON.stringify([{ type: channel.descriptor.type, id: channel.descriptor.id }]))

        const requestOptions = {
            method: "POST",
            body: formdata,
        }

        const r = await (await fetch(`${this.api}/subscribe`, requestOptions)).json()
        if ("error" in r) throw new Error(`Subscribe Push API Error: ${r.error}`)
    }

    async unsubscribe(channel, sub) {
        const formdata = new FormData()
        formdata.append("endpoint", sub.endpoint)
        formdata.append("channels", JSON.stringify([{ type: channel.descriptor.type, id: channel.descriptor.id }]))

        const requestOptions = {
            method: "POST",
            body: formdata,
        }

        const r = await (await fetch(`${this.api}/unsubscribe`, requestOptions)).json()
        if ("error" in r) throw new Error(`Unsubscribe Push API Error: ${r.error}`)
    }
}
