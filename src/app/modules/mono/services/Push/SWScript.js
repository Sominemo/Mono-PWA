/* eslint-disable no-restricted-globals */
/* global registration, clients, __PACKAGE_APP_NAME, __PACKAGE_BUILD_TIME,
__MCC_CODES_EMOJI, __CC_SHRUNK_DATASET */

const emojiMCCDataset = __MCC_CODES_EMOJI
const ccDataset = __CC_SHRUNK_DATASET

// eslint-disable-next-line no-unused-vars
const compileTime = __PACKAGE_BUILD_TIME

function report(...data) {
    console.log(...data)
    return new Promise(
        (resolve, reject) => {
            const dbOpenReq = indexedDB.open("ReportData")

            dbOpenReq.onsuccess = (dbOpen) => {
                const db = dbOpen.target.result
                const request = db.transaction(["report-fallback-log"], "readwrite").objectStore("report-fallback-log")
                    .add({
                        log: data, time: Date.now(), tags: ["sw"], session: "webworker",
                    })
                request.onsuccess = resolve
                request.onerror = reject
            }

            dbOpenReq.onerror = reject
            dbOpenReq.onblocked = reject
            dbOpenReq.onupgradeneeded = reject
        },
    )
}

function hashCode(str) {
    let hash = 0
    let i
    let chr
    if (str.length === 0) return hash
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
    }
    return hash
}

function getMCCEmoji(code) {
    return emojiMCCDataset[String(code).padStart(4, "0")]
}

function getCur(expression, code = false) {
    const field = (code ? "code" : "number")
    const info = ccDataset.find((v) => (v[field] === expression))
    if (!info) {
        return {
            code: String(expression),
            number: 0,
            digits: 2,
        }
    }

    return {
        code: info.code,
        number: info.number,
        digits: info.digits,
    }
}

class Money {
    constructor(value, cur) {
        this.cur = cur
        this.minus = value < 0
        value = Math.abs(value)
        this.full = Math.floor(value / (10 ** cur.digits))
        this.dec = value - this.full * (10 ** cur.digits)
    }

    get print() {
        let char = this.cur.code

        if (this.cur.number === 980) char = "₴"
        else if (this.cur.number === 840) char = "$"
        else if (this.cur.number === 978) char = "€"
        else if (this.cur.number === 985) char = "zł"

        return `${(this.minus ? "-" : "")}${this.full}.${String(this.dec).padStart(this.cur.digits, "0")} ${char}`
    }
}

function cashback(amount, type) {
    const currency = getCur(type, true)
    if (currency.number === 0) {
        return {
            type: "money",
            amount: new Money(amount, currency),
            print() {
                return `👛 ${this.amount.print}`
            },
        }
    }

    if (type === "Miles") return { type: "miles", amount }
    if (type === "None") return { type: "none", amount }
    return { type: "cashback", amount }
}


const badges = {
    m: require("@Resources/images/badges/m.png").default,
    news: require("@Resources/images/badges/news.png").default,
    error: require("@Resources/images/badges/error.png").default,
    payIn: require("@Resources/images/badges/pay_in.png").default,
    payOut: require("@Resources/images/badges/pay_out.png").default,
    card: require("@Resources/images/badges/card.png").default,
}

const icons = {
    black: require("@Resources/images/icons/black.png").default,
    iron: require("@Resources/images/icons/iron.png").default,
    platinum: require("@Resources/images/icons/platinum.png").default,
    white: require("@Resources/images/icons/white.png").default,
    yellow: require("@Resources/images/icons/yellow.png").default,
}

function lookupForWindow(event, callback, urlSearch = null) {
    event.waitUntil(
        clients.matchAll({ includeUncontrolled: true, type: "window" }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i]
                if ((urlSearch && client.url === urlSearch) && "focus" in client) {
                    return callback(client)
                }
            }
            if (windowClients.length > 0) return callback(windowClients[0])
            return callback(clients.openWindow(urlSearch || registration.scope))
        }),
    )
}

function actionInterpreter(action, event) {
    if (typeof action !== "object") return

    if (action.act === "url") { // {act: "url", url: "htps://,,," openNew: false, refocus: false}
        event.notification.close()
        if (action.openNew && clients.openWindow) {
            clients.openWindow(action.url)
        } else {
            lookupForWindow(event,
                (client) => { client.navigate(action.url) },
                action.refocus ? action.url : null)
        }
        return
    } if (action.act === "msg") { // {act: "msg", all: false, data: "{...}", denyNewWindow: false}
        event.notification.close()

        const message = { focusOnly: !action.all, data: JSON.stringify(action.data) }
        const id = hashCode(JSON.stringify(message))

        const fallback = () => {
            lookupForWindow(event,
                (client) => {
                    client.postMessage({ id, message, act: "push-message" })
                })
        }
        if (!("BroadcastChannel" in self)) {
            fallback()
            return
        }
        const channel = new BroadcastChannel("push-messages")
        const newWindow = !action.denyNewWindow ? setTimeout(fallback, 1000) : null

        const listener = (msgEvent) => {
            if (msgEvent.data.act === "push-message-recieved"
                && msgEvent.data.id === id && newWindow) {
                clearTimeout(newWindow)
                channel.removeEventListener("message", listener)
            }
        }

        if (newWindow) channel.addEventListener("message", listener)

        channel.postMessage({ id, message, act: "push-message" })
        return
    }

    throw new Error("Unknown action")
}

