const express = require('express');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/error');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const mongoSanitize = require('express-rate-limit');
const hpp = require('hpp');

const app = express();

// GLOBAL MID FOR SECURITY SEEKS
// set security http headers
app.use(helmet());
// limit request from the same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP!'
})
app.use('/', limiter);
// data sanitization against NoSQL query injection
app.use(mongoSanitize())
// data sanitization against xss
app.use(xssClean())

// MIDDLEWARE
// body parser, reading data from body into req.body
//  and limit to 20kb
app.use(express.json({ limit: '20kb' }));
// static files
app.use(express.static(`${__dirname}/public`));
// test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next()
})
// prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))

// Routes
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');
const reviewRouter = require('./routes/review');

app.use('/api/v1/tours', tourRouter);
app.use('/', userRouter);
app.use('/', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError('Not found!'))
})

app.use(globalErrorController)

module.exports = app;