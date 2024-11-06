// import { NextResponse } from "next/server";
// import dbConnect from "@/utils/dbConnect";
// import Product from "@/models/product";
// import { getToken } from "next-auth/jwt";
// export async function PUT(req) {
//   await dbConnect();
//   const _req = await req.json();
//   const { productId } = _req;
//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });
//   try {
//     const updated = await Product.findByIdAndUpdate(
//       productId,
//       {
//         $pull: { likes: token.user._id },
//       },
//       { new: true }
//     );

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.log(err);
//     return NextResponse.json(
//       {
//         err: "Server error. Please try again.",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }
import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import { getToken } from "next-auth/jwt";

// Handle unliking a product
export async function POST(req) {
  await dbConnect();
  const _req = await req.json();
  const { productId } = _req;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.user || !token.user._id) {
    return NextResponse.json({ err: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ err: "Product not found." }, { status: 404 });
    }

    // Check if user already liked the product
    const alreadyLiked = product.likes.some(like => like.user.toString() === token.user._id.toString());

    if (alreadyLiked) {
      // If already liked, remove the like
      product.likes = product.likes.filter(like => like.user.toString() !== token.user._id.toString());
    }

    const updatedProduct = await product.save(); // Save updated product
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "Server error. Please try again." }, { status: 500 });
  }
}

