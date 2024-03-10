const useragent = require('express-useragent');

const parse = (source = "") => {
    const ua = useragent.parse(source);

    return {
        os: ua.os,
        browser: ua.browser,
        device: ua.isDesktop ? 'desktop' : ua.isMobile ? 'mobile' : ua.isTablet ? 'tablet' : 'unknown',
    }
}

module.exports = {
    parse
}