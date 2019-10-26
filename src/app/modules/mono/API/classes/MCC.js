import mcc from "mcc"

export default class MCC {
    id = 0

    title = ""

    constructor(code) {
        const data = mcc.get(code)

        let irsDescription = "???"
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
    }
}
