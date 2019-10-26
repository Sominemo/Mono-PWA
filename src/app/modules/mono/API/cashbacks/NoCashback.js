import Cashback from "../classes/Cashback"

export default class NoCashback extends Cashback {
    constructor() {
        const type = "None"
        super(0, type)
    }
}
