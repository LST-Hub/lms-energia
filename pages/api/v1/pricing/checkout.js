import strie from "stripe";
import response from "../../../../lib/response";
const stripe = strie(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const subscription = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1NI7l4SIC1B7cOmRwUuPi8uY",
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
        trial_period_days: 45,
      },
      payment_method_collection: "if_required",
      // billing: {
      //   country: billingCountry,
      // },
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });
    console.log("Subscription quantity updated successfully!");
    response({
      res,
      success: true,
      status_code: 200,
      data: { subscription },
      message: "Payment intent created successfully",
    });
    return;
  } catch (error) {
    console.error("Error updating subscription quantity:", error);
    response({ res, success: false, status_code: 500, message: "Something went wrong" });
  }
}
