module.exports = {
    "USE_PREFIX_COMMANDS": false,
    "PREFIX": "!",
    "OWNERS": [],
    "SUPPORT_SERVER": "",

    "LOGGER": {
        "writeToFile": true,
        "writeToWebhook": true,
        "debug": false,

        "WEBHOOKS": {
            "logger_console": process.env.LOGGER_WEBHOOK_CONSOLE,
            "logger_debug": process.env.LOGGER_WEBHOOK_DEBUG,
            "logger_warning": process.env.LOGGER_WEBHOOK_WARNING,
            "logger_error": process.env.LOGGER_WEBHOOK_ERROR,
        }
    },

    "EMBED_COLORS": {
        "DEFAULT": "800000" // Maroon
    },
}
