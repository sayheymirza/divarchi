require('dotenv/config');

const express = require('express');
const cors = require('cors');

const proxyServer = require('http-proxy').createProxyServer();

const fs = require('fs');
const path = require('path');

const divarchi = require('../lib');

const app = express();

const admindir = path.join(process.cwd(), 'admin', 'dist', 'admin', 'browser');

app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');


app.use('/api/v1', divarchi.api);

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

app.use('/', divarchi.middleware.firewall({
    skipFiles: true,
}), (req, res) => {
    if(req.divarchi) {
        const { $action } = req.divarchi;

        switch ($action.function) {
            case 'blank':
                res.send("");
                break;
            
            case 'proxy':
                var { targetHost } = $action.config;

                delete req.headers.host;

                proxyServer.web(req, res, {
                    target: targetHost,
                    secure: false,
                });
                break;

            case 'redirect':
                var { targetHost } = $action.config;
                res.redirect(targetHost);
                break;
        
            default:
                res.status(502).json({
                    status: false,
                    code: 502,
                    i18n: 'BAD_GATEWAY',
                    message: 'Bad Gateway',
                    data: req.divarchi,
                });
                break;
        }
    } else {
        console.log('Super Internal Server Error');
        res.status(500).send('Internal Server Error');
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});