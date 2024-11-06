import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import { getToken } from "next-auth/jwt";

// export async function GET(req) {
//   await dbConnect();

//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });
//   // console.log("token in user liked-products => ", token);

//   try {
//     const likedProducts = await Product.find({ likes: token.user._id });

//     return NextResponse.json(likedProducts, { status: 200 });
//   } catch (err) {
//     console.log(err);
//     return NextResponse.json(
//       {
//         err: "Server error. Please try again.",
//       },
//       { status: 500 }
//     );
//   }
// }
export async function GET(req) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user._id) {
    return NextResponse.json({ err: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const likedProducts = await Product.find({ "likes.user": token.user._id });
    return NextResponse.json(likedProducts, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "Server error. Please try again." }, { status: 500 });
  }
}