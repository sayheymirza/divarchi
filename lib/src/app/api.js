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
        values: ["proxy", "blank", "redirect"]
    },
    config: {
        type: "object",
        props: {
            xDivarchiFor: {
                type: "boolean",
                default: false,
            },
            targetHost: {
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
            xDivarchiFor: {
                type: "boolean",
                default: false,
            },
            targetHost: {
                type: "string",
                default: null,
                optional: true
            }
        }
    },
}), (req, res) => {
    database.update('action', req.data, { id: req.params.id });

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
    aggregate: {
        // string array
        type: "array",
        items: {
            type: "string"
        },
        optional: true,
        default: []
    },
}), async (req, res) => {
    const data = await database.select('request', req.data.filter);

    const aggregate = {};

    if(req.data.aggregate.length && data.length > 0) {
        for (const item of data) {
            if(item.deleted == 1) continue;

            for (const key of req.data.aggregate) {
                if(
                    item[key] == null ||
                    item[key] == undefined ||
                    item[key] == ''
                ) 
                    continue;

                if (aggregate[key]) {
                    if (!aggregate[key].includes(item[key])) {
                        aggregate[key].push(item[key]);
                    }
                } else {
                    aggregate[key] = [item[key]];
                }
            }
        }
    }

    res.json({
        status: true,
        code: 200,
        message: "SEARCH_RESULTS",
        meta: {
            total: data.length,
            aggregate: req.data.aggregate ? aggregate : undefined,
            query: req.query,
        },
        data: data.reverse(),
    })
});

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
    }
}), (req, res) => {
    database.insert('firewall', {
        ...req.data,
        roles: JSON.stringify(req.data.roles)
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
    }
}), (req, res) => {
    database.update('firewall', {
        ...req.data,
        roles: JSON.stringify(req.data.roles)
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