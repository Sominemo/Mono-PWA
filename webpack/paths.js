const path = require("path")
const __root = process.cwd()

class PATHS {
    static root = __root
    static source = path.join(__root, "src")
    static build = path.join(__root, "build")
    static localBuild = path.join(__root, "local_build")
    static wgBuild = path.join(__root, "build")
    static generated = path.join(__root, "generated")
    static public = "https ://mono.sominemo.com/"

    static app = path.join(this.source, "app")
    static core = path.join(this.source, "core")
    static environment = path.join(this.source, "environment")
    static themesGenerated = path.join(this.generated, "themes")

    static resources = path.join(this.app, "res")
    static envResources = path.join(this.environment, "res")
    static language = path.join(this.resources, "language")
    static themes = [
        path.join(this.resources, "styles", "themes"),
    ]
}

module.exports = PATHS