import filterURL from "@App/tools/validate/filterURL"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import { CoreLoader } from "@Core/Init/CoreLoader"
import Navigation from "@Core/Services/navigation"
import DOM from "@DOMPath/DOM/Classes/dom"
import { Button, ContentEditable } from "@Environment/Library/DOM/object/input"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import WarningConstructor from "@Environment/Library/DOM/object/warnings/WarningConstructor"
import {
    Card, CardList, CardContent, CardTextList,
} from "@Environment/Library/DOM/object/card"
import { Title } from "@Environment/Library/DOM/object"
import Toast from "@Environment/Library/DOM/elements/toast"
import loadingPopup from "@App/library/loadingPopup"
import tryToOpenProtocol from "custom-protocol-detection"
import { Align } from "@Environment/Library/DOM/style"
import { $$ } from "@Core/Services/Language/handler"
import BRify from "@Core/Tools/transformation/text/BRify"
import Report from "@Core/Services/report"
import PWA from "../main/PWA"
import Auth from "./services/Auth"

class AuthSettings {
    constructor(s = null, options = {}) {
        if (typeof s !== "object") throw new TypeError("Object expected")
        this._settings = s
        this._options = options
    }

    _settings = null

    get are() {
        // eslint-disable-next-line no-use-before-define
        return (this._settings === null ? AuthUI.getDefault() : this._settings)
    }

    set are(s) {
        if (typeof s !== "object") throw new TypeError("Object expected")
        this._settings = s
        if (this.isDefault) this._options.warningsList.defaultsChanged.destructSelf()
        else this._options.warnings.render(this._options.warningsList.defaultsChanged)
    }

    get isDefault() {
        return this._settings === null
    }
}

export default class AuthUI {
    static authTypes = {
        DIRECT: 0,
        CORP: 1,
    }

    static getDefault() {
        return this.useCorp()
    }

    static useDirect(token) {
        if (typeof token !== "string") throw new TypeError("String token expected")

        return {
            domain: "https://api.monobank.ua",
            type: this.authTypes.DIRECT,
            token,
        }
    }

    static useCorp(userDomain = "https://api.mono.sominemo.com") {
        const domain = filterURL(userDomain)
        if (!domain) throw new TypeError("String domain expected")

        return {
            domain,
            type: this.authTypes.CORP,
        }
    }

    static start({
        cancel = () => { Navigation.defaultScreen(); return true },
        start = null, state = null,
    } = {}) {
        if (state === null) {
            const warningsList = {
                defaultsChanged: new WarningConstructor({
                    content: $$("@auth/login_params_changed"),
                    icon: "info",
                    type: 3,
                    style: { textAlign: "start" },
                }),
            }

            const warnings = new DOM({
                new: "div",
            })

            const settings = new AuthSettings(start, { warnings, warningsList })

            if (!settings.isDefault) warnings.render(warningsList.defaultsChanged)

            state = {
                settings, warnings, warningsList,
            }
        }

        const p = Prompt({
            pureText: true,
            text: new DOM({
                new: "div",
                class: "login-box-center",
                content: [
                    new DOM({
                        new: "div",
                        class: ["center-box"],
                        content: [
                            new DOM({
                                new: "div",
                                class: ["auth-title"],
                                content: $$("@auth/login_promo"),
                            }),
                            new Button({
                                content: $$("@auth/log_in"),
                                handler() { AuthUI.continue(state) },
                            }),
                            state.warnings,
                            new DOM({
                                new: "div",
                                content: $$("@about/disclaimer_title"),
                                style: {
                                    fontSize: ".7em",
                                    opacity: ".7",
                                    cursor: "pointer",
                                },
                                events: [
                                    {
                                        event: "click",
                                        handler() {
                                            PWA.disclaimer()
                                        },
                                    },
                                ],
                            }),
                        ],
                    }),
                    new DOM({
                        new: "div",
                        class: ["bottom-box"],
                        content: [
                            new Button({
                                content: new IconSide("chevron_right", $$("@auth/skip_step")),
                                type: ["clean", "round"],
                                async handler() {
                                    if (await cancel()) p.close()
                                },
                            }),
                            new Button({
                                content: new IconSide("chevron_right", $$("@auth/settings")),
                                type: ["clean", "round"],
                                handler() { AuthUI.settings(state) },
                            }),
                        ],
                    }),
                ],
            }),
            popupSettings: {
                cardClass: ["auth-card-with-bg"],
                fullWidth: true,
                fullHeight: true,
                noClose: true,
            },
        })

        state.blockerPopup = p
    }

