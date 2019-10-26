import Cashback from "../Cashback"

export default class MilesCashback extends Cashback {
    constructor(amount) {
        const type = "Miles"

        super(amount, type)
    }
}
