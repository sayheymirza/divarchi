const Validator = require("fastest-validator");

const validator = new Validator();

module.exports = (schema = {}) => {
    const check = validator.compile(schema);

    return (req, res, next) => {
        const data = {
            ...req.query,
            ...req.body,
            ...req.params,
        }

        const errors = check(data);

        if (Array.isArray(errors) && errors.length) {
            return res.status(400).json({
                status: false,
                code: 400,
                i18n: "BAD_DATA",
                message: "Bad data",
                data: errors
            });
        }

        req.data = data;

        next();
    }
}