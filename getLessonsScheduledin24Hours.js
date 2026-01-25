const Booking = require('../models/booking');

/**
 * Returns all bookings scheduled for the next 24 hours so automatic payments occur.
 * @returns all bookings scheduled in 24 hours between.
 */
async function getLessonsScheduledIn24Hours() {
  try {

    // Finds bookings in 24 hours that haven't been cancelled and have been confirmed.
    const bookings = await Booking.find({
      date: {
        $gt: new Date(Date.now() - 60 * 60 * 1000),
        $lt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },

      cancelled: false,
      paymentGiven: false,
      tutorConfirmed: true,
      studentConfirmed: true
    });

    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}


module.exports = getLessonsScheduledIn24Hours;