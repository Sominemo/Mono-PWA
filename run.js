const map = require("mcc/emojiMap")
const fs = require("fs")

const emojiMap = {}
Object.entries(map).forEach(([emoji, mccs]) => {
    mccs.forEach((mcc) => {
        if (!emojiMap[mcc]) emojiMap[mcc] = emoji
    })
})

fs.writeFileSync("list.json", JSON.stringify(emojiMap))