    static settings(state) {
        const p = Prompt({
            title: $$("@auth/settings"),
            text: new Card(
                new CardList([
                    {
                        handler() { AuthUI.setToken(state); p.close() },
                        content: new IconSide("vpn_key",
                            [
                                new Title($$("@auth/settings/token"), 4, { margin: 0 }),
                                new DOM({ new: "div", content: $$("@auth/settings/token/description") }),
                            ], { style: { marginRight: "15px" } }),
                    },
                    {
                        handler() { AuthUI.setDomain(state); p.close() },
                        content: new IconSide("domain",
                            [
                                new Title($$("@auth/settings/domain"), 4, { margin: 0 }),
                                new DOM({ new: "div", content: $$("@auth/settings/domain/description") }),
                            ], { style: { marginRight: "15px" } }),
                    },
                    {
                        handler() { AuthUI.resetState(state); p.close() },
                        content: new IconSide("history",
                            [
                                new Title($$("@auth/settings/revert"), 4, { margin: 0 }),
                                new DOM({ new: "div", content: $$("@auth/settings/revert/description") }),
                            ], { style: { marginRight: "15px" } }),
                    },
                ], true),
                { style: { marginLeft: 0, marginRight: 0, marginTop: 0 } },
            ),
        })
    }

    static setToken(state) {
        let value = ""

        let p

        function next() {
            value = value.trim()
            if (!(value.length > 0)) return
            state.settings.are = AuthUI.useDirect(value)
            p.close()
        }


        p = Prompt({
            title: $$("@auth/settings/token/title"),
            text: [
                new ContentEditable({
                    placeholder: $$("@auth/settings/token/token"),
                    change(v) { value = v },
                    onEnter(v, ev, el) {
                        ev.preventDefault()
                        value = el.actualValue
                        next()
                    },
                    focusOnRender: true,
                }),
                new Card(new CardContent(
                    new IconSide("vpn_key",
                        [
                            new Title($$("@auth/settings/token"), 4, { margin: 0 }),
                            new DOM({ new: "div", content: $$("@auth/settings/token/description") }),
                        ], { style: { marginRight: "15px" } }),
                ), { style: { margin: "10px 0" } }),
            ],
            buttons: [
                {
                    content: $$("close"),
                    handler: "close",
                    type: ["light"],
                },
                {
                    content: $$("next"),
                    handler: next,
                },
            ],
        })
    }

