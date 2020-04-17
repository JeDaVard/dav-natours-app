require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT;
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => console.log('Database is connected successfully...'));


const server = app.listen(port, () => {
    console.log(`Server is up on port: ${port}. ...`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('unhandledRejection. Shutting down...');
    server.close(() => {
        process.exit(1)
    })
});
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('uncaughtException. Shutting down...');
    server.close(() => {
        process.exit(1)
    })
})