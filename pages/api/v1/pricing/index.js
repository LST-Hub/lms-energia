import strie from "stripe";
import response from "../../../../lib/response";
const stripe = strie(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const {
      name,
      email,
      addressZip,
      addressCountry,
      addressState,
      addressCity,
      addressLine2,
      addressLine1,
      payment_method_id,
      quantity,
    } = req.body;

    const customer = await stripe.customers.create({
      name: name,
      email: email,
      address: {
        line1: addressLine1,
        line2: addressLine2,
        postal_code: addressZip,
        city: addressCity,
        state: addressState,
        country: addressCountry,
      },
      payment_method: payment_method_id,
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: "price_1NI7l4SIC1B7cOmRwUuPi8uY", quantity: quantity }],
      trial_period_days: 45,
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });
    console.log("subscription", subscription);
    const status = subscription["latest_invoice"]["payment_intent"]["status"];
    const client_secret = subscription["latest_invoice"]["payment_intent"]["client_secret"];

    response({
      res,
      success: true,
      status_code: 200,
      data: { client_secret, status },
      message: "Payment intent created successfully",
    });
    return;
  } catch (error) {
    console.error("error while creating payment intent", error);
    response({ res, success: false, status_code: 500, message: "Something went wrong" });
    return;
  }
}
