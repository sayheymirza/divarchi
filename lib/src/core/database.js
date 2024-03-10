const sqlite3 = require('sqlite3').verbose();

const SQLITE = process.env.SQLITE || ':memory:';

const db = new sqlite3.Database(SQLITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});

/**
 * create tables
 * 1. request
 * 2. ip 
 * 3. firewall
 */

const createTables = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS request (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blocked BOOLEAN NOT NULL,
            host TEXT NOT NULL,
            path TEXT NOT NULL,
            method TEXT NOT NULL,
            ip TEXT NOT NULL,
            network TEXT NULL,
            isp TEXT NULL,
            ispType TEXT NULL,
            country TEXT NULL,
            city TEXT NULL,
            lat TEXT NULL,
            lon TEXT NULL,
            referer TEXT NOT NULL,
            os TEXT NULL,
            browser TEXT NULL,
            device TEXT NULL,
            screen TEXT NULL,
            userAgent TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            requestedAt TEXT NOT NULL,
            responsedAt TEXT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS ip (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            country TEXT NULL,
            city TEXT NULL,
            lat TEXT NULL,
            lon TEXT NULL,
            isp TEXT NULL,
            ispType TEXT NULL,
            network TEXT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )`);


        // firewall role is multi condition based on key and value, like: ip=x.x.x.x & country=india

        db.run(`CREATE TABLE IF NOT EXISTS firewall (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roles TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )`);
    });
}

createTables();

const insert = (table, data) => {
    return new Promise((resolve, reject) => {
        data.createdAt = new Date().toISOString();
        data.updatedAt = new Date().toISOString();

        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((key) => '?').join(',');
        const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;

        db.run(sql, values, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

const select = (table, where = {}) => {
    return new Promise((resolve, reject) => {
        const keys = Object.keys(where);
        const values = Object.values(where);
        const conditions = keys.map((key) => `${key} = ?`).join(' AND ');
        let sql = `SELECT * FROM ${table}`;

        if(conditions.length != 0) {
            sql += ' WHERE ' + conditions;
        }

        db.all(sql, values, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const update = (table, data, where = {}) => {
    return new Promise((resolve, reject) => {
        data.updatedAt = new Date().toISOString();

        const keys = Object.keys(data);
        const values = Object.values(data);
        const conditions = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');
        const sql = `UPDATE ${table} SET ${keys.map((key) => `${key} = ?`).join(',')} WHERE ${conditions}`;
        db.run(sql, [...values, ...Object.values(where)], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

const remove = (table, where = {}) => {
    return new Promise((resolve, reject) => {
        const conditions = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');
        const sql = `DELETE FROM ${table} WHERE ${conditions}`;
        db.run(sql, Object.values(where), function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

const clear = (table) => {
    // clear all data from table
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM ${table}`;
        db.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                createTables();
                resolve(this.changes);
            }
        });
    });
}

module.exports = {
    db,
    insert,
    select,
    update,
    remove,
    clear
};