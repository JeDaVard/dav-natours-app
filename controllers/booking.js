const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour');
const Booking = require('../models/booking');
const User  = require('../models/user')
const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handleFactory');

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     // This is temporary, because it is NOT secure: everyone can make bookings without paying
//     const {tour, user, price } = req.query;
//
//     if (!tour && !user && !price) return next();
//     await Booking.create({ tour, user, price })
//
//     res.redirect(`${req.originalUrl.split('?')[0]}`);
// });

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = await User.findOne({email: session.customer_email});
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price })
}

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    } catch (e) {
        return res.status(400).send(`Webhook error: ${e.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object)
    }
    res.send(200).json({
        received: true
    })
}

exports.getBookings = handleFactory.getAll(Booking);
exports.getBooking = handleFactory.getOne(Booking);
exports.addNewBooking = handleFactory.createOne(Booking);
exports.editBooking = handleFactory.updateOne(Booking);
exports.removeBooking = handleFactory.deleteOne(Booking);