    static setDomain(state) {
        let domain = ""

        let p

        async function next() {
            domain = domain.trim()
            const l = loadingPopup()
            try {
                const r = await (await fetch(`${domain}/check-proto`)).json()
                if (r.proto.version !== 1) throw new Error("Unsupported protocol version")

                const ap = Prompt({
                    title: $$("@auth/settings/domain/proto_detected"),
                    text: new CardTextList([
                        new ContentEditable({
                            placeholder: $$("@auth/settings/domain/name"),
                            editable: false,
                            content: r.implementation.name,
                        }),
                        new ContentEditable({
                            placeholder: $$("@auth/settings/domain/author"),
                            editable: false,
                            content: r.implementation.author,
                        }),
                        new ContentEditable({
                            placeholder: $$("@auth/settings/domain/proto_ver"),
                            editable: false,
                            content: `${r.proto.version}.${r.proto.patch}`,
                        }),
                        new Button({
                            content: $$("@auth/settings/domain/visit_homepage"),
                            handler() {
                                window.open(r.implementation.homepage, "_target")
                            },
                            type: ["clean", "small"],
                        }),
                    ]),
                    buttons: [
                        {
                            content: $$("close"),
                            handler: "close",
                            type: ["light"],
                        },
                        {
                            content: $$("accept"),
                            handler() {
                                state.proto = r
                                state.settings.are = AuthUI.useCorp(domain)
                                ap.close()
                                p.close()
                            },
                        },
                    ],
                })
            } catch (e) {
                Toast.add($$("@auth/settings/domain/unsupported_server"))
            }

            l.close()
        }

        p = Prompt({
            title: $$("@auth/settings/domain/title"),
            text: [
                new ContentEditable({
                    placeholder: $$("@auth/settings/domain/url"),
                    change(v) { domain = v },
                    onEnter(v, ev, el) {
                        ev.preventDefault()
                        domain = el.actualValue
                        next()
                    },
                    content: (
                        state.settings.are.type === AuthUI.authTypes.CORP
                            && typeof state.settings.are.domain === "string"
                            && !state.settings.isDefault
                            ? state.settings.are.domain
                            : ""),
                    focusOnRender: true,
                }),
                new Card(new CardContent(
                    new IconSide("domain",
                        [
                            new Title($$("@auth/settings/domain"), 4, { margin: 0 }),
                            new DOM({ new: "div", content: $$("@auth/settings/domain/description") }),
                        ], { style: { marginRight: "15px" } }),
                ), { style: { margin: "10px 0" } }),
            ],
            buttons: [
                {
                    content: $$("close"),
                    handler: "close",
                    type: ["light"],
                },
                {
                    content: $$("next"),
                    handler: next,
                },
            ],
        })
    }

    static resetState(state) {
        state.settings.are = null
        delete state.proto
    }

    static async continue(state) {
        Report.write(state.settings.are)
        if (state.settings.are.type === AuthUI.authTypes.DIRECT) {
            this.directUI(state)
        } else if (state.settings.are.type === AuthUI.authTypes.CORP) {
            this.corpUI(state)
        } else {
            Toast.add($$("@auth/unknown_auth_method"))
        }
    }

    static async directUI(state) {
        const l = loadingPopup()
        const set = { type: "user", token: state.settings.are.token }
        const a = await Auth.genInstance({ settings: set, id: 0 })
        try {
            const result = await a.clientInfo()
            await Auth.addInstance({ ...set, name: result.name }, result.raw.accounts)

            Toast.add($$("@auth/success"))
            state.blockerPopup.close()
            Navigation.defaultScreen()
        } catch (e) {
            Report.write(e)
            Toast.add($$("@auth/fail"))
        }
        l.close()
    }

    static async corpUI(state) {
        const l = loadingPopup()
        const continueF = async (params) => {
            try {
                const r = await fetch(`${state.settings.are.domain}/roll-in`)
                const json = await r.json()

                state.roll = json

                if (/Edge/.test(navigator.userAgent)) {
                    this.showQR(state)
                    this.authWaiter(state)
                    return
                }

                tryToOpenProtocol(`app://com.ftband.mono/auth/${json.requestId}`,
                    () => {
                        this.showQR(state)
                        this.authWaiter(state)
                        l.close()
                    }, () => {
                        this.showLink(state)
                        this.authWaiter(state)
                        l.close()
                    },
                    () => {
                        this.showQR(state)
                        this.authWaiter(state)
                        l.close()
                    })
            } catch (e) {
                Toast.add($$("@auth/login_data_fetch_fail"))
                l.close()
            }
        }

        if (!("proto" in state)) {
            try {
                const r = await (await fetch(`${state.settings.are.domain}/check-proto`)).json()
                state.proto = r
            } catch (e) {
                Toast.add($$("@auth/login_data_fetch_fail"))
            }
        }

        if ("proto" in state && "message" in state.proto.server) {
            const mcp = Prompt({
                title: `${$$("@auth/settings/domain/server_message")} ${state.settings.are.domain}`,
                text: [
                    new DOM({ new: "div", content: BRify(state.proto.server.message.text) }),
                    ...("link" in state.proto.server.message ? [
                        new Button({
                            content: $$("@auth/settings/domain/see_link"),
                            handler() {
                                window.open(state.proto.server.message.link, "_target")
                            },
                            type: ["clean", "small"],
                        }),
                    ] : []),
                ],
                buttons: [
                    {
                        content: $$("close"),
                        handler() {
                            l.close()
                            mcp.close()
                        },
                        type: ["light"],
                    },
                    {
                        content: $$("accept"),
                        handler() {
                            mcp.close()
                            continueF()
                        },
                    },
                ],
            })
        } else continueF()
    }

