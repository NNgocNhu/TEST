import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Order from "@/models/order";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  await dbConnect();
  const _raw = await req.text();
  const sig = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      _raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Stripe Event Received:", event);

    if (event.type === "charge.succeeded") {
      const chargeSucceeded = event.data.object;
      const { id, ...rest } = chargeSucceeded;

      // Check if the order already exists
      const existingOrder = await Order.findOne({ chargeId: id });
      if (existingOrder) {
        console.log("Order already exists for this charge ID:", id);
        return NextResponse.json({ ok: true }); // Or handle as needed
      }

      const cartItems = JSON.parse(chargeSucceeded.metadata.cartItems);
      console.log("Parsed cartItems:", cartItems);

      const productIds = cartItems.map((item) => item._id);
      const products = await Product.find({ _id: { $in: productIds } });

      const productMap = {};
      products.forEach((product) => {
        productMap[product._id.toString()] = {
          _id: product._id,
          title: product.title,
          slug: product.slug,
          price: product.price,
          image: product.images[0]?.secure_url || "",
        };
      });

      const cartItemsWithProductDetails = cartItems.map((cartItem) => ({
        ...productMap[cartItem._id],
        quantity: cartItem.quantity,
      }));

      const orderData = {
        ...rest,
        chargeId: id,
        userId: chargeSucceeded.metadata.userId,
        cartItems: cartItemsWithProductDetails,
      };
      console.log("Order Data:", orderData);

      await Order.create(orderData).catch((error) => {
        console.log("Order Creation Error:", error);
        throw new Error("Failed to create order");
      });

      // Update stock quantity
      for (const cartItem of cartItems) {
        const product = await Product.findById(cartItem._id);
        if (product.stock >= cartItem.quantity) {
          product.stock -= cartItem.quantity;
          await product.save();
        } else {
          return NextResponse.json({
            error: "Not enough stock for some items",
            status: 400,
          });
        }
      }
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ message: "Unhandled event type" });
    }
  } catch (err) {
    console.log("Error in Webhook Handling:", err);
    return NextResponse.json({
      err: "Server error. Please try again",
      status: 500,
    });
  }
}
