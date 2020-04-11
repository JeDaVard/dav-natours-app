const fs = require('fs');

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.checkID = (req, res, next, val) => {
    const user = users.find((tour) => tour.id === +req.params.id);
    if (!user)
        return res.status(404).json({
            status: 'fail',
            message: `Not found tour with ${val} id`,
        });
    next();
};

exports.getUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.removeUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
