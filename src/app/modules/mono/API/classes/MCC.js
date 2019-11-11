/* global __MCC_CODES_EMOJI */

import mcc from "mcc"

const emojiFallback = "\uD83D\uDCB3"

export default class MCC {
    id = 0

    title = ""

    constructor(code) {
        const data = mcc.get(code)

        let irsDescription = "Operation"
        let usdaDescription = ""
        let combinedDescription = ""
        let editedDescription = ""
        let id = 0

        if (data) {
            irsDescription = data.irs_description
            usdaDescription = data.usda_description
            combinedDescription = data.combined_description
            editedDescription = data.edited_description;
            ({ id } = data)
        }

        this.title = irsDescription || usdaDescription || combinedDescription || editedDescription
        this.id = id
        this.code = code


        try {
            this.emoji = __MCC_CODES_EMOJI[code] || emojiFallback
        } catch (e) {
            this.emoji = emojiFallback
        }
    }
}
