const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/error');
const cookieParser = require('cookie-parser');
<<<<<<< HEAD
const compression = require('compression')
=======
const compression = require('compression');
const cors = require('cors');

const viewRouter = require('./routes/view')
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');
const reviewRouter = require('./routes/review');
const bookingRouter = require('./routes/booking');
const bookingController = require('./controllers/booking');
>>>>>>> 3f2c44c94866c3fffd31e6288c26819cd30a5802

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xssClean = require('xss-clean');
// const mongoSanitize = require('express-rate-limit');
const hpp = require('hpp');

//____________________________________________________________________

// App settings
const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//____________________________________________________________________

//Stripe checkout WebHook (attention: before express.json middleware for getting worked)
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), bookingController.webhookCheckout);
//____________________________________________________________________

// GLOBAL MID FOR SECURITY SEEKS
// set security http headers
app.use(helmet());
// limit request from the same IP
const limiter = rateLimit({
    max: 300,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP!',
});
app.use('/', limiter);
// data sanitization against NoSQL query injection
// (the case was: mongo query on email input & fake pass = easy login)
// BUT I TURNED THIS OF BECAUSE OF "Too many requests, please try again later."
// MESSAGE WHILE TRYING TO MANAGE WITH THE WEBSITE A BIT FASTER :(
<<<<<<< HEAD
app.use(mongoSanitize());
=======
// app.use(mongoSanitize());
>>>>>>> 3f2c44c94866c3fffd31e6288c26819cd30a5802
// data sanitization against xss
app.use(xssClean());
//Implementing cors
//Access-Control-Allow-Origin
app.use(cors({
    origin: 'https://dav-natours-app.herokuapp.com/api/v1/tours'
}));
// Not simple requests
// app.options('*', cors());
app.options('/api/v1/tours/:id', cors())
//____________________________________________________________________
// MIDDLEWARE
// body parser, reading data from body into req.body
//  and limit to 20kb
app.use(express.json({ limit: '20kb' }));
// encode url
app.use(express.urlencoded({ extended: true, limit: '10kb'}))
// cookie parser
app.use(cookieParser());
// static files
app.use(express.static(path.join(__dirname, 'public')));
// test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next();
});
// prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);
// COMPRESS TEXT
app.use(compression())

//____________________________________________________________________
// Routes
<<<<<<< HEAD
const viewRouter = require('./routes/view')
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');
const reviewRouter = require('./routes/review');
const bookingRouter = require('./routes/booking');

=======
>>>>>>> 3f2c44c94866c3fffd31e6288c26819cd30a5802
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter)

app.all('*', (req, res, next) => {
    next(new AppError('Not found!'));
});
//____________________________________________________________________

app.use(globalErrorController);

module.exports = app;
