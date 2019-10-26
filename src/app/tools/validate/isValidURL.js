export default function isValidURL(str) {
    const a = document.createElement("a")
    a.href = str
    return (a.host && a.host !== window.location.host)
}
