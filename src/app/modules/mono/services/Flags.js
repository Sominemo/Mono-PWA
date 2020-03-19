export default class Flags {
    static Auth = {
        NONE: 0,
        PUSH_SUPPORTED: 0b1,
    }

    static AuthConfig = {
        domain: "https://api.mono.sominemo.com",
        notificationServer: {
            api: "https://api.mono.sominemo.com/push",
            cert: "BKoX0gvn8UaBv3gAXC3LxCI_nRPCZWSY5nHCoSjif_j9-3HffNvr7J5gKgj56qeBBCUmY9I4Evi1l5Yvk3AwEws",
            name: "Sominemo Push Server",
        },
    }
}
