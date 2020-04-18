const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour');
const Booking = require('../models/booking');
const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handleFactory');

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });
    res.status(200).json({
        status: 'Success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is temporary, because it is NOT secure: everyone can make bookings without paying
    const {tour, user, price } = req.query;

    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price })

    res.redirect(`${req.originalUrl.split('?')[0]}`);
});

exports.getBookings = handleFactory.getAll(Booking);
exports.getBooking = handleFactory.getOne(Booking);
exports.addNewBooking = handleFactory.createOne(Booking);
exports.editBooking = handleFactory.updateOne(Booking);
exports.removeBooking = handleFactory.deleteOne(Booking);