import { $ } from "@Core/Services/Language/handler"

function sameDay(d1, d2) {
    d1 = new Date(d1)
    d2 = new Date(d2)

    return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth()
      && d1.getDate() === d2.getDate()
}

function nextDay(d1, d2) {
    d1 = new Date(d1)
    d2 = new Date(d2)
    d1.setDate(d1.getDate() + 1)
    return sameDay(d1.getTime(), d2.getTime())
}

function prevDay(d1, d2) {
    d1 = new Date(d1)
    d2 = new Date(d2)
    d1.setDate(d1.getDate() - 1)
    return sameDay(d1.getTime(), d2.getTime())
}

function relativeDate(date, hours = false) {
    if (!(date instanceof Date)) throw new Error("Date constructor expected")

    const cur = Date.now()
    const dat = date.getTime()

    let monthDate

    if (sameDay(cur, dat)) monthDate = $("@dateformats/relative/today")
    else if (prevDay(cur, dat)) monthDate = $("@dateformats/relative/yesterday")
    else if (nextDay(cur, dat)) monthDate = $("@dateformats/relative/tomorrow")
    else monthDate = `${date.getDate()} ${$(`@dateformats/month/months/${date.getMonth()}`)}`

    return monthDate + (hours ? `, ${$("@dateformats/at")} ${date.getHours()}:${date.getMinutes()}` : "")
}

export {
    relativeDate,
    sameDay,
    nextDay,
    prevDay,
}
