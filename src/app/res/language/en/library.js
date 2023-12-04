export default class LanguageLibrary {
    // English pluralize function
    // [minute, minutes]
    static plural(data, { number = 1 } = {}) {
        const absNumber = Math.abs(number)

        if (absNumber === 1) {
            return data[0]
        }

        return data[1]
    }

    static replace(data, { replace = {} } = {}) {
        Object.keys(replace).forEach((key) => {
            data = data.replace(RegExp(`{%${key}}`, "gi"), replace[key].toString())
        })

        return data
    }
}
