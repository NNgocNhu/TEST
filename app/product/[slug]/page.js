// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import ProductImage from "@/components/product/ProductImage";
// import ProductLike from "@/components/product/ProductLike";
// import ProductRating from "@/components/product/ProductRating";
// // import UserReviews from "@/components/product/UserReviews";
// import AddToCart from "@/components/product/AddToCart";
// import CouponCode from "@/components/product/CouponCode";
// // import { stockStatus } from "@/utils/helpers";
// import ProductCard from "@/components/product/ProductCard";

// dayjs.extend(relativeTime);

// export async function generateMetadata({ params }) {
//   const product = await getProduct(params?.slug);
//   return {
//     title: product?.title,
//     description: product?.description?.substr(0, 160),
//   };
// }

// async function getProduct(slug) {
//   try {
//     const response = await fetch(`${process.env.API}/product/${slug}`, {
//       method: "GET",
//       next: { revalidate: 1 },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch products`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }

// export default async function ProductViewPage({ params }) {
//   const { product, relatedProducts } = await getProduct(params?.slug);

//   return (
//     <div className="container mb-5">
//       <div className="row">
//         <div className="col-lg-10 offset-lg-1 mb-4">
//           <div className="card p-3">
//             <div className="bg-warning text-center">
//               {/* {stockStatus(product?.stock)} */}
//             </div>
//             <div className="card-title mt-3">
//               <h3
//                 className="text-center"
//                 style={{ fontSize: 38, fontWeight: 700 }}
//               >
//                 {product?.title}
//               </h3>
//             </div>
//             <CouponCode product={product} />
//             {/* images and preview modal */}
//             <ProductImage product={product} />

//             {/* card body */}
//             <div className="card-body m-2">
//               {/* show price based on coupon */}
//               {/* <CouponCode product={product} /> */}

//               <div className="card-text ">
//               <div
//                   dangerouslySetInnerHTML={{
//                     __html: product?.description.replace(/\n/g, "<br />"),
//                   }}
//                 />

//               </div>

//               <div className="alert alert-primary mt-4">Brand: {product?.brand}</div>
//             </div>

//             <div className="card-footer d-flex justify-content-between">
//               <small className="text-muted">
//                 Category: {product?.category?.name}
//               </small>
//               <small className="text-muted">
//                 Tags: {product?.tags?.map((tag) => tag?.name).join(" ")}
//               </small>
//             </div>

//             <div className="card-footer d-flex justify-content-between">
//               <ProductLike product={product} />
//               <small className="text-muted">
//                 Added {dayjs(product?.createdAt).fromNow()}
//               </small>
//             </div>

//             <div className="card-footer text-center">
//               <ProductRating product={product} />
//             </div>
//           </div>

//           <div className="my-3">
//             <AddToCart product={product} />
//           </div>
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-lg-10 offset-lg-1">
//           <p className="lead text-center my-5">Other products you may like</p>
//           <div className="row">
//             {relatedProducts?.map((product) => (
//               <div className="col-lg-4" key={product._id}>
//                 <ProductCard product={product} />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-lg-10 offset-lg-1 my-5">
//           {/* <UserReviews reviews={product?.ratings} /> */}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProductImage from "@/components/product/ProductImage";
import ProductLike from "@/components/product/ProductLike";
import ProductRating from "@/components/product/ProductRating";
import AddToCart from "@/components/product/AddToCart";
import CouponCode from "@/components/product/CouponCode";
import ProductCard from "@/components/product/ProductCard";
import { useProduct } from "@/context/product";

dayjs.extend(relativeTime);
// async function getProduct(slug) {
//   try {
//     const response = await fetch(`${process.env.API}/product/${slug}`, {
//       method: "GET",
//       next: { revalidate: 1 },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch products`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }
export default function ProductViewPage({ params }) {
  const { selectedColor, setSelectedColor } = useProduct();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isColorSelected, setIsColorSelected] = useState(false);
  // Fetch product data
  // const { product, relatedProducts, setRelatedProducts} =  getProduct(params?.slug);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.API}/product/${params?.slug}`,
          {
            method: "GET",
            next: { revalidate: 1 },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch product`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data); 
        setProduct(data.product); // Assuming response contains product under 'product'
        setRelatedProducts(data.relatedProducts); // Assuming response contains related products
        console.log("Related Products:", data.relatedProducts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [params.slug]); // Depend on the slug to refetch if it changes

  //color selected
  useEffect(() => {
    setIsColorSelected(!!selectedColor);
  }, [selectedColor]);

  if (!product) {
    return <div>Loading...</div>; // Handle loading state
  }

  return (
    <div className="container mb-5">
      <div className="row">
        <div className="col-lg-10 offset-lg-1 mb-4">
          <div className="card p-3">
            <div className="bg-warning text-center">
              {/* {stockStatus(product?.stock)} */}
            </div>
            <div className="card-title mt-3">
              <h3
                className="text-center"
                style={{ fontSize: 38, fontWeight: 700 }}
              >
                {product?.title}
              </h3>
            </div>
            <CouponCode product={product} />
            {/* images and preview modal */}
            <ProductImage product={product} />

            {/* card body */}
            <div className="card-body m-2">
              <div className="card-text">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product?.description.replace(/\n/g, "<br />"),
                  }}
                />
              </div>
              <div className="alert alert-primary mt-4">
                Brand: {product?.brand}
              </div>
            </div>

            <div className="card-footer d-flex justify-content-between">
              <small className="text-muted">
                Category: {product?.category?.name}
              </small>
              <small className="text-muted">
                Tags: {product?.tags?.map((tag) => tag?.name).join(" ")}
              </small>
            </div>

            <div className="card-footer d-flex justify-content-between">
              <ProductLike product={product} />
              <small className="text-muted">
                Added {dayjs(product?.createdAt).fromNow()}
              </small>
            </div>

            <div className="card-footer text-center">
              <ProductRating product={product} />
            </div>
            <div className="form-group m-3 p-1">
              <label htmlFor="colorSelect" className="form-label fw-bold">
                Select Color
              </label>
              <select
                id="colorSelect"
                className="form-select custom-select"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                <option value="" disabled>
                  Select color
                </option>
                {(product.colors || []).map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="my-3">
            <AddToCart product={product} isColorSelected={isColorSelected} />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-10 offset-lg-1">
          <p className="lead text-center my-5">Other products you may like</p>
          <div className="row">
            <div
              className="d-flex overflow-auto"
              style={{ gap: "1rem", padding: "1rem" }}
            >
              {relatedProducts?.map((relatedProduct) => (
                <div className="col-lg-4" key={relatedProduct._id}>
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
