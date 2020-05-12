export default async function resetApp() {
    localStorage.clear()

    let dbs = [
        { name: "AuthStorage" }, { name: "OfflineCache" },
        { name: "SettingsStorage" }, { name: "StatementStorage" },
        { name: "ReportStorage" }, { name: "userActivityHistory" },
    ]

    if ("databases" in indexedDB) {
        dbs = await window.indexedDB.databases()
    }
    await Promise.all(dbs.map(async (db) => new Promise(async (resolve, reject) => {
        try {
            const r = indexedDB.deleteDatabase(db.name)
            r.onsuccess = resolve
            r.onerror = reject
        } catch (e) {
            reject(e)
        }
    })))
}
