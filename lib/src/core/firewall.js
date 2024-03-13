const database = require('./database');

/**
 * Process firewall on host
 * @param {*} params collected data from request
 * @returns {{ action: number, role: number }} action id and role id in database
 */
const process = async (params) => {
    const firewall = await database.select('firewall', { host: params.host, deleted: 0 });

    const values = firewall.map((item) => JSON.parse(item.roles));

    for (let i = 0; i < values.length; i++) {
        const roles = values[i];
        let match = 0;

        for (let j = 0; j < roles.length; j++) {
            const { key, value } = roles[j];

            if (params[key] && params[key].trim() == value.trim()) {
                match++;
            }
        }

        if (match == roles.length) {
            return {
                action: firewall[i].action,
                role: firewall[i].id,
            }
        }
    }

    return {
        action: -1,
        role: -1
    }
}

module.exports = {
    process,
}