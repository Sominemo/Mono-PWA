/* eslint-disable func-names */
import smoothscroll from "smoothscroll-polyfill"
import "requestidlecallback-polyfill"

smoothscroll.polyfill()

window.requestIdleCallback = window.requestIdleCallback || function (handler) {
    const startTime = Date.now()

    return setTimeout(() => {
        handler({
            didTimeout: false,
            timeRemaining() {
                return Math.max(0, 50.0 - (Date.now() - startTime))
            },
        })
    }, 1)
}
