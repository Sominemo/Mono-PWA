import Cashback from "../Cashback"

export default class NoCashback extends Cashback {
    constructor() {
        const type = "None"
        super(0, type)
    }
}
