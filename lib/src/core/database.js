const sqlite3 = require('sqlite3').verbose();

const SQLITE = process.env.SQLITE || ':memory:';

const db = new sqlite3.Database(SQLITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});

const createTables = () => {
    db.serialize(() => {
        // table of host
        db.run(`CREATE TABLE IF NOT EXISTS host (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            host TEXT NOT NULL UNIQUE,
            action INTEGER NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            deleted BOOLEAN NOT NULL            
        )`);

        // table of aggregate if key & value (together) is unique
        db.run(`CREATE TABLE IF NOT EXISTS aggregate (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            deleted BOOLEAN NOT NULL,
            UNIQUE(key, value)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS request (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action INTEGER NOT NULL,
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
            platform TEXT NULL,
            device TEXT NULL,
            userAgent TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            deleted BOOLEAN NOT NULL
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
            updatedAt TEXT NOT NULL,
            deleted BOOLEAN NOT NULL
        )`);

        // create a table for actions
        db.run(`CREATE TABLE IF NOT EXISTS action (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            function TEXT NOT NULL,
            config TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            deleted BOOLEAN NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS firewall (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roles TEXT NOT NULL,
            host TEXT NOT NULL,
            action INTEGER NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            deleted BOOLEAN NOT NULL
        )`);
    });
}

createTables();

const insert = (table, data) => {
    return new Promise((resolve, reject) => {
        data.createdAt = new Date().toLocaleString();
        data.updatedAt = new Date().toLocaleString();
        data.deleted = 0;

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
        data.updatedAt = new Date().toLocaleString();

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
        // update all rows to deleted = true
        const sql = `UPDATE ${table} SET deleted = 1`;
        db.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
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