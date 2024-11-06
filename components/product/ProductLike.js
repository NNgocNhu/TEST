// "use client";
// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
// import { useRouter, usePathname } from "next/navigation";
// export default function ProductLike({ product }) {
//   const { data, status } = useSession();
//   // console.log("product", product);
//   const [likes, setLikes] = useState(product?.likes);
//   const router = useRouter();
//   const pathname = usePathname();
//   const isLiked = likes?.includes(data?.user?._id);
//   const handleLike = async () => {
//     if (status !== "authenticated") {
//       toast.error("Please login to like");
//       router.push(
//         `/login?callbackUrl=${process.env.API.replace("/api", "")}${pathname}`
//       );
//       return;
//     }
//     try {
//       if (isLiked) {
//         const answer = window.confirm("You liked it. Want to unlike?");
//         if (answer) {
//           handleUnlike();
//         }
//       } else {
//         const options = {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             productId: product._id,
//           }),
//         };
//         const response = await fetch(
//           `${process.env.API}/user/product/like`,
//           options
//         );
//         if (!response.ok) {
//           throw new Error(
//             `Failed to like: ${response.status} ${response.statusText}`
//           );
//         }
//         const data = await response.json();
//         // console.log("product liked response => ", data);
//         setLikes(data.likes);
//         toast.success("Product liked");
//         router.refresh(); // only works in server components
//       }
//     } catch (err) {
//       console.log(err);
//       toast.error("Error liking product");
//     }
//   };

//   const handleUnlike = async () => {
//     try {
//       const options = {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           productId: product._id,
//         }),
//       };
//       const response = await fetch(
//         `${process.env.API}/user/product/unlike`,
//         options
//       );
//       if (!response.ok) {
//         throw new Error(`Failed to unlike`);
//       }
//       const data = await response.json();
//       // console.log("product unliked response => ", data);
//       setLikes(data.likes);
//       toast.success("Product unliked");
//       router.refresh();
//     } catch (err) {
//       console.log(err);
//       toast.error("Error unliking product");
//     }
//   };
//   // 🖤

//   return (
//     <small className="text-muted pointer">
//       {!likes?.length ? (
//         <span onClick={handleLike}>❤️ Be the first person to like</span>
//       ) : (
//         <span onClick={handleLike}>❤️ {likes?.length} people liked</span>
//       )}
//     </small>
//   );
// }

// "use client";
// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
// import { useRouter, usePathname } from "next/navigation";

// export default function ProductLike({ product }) {
//   const { data, status } = useSession();
//   const [likes, setLikes] = useState(product?.likes || []); // Initialize likes as an empty array if not present

//   const router = useRouter();
//   const pathname = usePathname();

//   const userId = data?.user?._id; // Extract user ID for clarity
//   const isLiked = likes.some(like => like.user.toString() === userId); // Check if the product is liked by the current user

//   const handleLike = async () => {
//     // Check if user is authenticated
//     if (status !== "authenticated") {
//       toast.error("Please login to like");
//       router.push(`/login?callbackUrl=${process.env.API.replace("/api", "")}${pathname}`);
//       return;
//     }

//     try {
//       const method = isLiked ? "POST" : "POST"; // Use POST for both liking and unliking as per your API
//       const actionMessage = isLiked ? "unliked" : "liked"; // Set action message

//       // Make the API call to like/unlike the product
//       const response = await fetch(`${process.env.API}/user/product/like`, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           productId: product._id,
//         }),
//       });

//       // Check for HTTP errors
//       if (!response.ok) {
//         const errorResponse = await response.json(); // Get error response for debugging
//         console.error("Error response:", errorResponse); // Log error response for debugging
//         throw new Error(`Error occurred: ${errorResponse.message || 'Try again.'}`);
//       }

//       const responseData = await response.json(); // Get the updated likes from the response
//       setLikes(responseData.likes || []); // Update likes state

//       // Show the appropriate success message
//       toast.success(`Product ${actionMessage}`);
//       router.refresh(); // Refresh to update the UI
//     } catch (err) {
//       console.error("Error liking product:", err); // Log the error for debugging
//       toast.error("Error liking product. Please try again."); // Show error message to user
//     }
//   };

//   return (
//     <small className="text-muted pointer">
//       {!likes.length ? (
//         <span onClick={handleLike}>❤️ Be the first person to like</span>
//       ) : (
//         <span onClick={handleLike}>❤️ {likes.length} people liked</span>
//       )}
//     </small>
//   );
// }
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

export default function ProductLike({ product }) {
  const { data, status } = useSession();
  const [likes, setLikes] = useState(product?.likes || []);

  const router = useRouter();
  const pathname = usePathname();

  const userId = data?.user?._id;
  const isLiked = likes.some(like => like.user.toString() === userId);

  const handleLike = async () => {
    if (status !== "authenticated") {
      toast.error("Please login to like");
      router.push(`/login?callbackUrl=${process.env.API.replace("/api", "")}${pathname}`);
      return;
    }

    try {
      const endpoint = isLiked ? "/user/product/unlike" : "/user/product/like";
      const actionMessage = isLiked ? "unliked" : "liked";

      const response = await fetch(`${process.env.API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        throw new Error(`Error occurred: ${errorResponse.message || 'Try again.'}`);
      }

      const responseData = await response.json();
      setLikes(responseData.likes || []);
      toast.success(`Product ${actionMessage}`);
      router.refresh();
    } catch (err) {
      console.error("Error liking/unliking product:", err);
      toast.error("Error liking/unliking product. Please try again.");
    }
  };

  return (
    <small className="text-muted pointer">
      {!likes.length ? (
        <span onClick={handleLike}>❤️ Be the first person to like</span>
      ) : (
        <span onClick={handleLike}>❤️ {likes.length} people liked</span>
      )}
    </small>
  );
}
