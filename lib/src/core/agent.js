const parser = require('ua-parser-js');

const parse = (source = "") => {
    const ua = parser(source);

    return {
        os: `${ua.os.name ?? ''} ${ua.os.version ?? ''}`.trim(),
        browser: `${ua.browser.name ?? ''} ${ua.browser.version ?? ''}`.trim(),
        platform: ua.device.type ?? "desktop",
        device: `${ua.device.vendor ?? ''} ${ua.device.model ?? ''}`.trim()
    }
}

module.exports = {
    parse
}