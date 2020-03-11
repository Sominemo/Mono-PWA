export default function DetectPaymentSystem({ start = "", end = "" }) {
    // VISA
    if (start.indexOf("4") === 0) return "VISA"

    // MC
    const firstTwo = parseInt(start.slice(0, 2), 10)
    if (firstTwo >= 51 && firstTwo <= 55) return "MasterCard"

    const firstFour = parseInt(start.slice(0, 4), 10)
    if (firstFour >= 2221 && firstFour <= 2720) return "MasterCard"

    return null
}
