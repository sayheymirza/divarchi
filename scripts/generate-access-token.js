require('dotenv/config');

const uuid = require('uuid');

const fs = require('fs');
const path = require('path');

// http access file .htaccess
const httpaccessfile = process.env.HTACCESS ?? path.join(process.cwd(), '.htaccess');

// if .htaccess file not exists, create it
if (!fs.existsSync(httpaccessfile)) {
    fs.writeFileSync(httpaccessfile, ``);
}

const accessToken = uuid.v4();

fs.appendFileSync(httpaccessfile, `${accessToken}\n`);

console.log(`Access token: ${accessToken}`);
