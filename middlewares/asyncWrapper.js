
// every errors happend on (async function) 
module.exports = (asyncFn) => {
    return (req, res, next) => {
        asyncFn(req, res, next).catch((err) => {
            next(err);
        });
    };
};