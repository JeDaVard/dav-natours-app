const express = require('express');
const morgan = require('morgan');

const app = express();

// Routes
const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Middleware
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));

module.exports = app;
