const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/tour');
const User = require('../../models/user');
const Review = require('../../models/review');

dotenv.config({ path: '../../config.env' });
mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => console.log('Database is connected successfully...'));

// Read JSON files
const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('reviews.json', 'utf-8'));


const importTours = async () => {
    try {
        await Tour.create(tours, { validateBeforeSave: false });
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews, { validateBeforeSave: false });
        console.log('Imported successfully');
    } catch (e) {
        console.log(e);
    }
    process.exit();
};

const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log('Deleted successfully');
    } catch (e) {
        console.log(e);
    }
    process.exit();
};


// Processing
if (process.argv.includes('-remove')) {
    deleteTours().then(() => console.log('Done'));
}

if (process.argv.includes('-import')) {
    importTours().then(() => console.log('Done'));
}