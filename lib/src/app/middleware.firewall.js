const coreDatabase = require('../core/database');
const coreIp = require('../core/ip');
const coreAgent = require('../core/agent');
const coreFirewall = require('../core/firewall');

const nodejsPath = require('path');

/**
 * Firewall middleware
 * @param {{ saveRequest: boolean, skipFiles: boolean, skipIPLockup: boolean, skipFirewall: boolean, callback: Function }} params
 */
const firewall = (params) => async (req, res, next) => {
    let callback = next();

    if(params && params.callback) {
        callback = () => {
            params.callback(req.divarchi);
            next();
        }
    }

    const path = req.path;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const host = req.headers['x-host-for'] || req.headers.host.split(':')[0];
    const method = req.method;
    const referer = req.headers.referer || "";
    const userAgent = req.headers['user-agent'] || "";

    const skipFiles = params && params.skipFiles == true && !!nodejsPath.extname(path);

    const [hostInDatabase] = await coreDatabase.select('host', { host });

    if (hostInDatabase == undefined) {
        return next();
    }

    req.divarchi = {
        host,
        path,
        method,
        ip,
        referer,
        userAgent,
        action: hostInDatabase.action,
        ...coreAgent.parse(userAgent),
    };


    try {
        if (params == undefined || params.skipIPLockup == false) {
            // get ip details
            const ipDetails = await coreIp.getIPFromProviderIPAPI(ip);

            req.divarchi = {
                ...req.divarchi,
                ...ipDetails,
            }
        }

        if (params == undefined || (params.skipFirewall != true && skipFiles != true)) {
            // process firewall to choose action
            const actionId = await coreFirewall.process(req.divarchi);

            if (actionId && actionId != -1) {
                req.divarchi.action = actionId;
            }
        }

        // if params is undefined or saveRequest is not false and skipFiles is not true
        if (params == undefined || (params.saveRequest != false && skipFiles != true)) {
            // write to database
            coreDatabase.insert('request', req.divarchi);
        }

        // get action details
        let [action] = await coreDatabase.select('action', { id: req.divarchi.action });

        // generate base64 for x-divarchi-for
        if (action && action.config) {
            const config = JSON.parse(action.config);

            action.config = config;

            if (config['x-divarchi-for'] == true) {

                const xDivarchiFor = Buffer.from(JSON.stringify({
                    id: req.divarchi.id,
                    ip: req.divarchi.ip,
                    isp: req.divarchi.isp,
                    ispType: req.divarchi.ispType,
                    country: req.divarchi.country,
                    city: req.divarchi.city,
                    lat: req.divarchi.lat,
                    lon: req.divarchi.lon,
                    os: req.divarchi.os,
                    browser: req.divarchi.browser,
                    platform: req.divarchi.platform,
                    device: req.divarchi.device,
                })).toString('base64');
                req.headers['x-divarchi-for'] = xDivarchiFor;
            }
        }

        req.divarchi.$action = action;

        callback();
    } catch (error) {
        console.error(error);

        req.divarchi = undefined;

        callback();
    }
}

module.exports = firewall;