    static authWaiter(state) {
        this.waitForUpdate(state)
            .then((r) => {
                state.waitSuccess(r)
            })
            .catch((e) => {
                state.waitError(e)
            })
    }

    static waitForUpdate(state) {
        let resolve
        let reject

        async function wait() {
            try {
                const fd = new FormData()
                fd.append("token", state.roll.token)
                const r = await fetch(`${state.settings.are.domain}/exchange-token`, { method: "POST", body: fd })
                const json = await r.json()
                if (!("token" in json)) {
                    reject(json)
                    return
                }
                if (json.token === false) {
                    setTimeout(() => wait(), 0)
                    return
                }
                resolve(json.token)
            } catch (e) {
                console.error(e)
                reject(-1)
            }
        }

        wait()

        return new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
    }

    static async showLink(state, force = false) {
        const self = this
        if (force) navigator.clipboard.writeText(state.roll.url)
        const p = Prompt({
            text: [
                new DOM({
                    new: "div",
                    content: (force ? $$("@auth/stage/link") : $$("@auth/stage/opening")),
                    style: {
                        fontWeight: "500",
                        fontSize: "20px",
                        margin: "15px 0",
                    },
                }),
                new DOM({
                    new: "div",
                    content: (force ? $$("@auth/stage/copied") : $$("@auth/stage/auto_link")),
                    style: {
                        marginBottom: "15px",
                    },
                }),
                new ContentEditable({
                    content: state.roll.url,
                    placeholder: $$("@auth/stage/link"),
                }),
                new Card(
                    new CardList([
                        {
                            content: new IconSide("link",
                                [
                                    new Title($$("@auth/stage/instructions/follow"), 4, { margin: 0 }),
                                    new DOM({ new: "div", content: $$("@auth/stage/instructions/follow/description") }),
                                ], { style: { marginRight: "15px" } }),
                        },
                        {
                            content: new IconSide("perm_device_information",
                                [
                                    new Title($$("@auth/stage/instructions/permissions"), 4, { margin: 0 }),
                                    new DOM({ new: "div", content: $$("@auth/stage/instructions/permissions/description") }),
                                ], { style: { marginRight: "15px" } }),
                        },
                    ], true),
                    { style: { marginLeft: 0, marginRight: 0, marginTop: "10px" } },
                ),
            ],
            buttons: [
                {
                    content: $$("@auth/stage/open"),
                    handler() { window.open(state.roll.url, "_blank") },
                },
                {
                    content: "QR",
                    handler() {
                        p.close()
                        self.showQR(state)
                    },
                },
                {
                    content: $$("@auth/stage/cancel"),
                    handler() {
                        p.close()
                        state.waitSuccess = () => { }
                        state.waitError = () => { }
                    },
                    type: ["light"],
                },
            ],
        })
        state.waitSuccess = async (token) => {
            p.close()
            state.blockerPopup.close()
            Toast.add($$("@auth/stage/authed"))
            await Auth.addInstance({ type: "corp", domain: `${state.settings.are.domain}/request`, token })


            Navigation.defaultScreen()
        }

        state.waitError = (e) => {
            p.close()
            Toast.add((e === -1 ? $$("@auth/stage/error") : $$("@auth/stage/timeout")))
        }
    }

