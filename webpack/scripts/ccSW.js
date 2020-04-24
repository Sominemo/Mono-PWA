module.exports = function ccSW(data) {
    return data.map((d) => ({
        code: d.code,
        number: d.number,
        digits: d.digits,
    }))
}
