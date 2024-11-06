import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { currentUser } from "@/utils/currentUser";
import Product from "@/models/product";
import Order from "@/models/order";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
export async function POST(req) {
  await dbConnect();
  try {
    const user = await currentUser(req);
    const orderId = req.nextUrl.searchParams.get("orderId");
    const order = await Order.findById(orderId);
    // console.log("orderId => ", orderId);
    //kiem tra don hang co phai cua nguoi dung hien tai
    if (!order || order.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ err: "Order not found" }, { status: 404 });
    }
    //kiem tra don hang van con 'Not processed'
    if (order.delivery_status !== "Not Processed") {
      return NextResponse.json(
        { err: "Order cannot be cancelled" },
        { status: 400 }
      );
    }
    const refund = await stripe.refunds.create({
      payment_intent: order.payment_intent,
      reason: "requested_by_customer",
    });
    // sua so luong cua san pham da hoan trong db
    for (const cartItem of order.cartItems) {
      const product = await Product.findById(cartItem._id);
      product.quantity = product.quantity + cartItem.quantity;
      await product.save()
    }
    //sua chi tiet hoan cua don hang
    order.status = 'Refunded';
    order.refund = true;
    order.delivery_status = 'Cancelled';
    order.refundId = refund.id;
    await order.save();

    return NextResponse.json(
      { message: "Order refunded successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Refund Error:", err);
    return NextResponse.json(err, { status: 500 });
  }

}