const { Router } = require('express');

const database = require('../core/database');
const middleware = require('./middleware');

const router = Router();

router.use(middleware.htaccess);

// access
router.post('/access', (req, res) => {
    res.json({
        status: true,
        code: 200,
        i18n: "ACCESS",
        message: "You have the access"
    })
})

// host CRUD
router.post('/host', middleware.validator({
    host: {
        type: "string",
        pattern: "^[a-z0-9-]+(\\.[a-z0-9-]+)*$"
    },
    action: {
        type: "number",
        min: 1,
        convert: true
    }
}), (req, res) => {
    database.insert('host', req.data);

    res.json({
        status: true,
        code: 200,
        i18n: "HOST_CREATED",
    })
});

router.get('/host', async (req, res) => {
    const data = await database.select('host', { deleted: 0 });

    res.json({
        status: true,
        code: 200,
        message: "ALL_HOSTS",
        meta: {
            total: data.length
        },
        data,
    })
});

router.delete('/host/:id', middleware.validator({
    id: {
        type: "number",
        min: 1,
        convert: true
    }
}), (req, res) => {
    database.remove("host", req.data)

    res.json({
        status: true,
        code: 200,
        i18n: "HOST_DELETED"
    })
});

router.put('/host/:id', middleware.validator({
    id: {
        type: "number",
        min: 1,
        convert: true
    },
    host: {
        type: "string",
        pattern: "^[a-z0-9-]+(\\.[a-z0-9-]+)*$"
    },
    action: {
        type: "number",
        min: 1,
        convert: true
    }
}), (req, res) => {
    database.update('host', req.data, { id: req.params.id });

    res.json({
        status: true,
        code: 200,
        i18n: "HOST_UPDATED"
    })
});


// action CURD
router.post('/action', middleware.validator({
    name: {
        type: "string",
        min: 3,
        max: 128
    },
    function: {
        type: "enum",
        values: ["proxy", "blank", "redirect", "render"]
    },
    config: {
        type: "object",
        props: {
            status: {
                type: "number",
                min: 100,
                max: 599,
                optional: true,
                default: 200
            },
            xDivarchiFor: {
                type: "boolean",
                default: false,
            },
            targetHost: {
                type: "string",
                default: null,
                optional: true
            },
            file: {
                type: "string",
                default: null,
                optional: true
            },
            data: {
                type: "string",
                default: null,
                optional: true
            }
        }
    },
}), (req, res) => {
    database.insert('action', {
        ...req.data,
        config: JSON.stringify(req.data.config)
    });

    res.json({
        status: true,
        code: 200,
        i18n: "ACTION_CREATED"
    })
});

router.get('/action', async (req, res) => {
    const data = await database.select('action', { deleted: 0 });

    res.json({
        status: true,
        code: 200,
        message: "ALL_ACTIONS",
        meta: {
            total: data.length
        },
        data,
    })
});

router.delete('/action/:id', middleware.validator({
    id: {
        type: "number",
        min: 1,
        convert: true
    }
}), (req, res) => {
    database.remove("action", req.data)

    res.json({
        status: true,
        code: 200,
        i18n: "ACTION_DELETED"
    })
});

// update
router.put('/action/:id', middleware.validator({
    id: {
        type: "number",
        min: 1,
        convert: true
    },
    name: {
        type: "string",
        min: 3,
        max: 128
    },
    function: {
        type: "enum",
        values: ["proxy", "blank", "redirect"]
    },
    config: {
        type: "object",
        props: {
            status: {
                type: "number",
                min: 100,
                max: 599,
                optional: true,
                default: 200
            },
            xDivarchiFor: {
                type: "boolean",
                default: false,
            },
            targetHost: {
                type: "string",
                default: null,
                optional: true
            },
            file: {
                type: "string",
                default: null,
                optional: true
            },
            data: {
                type: "string",
                default: null,
                optional: true
            }
        }
    },
}), (req, res) => {
    database.update('action', {
        ...req.data,
        config: JSON.stringify(req.data.config)
    }, { id: req.params.id });

    res.json({
        status: true,
        code: 200,
        i18n: "ACTION_UPDATED"
    })
});

