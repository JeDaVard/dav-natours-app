const AppError = require('../utils/appError')

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = e => {
    const value = e.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Already existing field ${value}. Please use another value.`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = e => {
    const errors = Object.values(e.errors).map( el => el.message )

    const message = `Invalid input data: ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token, please login again', 401);
const handleJWTExpiredError = () => new AppError('Token expired, please login again', 401)

const errDev = (err, req, res) => {
    // Error on /API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            error: err,
            status: err.status,
            message: err.message,
            stack: err.stack
        })
    }
    // Error on rendered website
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
}

const errProd = (err, req, res) => {
    // for API
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send some details to the client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        } else {
            console.error('ERROR BOOM', err)
            // Programing errors, unknown errors: don't leak error details
            return res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!'
            })
        }
    }
    // For rendered template
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please, try later :)'
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        errDev(err, req, res)
    } else {
        let error = { ...err }
        error.message = err.message

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.message === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        errProd(error, req, res)
    }
}