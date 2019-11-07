module.exports = function mccEmoji(map) {
    const emojiMap = []
    Object.entries(map).forEach(([emoji, mccs]) => {
        mccs.forEach((mcc) => {
            if (!emojiMap[mcc]) emojiMap[mcc] = emoji
        })
    })

    return emojiMap
}
