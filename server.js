const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');


dotenv.config({ path: './config.env' });
const port = process.env.PORT;
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => console.log('Database is connected successfully...'));


app.listen(port, () => {
    console.log(`Server is up on port: ${port}. ...`);
});
