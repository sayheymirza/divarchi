const database = require('./database');

const process = async (params) => {
    const roles = await database.select('firewall');

    const values = roles.map((item)=> item.roles);
    
    const paramsValues = Object.values(params);
    
    for (let i = 0; i < values.length; i++) {
        const roles = values[i].split('|');
        let match = 0;
        for (let j = 0; j < roles.length; j++) {
            const [key, value] = roles[j].split('=');
            if (params[key] && params[key] == value) {
                match++;
            }
        }
        if (match == roles.length) {
            return true;
        }
    }

    return false;
}

module.exports = {
    process,
}