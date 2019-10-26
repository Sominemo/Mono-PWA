export default function download(content, type, name) {
    const a = window.document.createElement("a")
    a.href = window.URL.createObjectURL(new Blob(content, { type }))
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
