export default class LanguageLibrary {
    // [число, числа, чисел] [минута, минуты, минут]
    static plural(data, { number = 1 } = {}) {
        number = Math.abs(number)
        if (Math.floor(number) !== number) return data[1]
        return data[
            // eslint-disable-next-line no-nested-ternary
            (number % 10 === 1 && number % 100 !== 11) ? 0
                : number % 10 >= 2
                    && number % 10 <= 4
                    && (number % 100 < 10 || number % 100 >= 20) ? 1 : 2
        ]
    }

    static replace(data, { replace = {} } = {}) {
        Object.keys(replace).forEach((key) => {
            data = data.replace(RegExp(`{%${key}}`, "gi"), replace[key].toString())
        })

        return data
    }
}
