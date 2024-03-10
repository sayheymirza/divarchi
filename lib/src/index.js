const coreDatabase = require('./core/database');
const coreIp = require('./core/ip');
const coreAgent = require('./core/agent');
const coreFirewall = require('./core/firewall');

const middleware = (params) => async (req, res, next) => {
    const path = req.path;

    if(path == '/favicon.ico') {
        return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const host = req.headers['x-host-for'] || req.headers.host.split(':')[0];
    const method = req.method;
    const referer = req.headers.referer || "";
    const userAgent = req.headers['user-agent'];
    const requestedAt = new Date().toISOString();


    req.divarchi = {
        host,
        path,
        method,
        ip,
        referer,
        userAgent,
        requestedAt,
        blocked: false,
        ...coreAgent.parse(userAgent),
    };

    
    try {
        // get ip details
        const ipDetails = await coreIp.getIPFromProviderIPAPI(ip);

        req.divarchi = {
            ...req.divarchi,
            ...ipDetails,
        }

        // process firewall that this request is blocked or not
        req.divarchi.blocked = await coreFirewall.process(req.divarchi);

        // write to database
        const id = await coreDatabase.insert('request', req.divarchi);

        req.divarchi.id = id;

        next();
    } catch (error) {
        console.error(error);

        req.divarchi = undefined;

        next();
    }
}

module.exports = {
    middleware,
    database: coreDatabase
}