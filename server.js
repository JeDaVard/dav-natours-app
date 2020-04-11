const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

const Tour = require('./models/tour');

dotenv.config({ path: './config.env' });
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is up on port: ${port}. ...`);
});