self.addEventListener("push", async (event) => {
    report("Push recieved", event)
    if (!(self.Notification && self.Notification.permission === "granted")) {
        report("No Notification permission")
        return
    }

    if (!event.data) return

    let data

    try {
        data = event.data.json()
    } catch (e) {
        return
    }

    if (!("act" in data)) throw new Error("Unknown Payload")

    if (data.act === "custom-push") {
        if (!("push" in data)) throw new Error("No Push Data")

        const fallbackLang = "uk"
        let pushObject = data.push

        if (data.isMultilang) {
            const uiLang = await new Promise(
                (resolve, reject) => {
                    const dbOpenReq = indexedDB.open("SettingsStorage")

                    dbOpenReq.onsuccess = (dbOpen) => {
                        const db = dbOpen.target.result
                        const request = db.transaction(["user"], "readonly").objectStore("user").get("user_ui_language")
                        request.onsuccess = (get) => {
                            resolve(request.result ? request.result.value : null)
                        }
                        request.onerror = reject
                    }

                    dbOpenReq.onerror = reject
                    dbOpenReq.onblocked = reject
                    dbOpenReq.onupgradeneeded = reject
                },
            )

            if (uiLang && uiLang in data.push) {
                pushObject = data.push[uiLang]
            } else {
                try {
                    navigator.languages.forEach((e) => {
                        const lang = e.substr(0, 2)
                        if (lang in data.push) throw lang
                    })

                    if (!(fallbackLang in data.push)) throw new Error("No supported push locale")
                    pushObject = data.push[fallbackLang]
                } catch (lang) {
                    pushObject = data.push[lang]
                }
            }
        }

        const title = pushObject.title || __PACKAGE_APP_NAME
        const push = {}
        const ignoreList = ["title", "libraryBadge", "actionDescriptor", "data"]

        Object.entries(pushObject).forEach(([key, value]) => {
            if (ignoreList.includes(key)) return

            push[key] = value
        })
        push.badge = ("libraryBadge" in pushObject
            ? badges[pushObject.libraryBadge]
            : pushObject.badge ? String(pushObject.badge) : badges.m) || badges.m

        push.data = {
            push: pushObject.data || null,
            actionDescriptor: pushObject.actionDescriptor || {},
        }


        if (registration.showNotification) {
            registration.showNotification(title, push)
        } else {
            // eslint-disable-next-line no-new
            new Notification(title, push)
        }
    } else if (data.act === "statement-item") {
        if (!("account" in data && "item" in data)) throw new Error("Incorrect statement-item Payload")


        const amount = new Money(
            Math.abs(data.item.amount),
            getCur(data.account.currencyCode),
        )
        const operationAmount = new Money(
            Math.abs(data.item.operationAmount),
            getCur(data.item.currencyCode),
        )
        const balance = new Money(
            Math.abs(data.item.balance),
            getCur(data.account.currencyCode),
        )

        const operationCashback = cashback(data.item.cashbackAmount, data.account.cashbackType)

        const spentPart = operationAmount.print
            + (data.account.currencyCode !== data.item.currencyCode ? ` (${operationAmount.print})` : "")
            + (operationCashback.amount > 0 ? ` ${operationCashback.string}` : "")

        const commentPart = data.item.description + ("comment" in data.item ? `\n👋 ${data.item.comment}` : "")


        const balancePart = `💳 **${data.account.maskedPan[0].split("*")[1]} — ${operationAmount.print}`

        const content = `${commentPart}\n${balancePart}`

        let emoji
        if (data.item.mcc === 4829) {
            emoji = data.item.amount < 0 ? "💳👉" : "💳👈"
        } else emoji = getMCCEmoji(data.item.mcc)

        registration.showNotification(
            `${emoji} ${spentPart}`,
            {
                body: content,
                badge: badges.card,
                timestamp: data.item.time * 1000,
                icon: icons[data.account.type] || icons.black,
            },
        )
    }
})


self.addEventListener("notificationclick", (clickEvent) => {
    if (!clickEvent.notification.data) return

    if (clickEvent.action in clickEvent.notification.data.actionDescriptor) {
        let cur = clickEvent.notification.data.actionDescriptor[clickEvent.action]
        if (!Array.isArray(cur)) cur = [cur]
        cur.forEach((action) => {
            actionInterpreter(action, clickEvent)
        })
    }
},
false)
