const firewall = require('./middleware.firewall');
const htaccess = require('./middleware.htaccess');
const validator = require('./middleware.validator');

module.exports = {
    firewall,
    htaccess,
    validator,
}