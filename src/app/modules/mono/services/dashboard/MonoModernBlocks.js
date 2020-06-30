import ModernBlocks from "@Environment/Library/DOM/buildBlock/modernBlocks"

export default class MonoModernBlocks extends ModernBlocks {
    async dataRequest(scopes) {
        return Promise.all(scopes.map(
            async ({ scope, request = "" }) => {
                if (scope === "clients") {
                    if (!("clients" in this.requestCache)) {
                        this.requestCache.clients = fetch("https://api.mono.sominemo.com/widgets/clients").then((r) => r.json())
                    }

                    return this.requestCache.clients
                }
                return null
            },
        ))
    }
}