    static async showQR(state) {
        const self = this
        let p1
        const p = Prompt({
            text: [
                ...("qr" in state.roll ? [
                    new Align(
                        new DOM({
                            new: "img",
                            set: {
                                src: `data:image/png;base64, ${state.roll.qr}`,
                            },
                            style: {
                                width: "22%",
                                borderRadius: "6px",
                                marginBottom: "15px",
                                cursor: "pointer",
                            },
                            events: [
                                {
                                    event: "click",
                                    handler() {
                                        p1 = Prompt({
                                            text: new DOM({
                                                new: "img",
                                                set: {
                                                    src: `data:image/png;base64, ${state.roll.qr}`,
                                                },
                                                style: {
                                                    borderRadius: "6px",
                                                },
                                            }),
                                            buttons: [
                                                {
                                                    content: $$("close"),
                                                    handler: "close",
                                                },
                                            ],
                                            popupSettings: { fullWidth: false },
                                        })
                                    },
                                },
                            ],
                        }),
                        ["row", "center"],
                        {
                            alignItems: "baseline",
                        },
                    ),
                ] : []),
                new Card(
                    new CardList([
                        {
                            content: new IconSide("camera_enhance",
                                [
                                    new Title($$("@auth/stage/instructions/scan"), 4, { margin: 0 }),
                                    new DOM({ new: "div", content: $$("@auth/stage/instructions/scan/description") }),
                                ], { style: { marginRight: "15px" } }),
                        },
                        {
                            content: new IconSide("link",
                                [
                                    new Title($$("@auth/stage/instructions/follow"), 4, { margin: 0 }),
                                    new DOM({ new: "div", content: $$("@auth/stage/instructions/follow/description") }),
                                ], { style: { marginRight: "15px" } }),
                        },
                        {
                            content: new IconSide("perm_device_information",
                                [
                                    new Title($$("@auth/stage/instructions/permissions"), 4, { margin: 0 }),
                                    new DOM({ new: "div", content: $$("@auth/stage/instructions/permissions/description") }),
                                ], { style: { marginRight: "15px" } }),
                        },
                    ], true),
                    { style: { marginLeft: 0, marginRight: 0, marginTop: 0 } },
                ),
            ],
            buttons: [
                {
                    content: $$("@auth/stage/link"),
                    handler() {
                        p.close()
                        self.showLink(state, true)
                    },
                },
                {
                    content: $$("@auth/stage/cancel"),
                    handler() {
                        p.close()
                        state.waitSuccess = () => { }
                        state.waitError = () => { }
                    },
                    type: ["light"],
                },
            ],
        })

        state.waitSuccess = async (token) => {
            try {
                const set = { type: "corp", domain: `${state.settings.are.domain}/request`, token }
                const a = await Auth.genInstance({ settings: set, id: 0 })

                const result = await a.clientInfo()
                await Auth.addInstance({ ...set, name: result.name }, result.raw.accounts)

                if (p1) p1.close()
                p.close()
                state.blockerPopup.close()
                Toast.add($$("@auth/stage/authed"))
                Navigation.defaultScreen()
            } catch (e) {
                state.waitError(-1)
            }
        }

        state.waitError = (e) => {
            p.close()
            Toast.add((e === -1 ? $$("@auth/stage/error") : $$("@auth/stage/timeout")))
        }
    }
}

CoreLoader.registerTask({
    id: "auth-ui",
    presence: "Auth UI",
    async task() {
        Navigation.addModule({
            name: "Auth",
            id: "auth",
            callback() { AuthUI.start() },
        })
    },
})
