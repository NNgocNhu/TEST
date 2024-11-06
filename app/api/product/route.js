
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import Product from "@/models/product";
import queryString from "query-string";

export async function GET(req) {
  await dbConnect();

  const searchParams = queryString.parseUrl(req.url).query;

  const { page, category, tag, brand, ratings, minPrice, maxPrice } =
    searchParams || {};
  const pageSize = 6;

  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (brand) {
    filter.brand = brand;
  }

  if (minPrice && maxPrice) {
    filter.price = {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    };
  }

  try {
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    // Find products based on the filter
    const allProducts = await Product.find(filter)
      .populate("category", "name")
      .populate("tags", "name")
      .sort({ createdAt: -1 });

    console.log("allProducts.length ************* => ", allProducts.length);

    // Calculate the average rating for each product
    const calculateAverageRating = (ratings) => {
      if (ratings.length === 0) return 0;
      let totalRating = 0;
      ratings.forEach((rating) => {
        totalRating += rating.rating;
      });
      return totalRating / ratings.length;
    };

    const productsWithAvgRatings = allProducts.map((product) => ({
      ...product.toObject(),
      avgRating: calculateAverageRating(product.ratings),
    }));

    console.log(
      "products with avg rating ************* => ",
      productsWithAvgRatings.length
    );

    // Filter products based on specified rating value
    const filteredProducts = productsWithAvgRatings.filter((product) => {
      if (!ratings) {
        return true; // No rating filter applied
      }

      const targetRating = Number(ratings);
      const difference = product.avgRating - targetRating;
      return difference >= -0.5 && difference <= 0.5;
    });

    const totalFilteredProducts = filteredProducts.length;
    console.log("total filtered products length => ", totalFilteredProducts);

    // Apply pagination to filtered products
    const paginatedProducts = filteredProducts.slice(skip, skip + pageSize);
    // console.log("paginated products => ", paginatedProducts);

    return NextResponse.json(
      {
        products: paginatedProducts,
        currentPage,
        totalPages: Math.ceil(totalFilteredProducts / pageSize),
      },
      { status: 200 }
    );
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
