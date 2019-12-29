import DOM from "@DOMPath/DOM/Classes/dom"
import { SVG } from "@Environment/Library/DOM/basic"

function cardDecoration(currency) {
    let decoration = null
    if (typeof currency === "number") {
        if (currency === 840) decoration = "--card-green-sideline"; else
        if (currency === 978) decoration = "--card-red-sideline"; else
        if (currency === 985) decoration = "--card-blue-sideline"
    }

    return decoration
}


function bankImg(bank) {
    let img = require("@Resources/images/banklogos/mono.svg")
    if (bank === "iron") img = require("@Resources/images/banklogos/iron.svg")
    return new SVG(img)
}

function cardBG(look) {
    let gradient = "linear-gradient(45deg, #333333 0%, #000 100%)"
    let invert = false
    if (look === "grey" || look === "iron") {
        gradient = "linear-gradient(45deg, #d8d8d8 0%, #9d9d9d 100%)"
        invert = true
    } else
    if (look === "pink") {
        gradient = "linear-gradient(45deg, #ffe6e5 0%, #ca9695 100%)"
        invert = true
    } else
    if (look === "white") {
        gradient = "linear-gradient(45deg, #d1d1d1 0%, white 100%)"
        invert = true
    } if (look === "yellow") {
        gradient = "linear-gradient(45deg, #fade4f 0%, #f6eb67 100%)"
        invert = true
    }

    return [gradient, invert]
}

function cardItemGenerator({
    bank = "mono", look = "black", cardholder = "", currency = null,
} = {}) {
    const bankPic = bankImg(bank)
    const [cardBackground, invert] = cardBG(look)
    const cardDec = cardDecoration(currency)
    const cardSign = String(cardholder)

    return new DOM({
        new: "div",
        class: ["mono-card", ...(cardDec === null ? [] : ["mono-card-decorator", cardDec]), ...(invert ? ["mono-card-inverted"] : [])],
        style: {
            background: cardBackground,
        },
        content: [
            new DOM({
                new: "div",
                class: "mono-card-bank-image",
                content: bankPic,
                style: {
                    filter: (invert ? "brightness(0)" : ""),
                },
            }),
            new DOM({
                new: "div",
                class: "mono-card-cardholder",
                content: cardSign,
                style: {
                    filter: (invert ? "brightness(0)" : ""),
                },
            }),
        ],
    })
}

export {
    cardDecoration,
    cardItemGenerator,
}
