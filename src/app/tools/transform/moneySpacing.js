export default function moneySpacing(str) {
    const comp = str.split(".")
    comp[0] = comp[0].match(/.{1,3}(?=(.{3})*$)/g).join(" ")
    return comp.join(".")
}
