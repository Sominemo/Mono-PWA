const {
    lstatSync, readdirSync, readFileSync, writeFileSync,
} = require("fs")
const { join } = require("path")

const isDirectory = source => lstatSync(source[0]).isDirectory()
const getDirectories = source => readdirSync(source)
    .map(name => [join(source, name), name])
    .filter(isDirectory)

const getVar = (theme, name) => (theme.match(RegExp(`--${name}: (.+?);`, "m")) || [])[1]

function getThemesFolderMap(path) {
    const r = []
    const list = getDirectories(path)
    list.forEach((e) => {
        const p = join(e[0], "theme.json")
        const i = JSON.parse(readFileSync(p))
        // eslint-disable-next-line prefer-destructuring
        i.dir = e[1]

        const colors = {
            bg: null,
            main: null,
            accent: null,
        }

        const theme = readFileSync(join(e[0], "theme.css"), "utf-8")
        colors.bg = getVar(theme, "color-main-bg") || null
        colors.main = getVar(theme, "color-main") || null
        colors.accent = getVar(theme, "color-accent") || null

        i.colors = colors
        r.push(i)
    })

    return r
}

function getThemesMap(paths) {
    if (!Array.isArray(paths)) return getThemesFolderMap(paths)
    return paths.reduce((r, i) => [...r, ...getThemesFolderMap(i)], [])
        .filter((a, i, self) => i === self.findIndex(t => (
            t.dir === a.dir
        )))
}

module.exports = function makeThemesMap(paths, path) {
    const map = getThemesMap(paths)
    writeFileSync(join(path, "themes.js"),
        `// This file generates automatically on Webpack build
// Don't edit its content (see /scripts folder in webpack config directory)
/* eslint-disable */
export default 
${JSON.stringify(map)}`)
}
