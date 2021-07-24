const Razorpay = require("razorpay");
const shortid = require("shortid");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY,
  key_secret: process.env.RAZORPAY_TEST_SECRET,
});

exports.orderId = async (req, res, next) => {
  try {
    const options = {
      amount: "50000",
      currency: "INR",
      receipt: shortid.generate(),
    };
    const data = await razorpay.orders.create(options);
    res.status(200).json({
      status: "success",
      id: data.id,
      currency: "INR",
      amount: "50000",
    });
  } catch (err) {
    next(err);
  }
};
