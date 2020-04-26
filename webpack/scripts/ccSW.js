module.exports = function ccSW(data) {
    return data.map((d) => ({
        code: d.code,
        number: Number.parseInt(d.number, 10),
        digits: d.digits,
    }))
}
