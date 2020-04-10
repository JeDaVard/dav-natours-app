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
app.use(morgan('dev'));

module.exports = app;
