const connect = require("../db/connect");

const queryAsync = (query, values = []) => {
    return new Promise((resolve, reject) => {
        connect.query(query, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = queryAsync;