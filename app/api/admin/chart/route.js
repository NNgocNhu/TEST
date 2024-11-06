import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Category from "@/models/category";
import Tag from "@/models/tag";
import Order from "@/models/order";
import Blog from "@/models/blog";

export async function GET(req, context) {
  await dbConnect();

  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalTags = await Tag.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    // Calculate the total count of all reviews
    const totalReviews = await Product.aggregate([
      {
        $project: {
          totalReviews: { $size: "$ratings" }, // tinh size arr rating
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$totalReviews" }, // Tong cac bai danh gia tren prod
        },
      },
    ]);

    const data = [
      {
        label: "Products",
        url: "/dashboard/admin/products",
        count: totalProducts,
      },
      { label: "Orders", url: "/dashboard/admin/orders", count: totalOrders },
      {
        label: "Categories",
        url: "/dashboard/admin/category",
        count: totalCategories,
      },
      { label: "Tags", url: "/dashboard/admin/tag", count: totalTags },
      { label: "Blogs", url: "/dashboard/admin/blog/list", count: totalBlogs },
      {
        label: "Reviews",
        url: "/dashboard/admin/product/reviews",
        count: totalReviews[0].totalCount,
      },
    ];

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        err: err.message,
      },
      { status: 500 }
    );
  }
}