/* eslint-disable no-alert */
/* eslint-disable no-eval */
import * as idb from "idb"
import Language from "@Core/Services/Language/instance"
import PWA from "@App/modules/main/PWA"
import { Nav } from "@Environment/Library/DOM/buildBlock"
import Navigation from "@Core/Services/navigation"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Design from "@Core/Services/design"
import Report from "@Core/Services/reportOld"
import DBTool from "@Core/Tools/db/DBTool"
import DBUserPresence from "@Core/Services/DBUserPresence"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import SettingsCheckProvider from "@Core/Services/Settings/SettingsCheckProvider"
import SettingsLayout from "@Core/Services/Settings/user/layout"
import SettingsLayoutManager from "@Core/Services/Settings/user/manager"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import LanguageCore from "@Core/Services/Language/core"
import { $ } from "@Core/Services/Language/handler"
import Toast from "@Environment/Library/DOM/elements/toast"
import PointerInfo from "@Core/Services/PointerInfo"
import HistoryHints from "@Core/Services/HistoryHints"
import { ContentEditable } from "@Environment/Library/DOM/object/input"
import DOM from "@DOMPath/DOM/Classes/dom"
import DOMController from "@DOMPath/DOM/Helpers/domController"
import { CoreLoader } from "@Core/Init/CoreLoader"
import SW from "@Core/Services/SW"
import MonoAPI from "@App/modules/mono/API/clients/MonoAPI"
import { APIError } from "@App/tools/API"
import CurrencyInfo from "@App/modules/mono/API/classes/CurrencyInfo"
import { Currency } from "@App/modules/mono/API/classes/Currency"
import Money from "@App/modules/mono/API/classes/Money"
import Account from "@App/modules/mono/API/classes/Account"
import Statement from "@App/modules/mono/API/classes/Statement"
import Auth from "@App/modules/mono/services/Auth"
import AuthUI from "@App/modules/mono/AuthUI"
import OfflineCache from "@App/modules/mono/services/OfflineCache"
import StatementStorage from "@App/modules/mono/services/StatementStorage"
import MonoCorpAPI from "@App/modules/mono/API/clients/MonoCorpAPI"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"
import StatementUI from "@App/modules/mono/statementUI"
import NotificationManager from "@Core/Services/Push/NotificationManager"


function compare(a, b, path = "/", missing = [], same = [], reverse = false) {
    const keys = Object.keys(a)
    const keysb = Object.keys(b)
    keys.forEach((e) => {
        if (b[e] === undefined) {
            missing.push([b.info.code, path + e])
            return
        }
        if (b.type === "func" || b.type === "funcs") return
        if (!reverse && a[e] === b[e]) same.push([path + e, a[e]])
        if (typeof b[e] === "object") compare(a[e], b[e], `${path + e}/`, missing, same)
    })

    keysb.forEach((e) => {
        if (a[e] === undefined) {
            missing.push([a.info.code, path + e])
            return
        }
        if (a.type === "func" || a.type === "funcs") return
        if (typeof a[e] === "object") compare(b[e], a[e], `${path + e}/`, missing, same, true)
    })
    if (path !== "/") return

    console.group(`Missing (${missing.length})`)
    missing.forEach((e) => console.log(...e))
    console.groupEnd()

    console.groupCollapsed(`Same (${same.length})`)
    same.forEach((e) => console.log(...e))
    console.groupEnd()
}

async function compareLanguages(a, b) {
    a = new Language(a)
    b = new Language(b)
    await Promise.all([a.loadData(), b.loadData()])
    compare(a.strings, b.strings)
}

const DevUtils = {
    app: PWA,
    dom: DOM,
    domc: DOMController,
    nav: Nav,
    navigation: Navigation,
    win: WindowManager,
    OfflineCache,
    Design,
    idb,
    report: Report,
    dbtool: DBTool,
    dbuser: DBUserPresence,
    setStor: SettingsStorage,
    setCh: SettingsCheckProvider,
    setLay: SettingsLayout,
    setLayMan: SettingsLayoutManager,
    fch: FieldChecker,
    fct: FieldsContainer,
    langCore: LanguageCore,
    langInstance: Language,
    $,
    compare,
    compareLanguages,
    Toast,
    Pointer: PointerInfo,
    HistoryHints,
    lib: {
        ContentEditable,
        Prompt,
    },
    CoreLoader,
    SW,
    MonoAPI,
    MonoCorpAPI,
    APIError,
    CurrencyInfo,
    Money,
    Currency,
    Account,
    Statement,
    Auth,
    AuthUI,
    StatementStorage,
    StatementUI,
    NotificationManager,
}

const CmdCollection = {
    restart(opt) {
        if (opt === "r") window.location.hash = "#recoveryMode"
        if (opt === "std") window.location.hash = ""
        window.location.reload()
    },
}

async function CmdRunner() {
    try {
        const cmd = prompt("Enter JS snippet")
        if (cmd === null) return
        if (cmd[0] !== "#") {
            const r = JSON.stringify(await eval(cmd))
            prompt(r, r)
            return
        }

        if (cmd.substr(1).split(" ")[0] in CmdCollection) CmdCollection[cmd.substr(1).split(" ")[0]](...cmd.split(" ").slice(1))
    } catch (e) {
        const r = JSON.stringify(e instanceof Error ? errorToObject(e) : e)
        prompt(r, r)
    }
}

CoreLoader.registerTask({
    id: "dev-accessories",
    presence: "Dev Accessories",
    task() {
        global.idb = idb
        global.dev = DevUtils
        global.run = {}
        Object.defineProperty(global.run, "cmd", { get: CmdRunner })

        let t = null
        let count = 0

        function func(event) {
            count = event.touches.length
            if (count !== 3) { clearTimeout(t); t = null }
        }

        function func2(event) {
            count = event.touches.length
            if (count === 0) {
                CmdRunner()
                document.removeEventListener("touchend", func2, true)
            }
        }

        document.addEventListener("touchstart", (event) => {
            count = event.touches.length
            if (count !== 3) {
                clearTimeout(t)
                t = null
                return
            }

            if (t === null) {
                t = setTimeout(() => {
                    document.removeEventListener("touchend", func, true)
                    document.removeEventListener("touchcancel", func, true)
                    document.removeEventListener("touchleave", func, true)
                    if (count === 3) {
                        document.addEventListener("touchend", func2, true)
                    }
                }, 2000)
            }

            document.addEventListener("touchend", func, true)
            document.addEventListener("touchcancel", func, true)
            document.addEventListener("touchleave", func, true)
        }, true)
    },
})
