const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/tour');
const User = require('../../models/user');

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

// Import tours
const importTours = async () => {
    try {
        await Tour.create(tours);
        console.log('Imported successfully');
    } catch (e) {
        console.log(e);
    }
    process.exit();
};
// Remove all tours
const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        console.log('Deleted successfully');
    } catch (e) {
        console.log(e);
    }
    process.exit();
};

// Import tours
const importUsers = async () => {
    try {
        await User.create(users);
        console.log('Imported successfully');
    } catch (e) {
        console.log(e);
    }
    process.exit();
};
// Remove all tours
const deleteUsers = async () => {
    try {
        await User.deleteMany();
        console.log('Deleted successfully');
    } catch (e) {
        console.log(e);
    }
    process.exit();
};

// Processing
if (process.argv.includes('-remove-tours')) {
    deleteTours().then(() => console.log('Done'));
}

if (process.argv.includes('-import-tours')) {
    importTours().then(() => console.log('Done'));
}

if (process.argv.includes('-remove-users')) {
    deleteUsers().then(() => console.log('Done'));
}

if (process.argv.includes('-import-users')) {
    importUsers().then(() => console.log('Done'));
}
