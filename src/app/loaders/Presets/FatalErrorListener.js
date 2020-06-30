/* globals __PACKAGE_FEEDBACK */
import CriticalLoadErrorListener from "@Core/Services/CriticalLoadErrorListener"
import SplashScreenController from "@Environment/Loaders/SplashScreenController"
import { $ } from "@Core/Services/Language/handler"
import App from "@Core/Services/app"
import { ReportStorage } from "@Core/Services/Report"
import Axios from "axios"
import download from "@App/tools/interaction/download"
import resetApp from "@App/tools/interaction/resetApp"

function l(name, fallback) {
    try {
        return $(name, {}, false)
    } catch (e) {
        return fallback
    }
}

let FAInited = false

CriticalLoadErrorListener.listener = async (e, consoleIt = true) => {
    function escapeHTML(unsafeText) {
        const div = document.createElement("div")
        div.innerText = unsafeText
        return div.innerHTML
    }

    if (consoleIt) console.error(e)

    if (!document.body) await new Promise((resolve) => { document.onload = resolve })
    try {
        SplashScreenController.enabled = false
        SplashScreenController.splashElement.remove()
    } catch (er) {
        // Handle error
    }

    let error

    if ((e instanceof ErrorEvent) || (e instanceof PromiseRejectionEvent)) {
        e = e.error || e.reason
    }

    if (typeof e === "object") {
        const filename = e.fileName || e.filename || "[unknown file]"
        const lineno = e.lineNumber || e.lineno || "?"
        const colno = e.columnNumber || e.colno || "??"
        const stack = e.stack || false

        error = ((e.fileName || e.filename
            || e.lineNumber || e.lineno
            || e.columnNumber || e.colno) || (!stack || e.stack === "")
            ? `${e.message} on ${filename}:${lineno}:${colno} ${stack}` : stack)
    } else error = String(e)
    const ua = window.navigator.userAgent
    let text = `${escapeHTML(error)}\n\n${escapeHTML(ua)}`

    if (FAInited) {
        FAInited(text)
        return
    }

    FAInited = (data) => {
        document.getElementById("em-error").innerHTML += `\n\n-------------------------\n\n${data}`
        text += `\n\n-------------------------\n\n${data}`
    }

    const icons = {
        sad: require("@Resources/images/vector/css/fatal_error.svg").default,
        clear: require("@Resources/images/vector/css/clear.svg").default,
        export: require("@Resources/images/vector/css/export.svg").default,
        help: require("@Resources/images/vector/css/help.svg").default,
        replay: require("@Resources/images/vector/css/replay.svg").default,
        reset: require("@Resources/images/vector/css/reset.svg").default,
        send: require("@Resources/images/vector/css/send.svg").default,
        more: require("@Resources/images/vector/css/more.svg").default,
    }

    const strings = {
        error: l("fatal_error", "Сталась помилка"),
        explainer: l("fatal_error/explainer", "Застосунок не може завантажитись"),
        actions: l("fatal_error/actions", "Що ви можете зробити:"),
        idb_error: l("recovery_mode/idb_error/description", "Виникли труднощі при спробі використання сховища браузера. Зверніть увагу, що застосунок не може працювати у приватному режимі Firefox"),
        send: {
            title: l("fatal_error/actions/send/title", "Надіслати звіт"),
            info: l("fatal_error/actions/send/info", "Для аналізу та виправлення"),
            title_sent: l("fatal_error/actions/send/title_sent", "Звіт надіслано"),
            info_sent: l("fatal_error/actions/send/info_sent", "Дякуємо за допомогу"),
            info_auto: l("fatal_error/actions/send/info_sent", "Включене автонадсилання"),
        },
        more: {
            title: l("fatal_error/actions/more/title", "Інші варіанти"),
            info: l("fatal_error/actions/more/info", "Звітування, кеш, скидання налаштувань"),
        },
        replay: {
            title: l("fatal_error/actions/replay/title", "Відтворити ще раз"),
            info: l("fatal_error/actions/replay/info", "З записом детального звіту"),
            info_enabled: l("fatal_error/actions/replay/info_enabled", "Детальний звіт вже ведеться"),
        },
        clear: {
            title: l("fatal_error/actions/clear/title", "Очистити кеш"),
            info: l("fatal_error/actions/clear/info", "Застосунок не працюватиме без мережі"),
        },
        reset: {
            title: l("fatal_error/actions/reset/title", "Виконати скидання"),
            info: l("fatal_error/actions/reset/info", "Акаунти та налаштування буде втрачено"),
        },
        help: {
            title: l("fatal_error/actions/help/title", "Звернутись по допомогу"),
            info: l("fatal_error/actions/help/info", "Зворотній зв'язок у чаті Telegram"),
        },
        export: {
            title: l("fatal_error/actions/export/title", "Експортувати звіт"),
            info: l("fatal_error/actions/export/info", "Буде згенеровано файл"),
        },
    }

    function card(name, info, icon, handler, invert = false, opacity = 1) {
        const c = document.createElement("div")
        c.classList.add("em-button-card")
        if (invert) c.classList.add("invert")
        c.addEventListener("click", handler)
        if (opacity !== 1) c.style.opacity = opacity
        if (opacity === 1) c.tabIndex = 1

        const i = document.createElement("div")
        i.classList.add("em-button-card-icon")

        const img = document.createElement("img")
        img.src = icon
        i.append(img)
        c.append(i)

        const b = document.createElement("div")
        b.classList.add("em-button-card-body")

        const n = document.createElement("div")
        n.innerHTML = name

        const inf = document.createElement("div")
        inf.innerHTML = info

        b.append(n)
        b.append(inf)
        c.append(b)

        return c
    }

    document.body.innerHTML = `
    <style>
    @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500&subset=cyrillic');
    @import url('https://fonts.googleapis.com/css?family=Product+Sans:300,400,400italic&subset=cyrillic');
    @import url('https://fonts.googleapis.com/css?family=Roboto+Mono:300,400&display=swap');


    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        outline: 0;
        scrollbar-width: thin;
        color: inherit;
        font-family: inherit;
        word-break: break-word;
        overscroll-behavior: contain;
        -ms-overflow-style: scroll;
        -webkit-overflow-style: scroll;
    }

    *:focus {
        outline: dotted 2px white;
    }

    @media (hover: hover) and (pointer: fine) {
        *::-webkit-scrollbar-thumb, *::-webkit-scrollbar {
            background: transparent;
            width: 5px;
            height: 5px;
            padding: 3px;
        }
    
        *::-webkit-scrollbar-thumb {
            background: var(--color-scrollbar-fill);
        }
        
        *::-webkit-scrollbar-thumb:horizontal {
            border-radius: 2em 2em 0 0;
        }
    
        *::-webkit-scrollbar-thumb:vertical {
            border-radius: 2em 0 0 2em;
        }
        
        *::-webkit-scrollbar-track {
            display: none;
        }
    }

    [tabindex="1"] {
        cursor: pointer;
    }

    body {
        color: #ffffff;
        font-family: Roboto, "Segoe UI", "Open Sans", Arial, sans-serif;
        background-color: #313131;
        font-size: var(--size-text-default);
        position: static;
        overflow: auto;
        height: unset;
        font-size: 16px;
        padding: 10px;
    }

    pre#em-error {
        overflow: hidden;
        background: #3f3f3f;
        border-radius: 4px;
        margin: 15px 0;
        padding: 10px;
        max-height: 4em;
        position: relative;
        font-family: "Roboto Mono", "Consolas", monospace;
        font-size: .7em;
        line-height: 1;
    }

    pre#em-error.open {
        max-height: unset;
        user-select: all;
        overflow-x: auto;
    }

    pre#em-error:not(.open)::before {
        content: '';
        pointer-events: none;
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg, rgb(63, 63, 63) 0%, rgb(63, 63, 63, .5) 100%);
    }

    .emergency-card {
        box-shadow: rgba(165, 133, 31, 0.2) 0px 10px 20px 0px, rgba(251, 191, 0, 0.4) 0px 0px 0px 2px;
        margin: 20px auto;
        border-radius: .4em;
        overflow: hidden;
        background: #4f4f4f;
        padding: 15px;
        max-width: 600px;
    }

    .em-title {
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 1.5em;
        justify-content: center;
    }

    .em-subtitle {
        text-align: center;
    }

    .em-title>img {
        height: 1.25em;
        margin-right: .25em;
    }

    .em-button-card {
        display: flex;
        padding: 15px 15px 15px 0;
        border: solid 2px #fbbf00;
        border-radius: 10px;
        margin: 8px 0;
        color: #fbbf00;
        background: #4f4f4f;
        transition: all .2s ease-out;
    }

    .em-button-card:hover {
        filter: brightness(1.15);
    }

    .em-button-card.invert {
        background: #fbbf00;
        color: black;
    }

    .em-button-card-icon {
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .em-button-card-icon>img {
        width: 28px;
    }

    .em-button-card-body>div:nth-child(1) {
        font-family: 'Product Sans', "Open Sans", "Segoe UI", Roboto, Arial, sans-serif;
    }

    .em-button-card-body>div:nth-child(2) {
        font-size: .8em;
        opacity: .7;
    }
    </style>

    <div class="emergency-card">
        <div class="em-title"><img src="${icons.sad}">${strings.error}</div>
        <div class="em-subtitle">${strings.explainer}</div>
        <pre id="em-error" tabindex="1">${text}</pre>
        
        <div id="em-possible-actions-title">${strings.actions}</div>
        <div id="em-actions">
        </div>
    </div>`
    if (e instanceof DOMException && e.name === "InvalidStateError") {
        document.getElementById("em-possible-actions-title").innerHTML = strings.idb_error
    }
    const pre = document.getElementById("em-error")
    pre.onclick = function preClick() {
        this.classList.add("open")
    }
    document.addEventListener("keypress", (a) => { if (a.code === "Enter") { document.activeElement.click() } })

    const cont = document.getElementById("em-actions")
    const autoReports = (
        App.buildFlag("wg")
        || localStorage.getItem("reports_auto_sending") === "1"
    )
    cont.append(
        card((autoReports ? strings.send.info_auto : strings.send.title),
            (autoReports ? strings.send.info_sent : strings.send.info), icons.send,
            async function sendClick() {
                this.style.opacity = ".7"
                this.children[1].children[0].innerHTML = "..."
                let db = []
                try {
                    db = JSON.stringify(
                        await ReportStorage.export(),
                    )
                } catch (er) {
                    // Ignore error
                }

                const log = {
                    error: text,
                    report: db,
                    v: `${App.version}/${App.branch}/${App.build}`,
                }

                await Axios({
                    method: "post",
                    url: "https://sominemo.com/mono/help/report/beacon",
                    data: log,
                })
                this.children[1].children[0].innerHTML = strings.send.title_sent
                this.children[1].children[1].innerHTML = strings.send.info_sent
            }, true, (autoReports ? ".7" : 1)),
        card(strings.help.title, strings.help.info, icons.help, () => {
            window.open(__PACKAGE_FEEDBACK, "_blank")
        }),
        card(strings.more.title, strings.more.info, icons.more, function showMore() {
            this.remove()
            cont.append(
                card(strings.clear.title, strings.clear.info, icons.clear, async () => {
                    if ("caches" in window) {
                        (await window.caches.keys()).forEach(async (name) => {
                            await window.caches.delete(name)
                        })
                    }

                    const registrations = await navigator.serviceWorker.getRegistrations()
                    await Promise.all(registrations
                        .map((registration) => registration.unregister()))

                    window.location.reload()
                }),
                card(strings.reset.title, strings.reset.info, icons.reset, () => {
                    resetApp()
                    window.location.reload()
                }),
                card(strings.replay.title, strings.replay.info, icons.replay, () => {
                    localStorage.setItem("reports_extended_logging", "1")
                    window.location.reload()
                }),
                card(strings.export.title, strings.export.info, icons.export, async () => {
                    const db = JSON.stringify(await ReportStorage.export())

                    download([db], "text/plain", "app-log.json")
                }),
            )
        }),
    )
}