// search request
router.post('/request', middleware.validator({
    filter: {
        type: "object",
        optional: true,
        default: {}
    },
    page: {
        type: "number",
        min: 1,
        convert: true,
        default: 1,
    },
    limit: {
        type: "number",
        min: 1,
        max: 100,
        convert: true,
        default: 10,
    }
}), async (req, res) => {
    const data = await database.select('request', req.data.filter, ['createdAt', 'DESC'], {
        page: req.data.page,
        limit: req.data.limit
    });

    const count = await database.count('request', req.data.filter);

    res.json({
        status: true,
        code: 200,
        message: "SEARCH_RESULTS",
        meta: {
            total: count,
            page: req.data.page,
            limit: req.data.limit,
            last: Math.ceil(count / req.data.limit) ?? 1,
            query: req.query,
        },
        data: data
    });
});

router.get('/request/aggregate', async (req, res) => {
    const data = await database.select('aggregate');

    let aggregate = {};

    for (const item of data) {
        const { key, value } = item;

        if (aggregate[key]) {
            aggregate[key].push(value)
        } else {
            aggregate[key] = [value]
        }
    }

    res.json({
        status: true,
        code: 200,
        message: "AGGREGATE_RESULTS",
        data: aggregate
    })
})

// delete all request
router.delete('/request', (req, res) => {
    database.clear('request');

    res.json({
        status: true,
        code: 200,
        i18n: "REQUEST_DELETED"
    })
});

// firewall CURD
router.post('/firewall', middleware.validator({
    roles: {
        type: "array",
        items: {
            type: "object"
        },
        min: 1,
    },
    host: {
        type: "string",
        pattern: "^[a-z0-9-]+(\\.[a-z0-9-]+)*$"
    },
    action: {
        type: "number",
        min: 1,
        convert: true
    },
    automaticDuplicate: {
        type: "boolean",
        default: false
    },
    automaticBlockIP: {
        type: "boolean",
        default: false
    }
}), (req, res) => {
    req.data.roles = JSON.stringify(req.data.roles);

    database.insert('firewall', {
        ...req.data,
        hash: Buffer.from(`${req.data.host}-${req.data.action}-${req.data.roles}`).toString('base64')
    });

    res.json({
        status: true,
        code: 200,
        i18n: "FIREWALL_CREATED"
    })
});

// get all firewall (filters: host)
router.get('/firewall', middleware.validator({
    host: {
        type: "string",
        pattern: "^[a-z0-9-]+(\\.[a-z0-9-]+)*$",
        optional: true
    }
}), async (req, res) => {
    const data = await database.select('firewall', { ...req.data, deleted: 0 });

    res.json({
        status: true,
        code: 200,
        message: "ALL_FIREWALLS",
        meta: {
            total: data.length
        },
        data,
    })
});

// delete firewall
router.delete('/firewall/:id', middleware.validator({
    id: {
        type: "number",
        min: 1,
        convert: true
    }
}), (req, res) => {
    database.remove("firewall", req.data)

    res.json({
        status: true,
        code: 200,
        i18n: "FIREWALL_DELETED"
    })
});

// update firewall
router.put('/firewall/:id', middleware.validator({
    id: {
        type: "number",
        min: 1,
        convert: true
    },
    roles: {
        type: "array",
        items: {
            type: "object"
        },
        min: 1,
    },
    host: {
        type: "string",
        pattern: "^[a-z0-9-]+(\\.[a-z0-9-]+)*$"
    },
    action: {
        type: "number",
        min: 1,
        convert: true
    },
    automaticDuplicate: {
        type: "boolean",
        default: false
    },
    automaticBlockIP: {
        type: "boolean",
        default: false
    }
}), (req, res) => {
    req.data.roles = JSON.stringify(req.data.roles);

    database.update('firewall', {
        ...req.data,
        hash: Buffer.from(`${req.data.host}-${req.data.action}-${req.data.roles}`).toString('base64')
    }, { id: req.params.id });

    res.json({
        status: true,
        code: 200,
        i18n: "FIREWALL_UPDATED"
    })
});

router.all('*', (req, res) => {
    res.status(404).json({
        status: false,
        code: 404,
        i18n: 'PAGE_NOT_FOUND',
        message: "Page not found"
    })
})


module.exports = router;