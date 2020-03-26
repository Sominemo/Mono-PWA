/* global __MCC_CODES_EMOJI */

import mcc from "mcc"
import mccLocal from "@Resources/datasets/MCC-Localize-Dataset/mcc-loc.json"

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

        const textCode = String(code).padStart(4, "0")
        const locMccData = mccLocal[textCode]
        if (locMccData.uk && locMccData.uk.length > 0) this.ukTitle = locMccData.uk
        if (locMccData.ru && locMccData.ru.length > 0) this.ruTitle = locMccData.ru

        this.id = id
        this.code = code


        try {
            this.emoji = __MCC_CODES_EMOJI[code] || emojiFallback
        } catch (e) {
            this.emoji = emojiFallback
        }
    }
}
