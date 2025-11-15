export const validation = (schema) => {
    return (req, res, next) => {

        const data = {
            ...req.body,
            ...req.params,
            ...req.query,
            ...req.file
        }

        const result = schema.validate(data, { abortEarly: false });
        if (result.error) return next(new Error(result.error, { cause: 422 }));
        next();

    }
}