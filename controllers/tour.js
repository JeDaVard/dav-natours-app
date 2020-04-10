const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours,
        },
    });
};

exports.addNewTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                data: {
                    tours: newTour,
                },
            });
        }
    );
};
exports.getTour = (req, res) => {
    const tour = tours.find((tour) => tour.id === +req.params.id);

    if (!tour) res.status(404).json({ status: 'fail', message: 'Not found' });

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};

exports.editTour = (req, res) => {
    let tour = tours.find((tour) => tour.id === +req.params.id);
    if (!tour) res.status(404).json({ status: 'fail', message: 'Not found' });

    console.log(tour);
    tour = {
        ...tour.data,
        ...req.body,
    };

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};
exports.removeTour = (req, res) => {
    const deleteResponse = tours.filter((item) => item.id !== +req.params.id);

    if (deleteResponse.length >= tours.length) {
        res.status(404).json({ status: 'fail', message: 'Not found' });
    } else {
        res.status(200).json({
            status: 'success',
            result: tours.length,
            data: {
                tours: deleteResponse,
            },
        });
    }
};