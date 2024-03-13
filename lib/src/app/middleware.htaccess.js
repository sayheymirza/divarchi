const fs = require('fs');
const path = require('path');

// http access file .htaccess
const httpaccessfile = process.env.HTACCESS ?? path.join(process.cwd(), '.htaccess');

// if .htaccess file not exists, create it
if (!fs.existsSync(httpaccessfile)) {
    fs.writeFileSync(httpaccessfile, ``);
}

const hasAccess = (req, res, next) => {
    const accessToken = req.headers['x-access-token'] ?? req.headers['x-divarchi-token'] ?? req.query['token'];

    if (accessToken) {
        const httpaccess = fs.readFileSync(httpaccessfile, 'utf-8');

        if (httpaccess.includes(accessToken)) {
            return next();
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

module.exports = hasAccess;