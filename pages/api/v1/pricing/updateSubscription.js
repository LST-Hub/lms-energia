import strie from "stripe";
import response from "../../../../lib/response";
const stripe = strie(process.env.STRIPE_SECRET_KEY);

// async function updateSubscriptionQuantity(subscriptionId, newQuantity) {
//   try {
//     const subscription = await stripe.subscriptions.retrieve(subscriptionId);
//     subscription.quantity = newQuantity;
//     await subscription.save();
//     console.log("Subscription quantity updated successfully!");
//   } catch (error) {
//     console.error("Error updating subscription quantity:", error);
//   }
// }

// // Example usage
// const subscriptionId = "sub_1NE5R9SIC1B7cOmR43uy7XeQ"; // Replace with the actual subscription ID
// const newQuantity = 15; // Replace with the desired new quantity
// updateSubscriptionQuantity(subscriptionId, newQuantity);

// *** update quactity code ***
// export default async function handler(req, res) {
//   try {
//     const subscription = await stripe.subscriptions.update("sub_1NI4vjSIC1B7cOmREwbKYAIg", {
//       quantity: 10,
//     });
//     console.log("Subscription quantity updated successfully!");
//     response({
//       res,
//       success: true,
//       status_code: 200,
//       data: [subscription],
//       message: "Payment intent created successfully",
//     });
//     return;
//   } catch (error) {
//     console.error("Error updating subscription quantity:", error);
//     response({ res, success: false, status_code: 500, message: "Something went wrong" });
//   }
// }

// *** update quactity code ***
export default async function handler(req, res) {
  try {
    const subscription = await stripe.subscriptions.update("sub_1NI9pvSIC1B7cOmREXeP9zE2", {
      items: [{ id: "si_O4IQFBLbBEu6B4", quantity: 100 }],
      proration_behavior: "none",
    });
    console.log("Subscription quantity updated successfully!");
    response({
      res,
      success: true,
      status_code: 200,
      data: [subscription],
      message: "Payment intent created successfully",
    });
    return;
  } catch (error) {
    console.error("Error updating subscription quantity:", error);
    response({ res, success: false, status_code: 500, message: "Something went wrong" });
  }
}

// export default async function handler(req, res) {
//   try {
//     const record = await stripe.subscriptionItems.createUsageRecord("si_O20viyZ0FKnPKV", {
//       quantity: 1,
//       timestamp: "now",
//       action: "increment",
//     });
//     console.log("Subscription quantity updated successfully!");
//     response({
//       res,
//       success: true,
//       status_code: 200,
//       data: { record },
//       message: "Payment intent created successfully",
//     });
//     return;
//   } catch (error) {
//     console.error("Error updating subscription quantity:", error);
//     response({ res, success: false, status_code: 500, message: "Something went wrong" });
//   }
// }

// export default async function handler(req, res) {
//   try {
//     const product = await stripe.products.create({
//       name: "Task-Sprint",
//     });
//     console.log("Subscription quantity updated successfully!");

//     const price = await stripe.prices.create({
//       product: product.id,
//       unit_amount: 1000,
//       currency: "usd",
//       recurring: {
//         interval: "month",
//         usage_type: 'licensed',
//       },
//     });
//     response({
//       res,
//       success: true,
//       status_code: 200,
//       data: [price],
//       message: "Payment intent created successfully",
//     });
//     return;
//   } catch (error) {
//     console.error("Error updating subscription quantity:", error);
//     response({ res, success: false, status_code: 500, message: "Something went wrong" });
//   }
// }
