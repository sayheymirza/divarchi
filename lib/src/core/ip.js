const axios = require('axios');
const database = require('./database');

const getIPFromProviderIPAPI = async (ip = "") => {
    try {
        // if ip is ipv6 return 
        if(ip.includes(':')) {
            return {};
        }

        // find ip if exists in database
        const find = await database.select('ip', { ip });

        if(find && find.length == 0) {
            return find[0];
        }

        const url = `https://api.ipapi.com?q=${ip}`;

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = response.data;

        const output = {
            ip: ip,
            country: data.location.country,
            city: data.location.city,
            lat: data.location.latitude,
            lon: data.location.longitude,
            isp: data.company.name,
            ispType: data.company.type,
            network: data.connection.network,
        }

        // store it on database to cache
        await database.insert('ip', output);

        return output;
    } catch (error) {
        return {}
    }
}

module.exports = {
    getIPFromProviderIPAPI,
}