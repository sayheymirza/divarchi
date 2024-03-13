const coreDatabase = require('../core/database');
const coreIp = require('../core/ip');
const coreAgent = require('../core/agent');
const coreFirewall = require('../core/firewall');

const nodejsPath = require('path');

/**
 * Firewall middleware
 * @param {{ saveRequest: boolean, skipFiles: boolean, skipIPLockup: boolean, skipFirewall: boolean, onNext: Function, onBlock: Function }} params
 */
const firewall = (params) => async (req, res, next) => {
    let callback = next;

    if (params && params.onNext) {
        callback = () => {
            params.onNext(req.divarchi);
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
        blocked: false,
        ...coreAgent.parse(userAgent),
    };


    try {
        if (params == undefined || (params.skipIPLockup != true && skipFiles != true)) {
            // get ip details
            const ipDetails = await coreIp.getIPFromProviderIPAPI(ip);

            req.divarchi = {
                ...req.divarchi,
                ...ipDetails,
            }
        }

        if (params == undefined || (params.skipFirewall != true && skipFiles != true)) {
            // process firewall to choose action
            const { action: actionId, role: roleId } = await coreFirewall.process(req.divarchi);

            if (actionId && actionId != -1) {
                req.divarchi.role = roleId;
                req.divarchi.action = actionId;
                req.divarchi.blocked = true;
            }
        }

        // if params is undefined or saveRequest is not false and skipFiles is not true
        if (params == undefined || (params.saveRequest != false && skipFiles != true)) {
            // write to database
            coreDatabase.insert('request', {
                host: req.divarchi.host,
                path: req.divarchi.path,
                method: req.divarchi.method,
                ip: req.divarchi.ip,
                referer: req.divarchi.referer,
                userAgent: req.divarchi.userAgent,
                action: req.divarchi.action,
                blocked: req.divarchi.blocked,
                lat: req.divarchi.lat,
                lon: req.divarchi.lon,
                country: req.divarchi.country,
                city: req.divarchi.city,
                os: req.divarchi.os,
                browser: req.divarchi.browser,
                platform: req.divarchi.platform,
                device: req.divarchi.device,
            }).catch(() => { 
            });
            // write for aggregate
            const keys = [
                'host',
                'method',
                'path',
                'ip',
                'network',
                'isp',
                'ispType',
                'country',
                'city',
                'referer',
                'os',
                'browser',
                'platform',
                'device',
            ];

            for (let key of keys) {
                if (req.divarchi[key]) {
                    coreDatabase.insert('aggregate', {
                        key,
                        value: req.divarchi[key],
                        hash: Buffer.from(`${key}-${req.divarchi[key]}`).toString('base64'),
                    }).catch(() => { });
                }
            }
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
                    blocked: req.divarchi.blocked,
                })).toString('base64');
                
                req.headers['x-divarchi-for'] = xDivarchiFor;
            }
        }

        req.divarchi.$action = action;

        if (req.divarchi.blocked && params && params.onBlock) {
            params.onBlock(req.divarchi);
        }

        callback();
    } catch (error) {
        console.error(error);

        req.divarchi = undefined;

        callback();
    }
}

module.exports = firewall;