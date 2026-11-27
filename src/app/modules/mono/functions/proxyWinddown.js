import { $$, $ } from "@Core/Services/Language/handler"
import WarningConstructorButton from "@Environment/Library/DOM/object/warnings/WarningConstructorButton"
import MonoCorpAPI from "../API/clients/MonoCorpAPI"

const DEPRECATED_PROXY_HOST = "api.mono.sominemo.com"

export function isDeprecatedProxyAccount(client) {
    if (!(client instanceof MonoCorpAPI)) return false
    try {
        return new URL(client.domain).hostname === DEPRECATED_PROXY_HOST
    } catch (e) {
        return false
    }
}

export function createProxyWinddownWarning(style = {}) {
    return new WarningConstructorButton({
        type: 3,
        icon: "warning",
        title: $$("auth/proxy_winddown/title"),
        content: $$("auth/proxy_winddown"),
        style,
        button: {
            content: $$("auth/proxy_winddown/more"),
            handler() {
                window.open($("auth/proxy_winddown/link"), "_blank")
            },
        },
    })
}
