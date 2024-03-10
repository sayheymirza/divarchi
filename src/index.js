require('dotenv/config');

const express = require('express');
const cors = require('cors');

const fs = require('fs');
const path = require('path');

const divarchi = require('../lib');

const app = express();

const admindir = path.join(process.cwd(), 'admin', 'dist', 'admin', 'browser');
// http access file .htaccess
const httpaccessfile = path.join(process.cwd(), '.htaccess');

// if .htaccess file not exists, create it
if (!fs.existsSync(httpaccessfile)) {
    fs.writeFileSync(httpaccessfile, ``);
}

const hasAccess = (req, res, next) => {
    const accessToken = req.headers['x-access-token'] || req.query['token'];


    if (accessToken) {
        const httpaccess = fs.readFileSync(httpaccessfile, 'utf-8');
        const lines = httpaccess.split('\n');

        for (const line of lines) {
            if (line.includes(accessToken)) {
                return next();
            }
        }

        res.status(403).json({
            status: false,
            code: 403,
            i18n: 'ACCESS_DENIED',
            message: 'Access denied'
        });
    } else {
        res.status(403).json({
            status: false,
            code: 403,
            i18n: 'ACCESS_DENIED',
            message: 'Access denied'
        });
    }
}

app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');

app.post('/api/v1/track', (req, res) => {
    const { id, screen, responsedAt } = req.body;

    if (id && screen, responsedAt) {
        divarchi.database.update('request', { screen, responsedAt }, { id });
    }

    res.status(500).json({
        status: false,
        code: 500,
        i18n: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error'
    });
});

app.post('/api/v1/access', async (req, res) => {
    // check user access token exists or not in .httpaccess file
    const { accessToken } = req.body;

    if (accessToken) {
        const httpaccess = fs.readFileSync(httpaccessfile, 'utf-8');
        const lines = httpaccess.split('\n');

        for (const line of lines) {
            if (line.includes(accessToken)) {
                return res.json({
                    status: true,
                    code: 200,
                    i18n: 'ACCESS_GRANTED',
                    message: 'Access granted'
                });
            }
        }

        return res.status(403).json({
            status: false,
            code: 403,
            i18n: 'ACCESS_DENIED',
            message: 'Access denied'
        });
    } else {
        return res.status(400).json({
            status: false,
            code: 400,
            i18n: 'BAD_DATA',
            message: 'Need access token to continue'
        });
    }
});

app.get('/api/v1/request', hasAccess, async (req, res) => {
    const data = await divarchi.database.select('request', {
        ...req.query,
    });

    const filters = {};

    const keys = ['host', 'method', 'path', 'ip', 'network', 'isp', 'ispType', 'country', 'city', 'referer', 'os', 'browser', 'device', 'screen'];

    if(data.length > 0) {        
        for (const item of data) {
            for (const key of keys) {
                if(
                    item[key] == null ||
                    item[key] == undefined ||
                    item[key] == ''
                ) 
                    continue;

                if (filters[key]) {
                    if (!filters[key].includes(item[key])) {
                        filters[key].push(item[key]);
                    }
                } else {
                    filters[key] = [item[key]];
                }
            }
        }
    }

    res.json({
        status: true,
        code: 200,
        i18n: 'ALL_REQUESTS',
        message: 'All requests are here',
        meta: {
            total: data.length,
            filters,
            query: req.query,
        },
        data: data.reverse(),
    })
});

app.delete('/api/v1/request', hasAccess, async (req, res) => {
    await divarchi.database.clear('request');

    res.json({
        status: true,
        code: 200,
        i18n: 'REQUEST_DELETED',
        message: 'Request deleted'
    })
});

app.get('/api/v1/firewall', hasAccess, async (req, res) => {
    const data = await divarchi.database.select('firewall', {
        ...req.query,
    });

    res.json({
        status: true,
        code: 200,
        i18n: 'ALL_FIREWALLS',
        message: 'All firewalls are here',
        meta: {
            total: data.length
        },
        data,
    })
})

app.post('/api/v1/firewall', hasAccess, async (req, res) => {
    const { roles } = req.body;
    // roles is [{key: 'ip', value: 'x.x.x.x'}, {key: 'country', value: 'india'}]
    // store it like ip=x.x.x.x|country=india

    if (roles) {
        await divarchi.database.insert('firewall', {
            roles: roles.map(({ key, value }) => `${key}=${value}`).join('|')
        })

        res.json({
            status: true,
            code: 200,
            i18n: 'FIREWALL_UPDATED',
            message: 'Firewall updated'
        })
    } else {
        res.status(400).json({
            status: false,
            code: 400,
            i18n: 'BAD_DATA',
            message: "Need roles to continue"
        })
    }
});

app.put('/api/v1/firewall/:id', hasAccess, async (req, res) => {
    const { id } = req.params;
    const { roles } = req.body;

    if (roles) {
        await divarchi.database.update('firewall', {             
            roles: roles.map(({ key, value }) => `${key}=${value}`).join('|')
        }, { id })

        res.json({
            status: true,
            code: 200,
            i18n: 'FIREWALL_UPDATED',
            message: 'Firewall updated'
        })
    } else {
        res.status(400).json({
            status: false,
            code: 400,
            i18n: 'BAD_DATA',
            message: "Need roles to continue"
        })
    }
});

app.delete('/api/v1/firewall/:id', hasAccess, async (req, res) => {
    const { id } = req.params;

    await divarchi.database.remove('firewall', { id });

    res.json({
        status: true,
        code: 200,
        i18n: 'FIREWALL_UPDATED',
        message: 'Firewall updated'
    })
});

app.use('/admin', (req, res) => {
    // if file not exists, redirect to /admin
    const url = req.url.replace('/admin', '').trim();

    const file = path.join(admindir, url);

    if (fs.existsSync(file)) {
        res.sendFile(file);
    } else {
        res.sendFile(path.join(admindir, 'index.html'));
    }
});

// handle public directory by host
app.use('/', divarchi.middleware(), (req, res) => {
    if (req.divarchi) {
        const { id, host, blocked } = req.divarchi;

        // render of {host}/index.ejs
        res.status(blocked ? 500 : 502).render(`${host}/index`, { id, host, blocked });
    } else {
        res.status(500).send('Internal Server Error');
    }
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});