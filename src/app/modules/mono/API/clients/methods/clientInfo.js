import Client from "../../classes/Client"

export default async function clientInfo() {
    const data = await this.call("personal/client-info", {
        methodID: "personal/client-info",
        useAuth: true,
    })
    if (!("name" in data && "accounts" in data)) throw Error("Incorrect Client Info")
    return new Client(data.name, data.accounts, this)
}
