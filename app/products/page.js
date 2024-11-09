import ProductList from "@/components/product/ProductList";
import Pagination from "@/components/Pagination";
import ProductFilter from "@/components/product/ProductFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ShineTech",
  description: "Find the latest in electronics and more",
};

async function getProducts(searchParams) {
  const query = new URLSearchParams();

  query.set("page", searchParams?.page || 1);

  if (searchParams?.minPrice) query.set("minPrice", searchParams.minPrice);
  if (searchParams?.maxPrice) query.set("maxPrice", searchParams.maxPrice);
  if (searchParams?.ratings) query.set("ratings", searchParams.ratings);
  if (searchParams?.category) query.set("category", searchParams.category);
  if (searchParams?.tag) query.set("tag", searchParams.tag);
  if (searchParams?.brand) query.set("brand", searchParams.brand);

  try {
    const response = await fetch(`${process.env.API}/product?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.products)) {
      throw new Error("No products returned.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { products: [], currentPage: 1, totalPages: 1 };
  }
}

export default async function Prducts({ searchParams }) {
  const data = await getProducts(searchParams);

  return (
    <main>
      <div className="container-fluid">
        <div className="d-flex">
          <div className="col-lg-3">
            <ProductFilter searchParams={searchParams} />
          </div>

          <div className="col-lg-9">
            <p className="text-center lead fw-bold">Latest Products</p>
            <ProductList products={data?.products} />
          </div>
        </div>

        <Pagination
          currentPage={data?.currentPage}
          totalPages={data?.totalPages}
          pathname="/products"
          searchParams={searchParams}
        />
      </div>
    </main>
  );
}
