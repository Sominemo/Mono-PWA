export default function filterURL(str) {
    const a = document.createElement("a")
    a.href = str
    return ((a.host && a.host !== window.location.host) ? `${a.protocol}//${a.host}${a.pathname}`.match(/^(.+?)\/?$/)[1] : false)
}
