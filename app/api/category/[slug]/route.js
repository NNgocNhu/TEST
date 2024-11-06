import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Category from "@/models/category";
import Product from "@/models/product";

export async function GET(req, context) {
  await dbConnect();

  const slug = context.params.slug;
  console.log("Slug from context:", slug);

  if (!slug) {
    console.error("Slug is undefined!");
    return NextResponse.json(
      { error: "Invalid slug" },
      { status: 400 }
    );
  }

  try {
    const category = await Category.findOne({ slug });

    if (!category) {
      console.error(`Category not found for slug : ${slug}`);
      return NextResponse.json(
        { error: `Category not found for slug : ${slug}` },
        { status: 404 }
      );
    }

    const products = await Product.find({ category: category._id })
      .limit(5)
      .sort({ createdAt: -1 });

    return NextResponse.json({ category, products });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
