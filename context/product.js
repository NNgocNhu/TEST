"use client";
import { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Resizer from "react-image-file-resizer";
const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [currentImagePreviewUrl, setCurrentImagePreviewUrl] = useState("");

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState("");

  const [brands, setBrands] = useState([]);

  const [selectedColor, setSelectedColor] = useState("");
  const [colorOptions, setColorOptions] = useState([]);

  
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);

  const router = useRouter();

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const openImagePreviewModal = (url) => {
    setCurrentImagePreviewUrl(url);
    setShowImagePreviewModal(true);
  };

  const closeModal = () => {
    setShowImagePreviewModal(false);
    setShowRatingModal(false);
  };

  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal")) {
      closeModal();
    }
  };

  const uploadImages = (e) => {
    let files = e.target.files;
    let allUploadedFiles = updatingProduct
      ? updatingProduct.images || []
      : product
      ? product.images || []
      : [];
    if (files) {
      const totalImages = allUploadedFiles.length + files.length;
      if (totalImages > 10) {
        alert("You can't upload more than 10 images.");
        return;
      }
      setUploading(true);
      const uploadPromises = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const promise = new Promise((resolve) => {
          Resizer.imageFileResizer(
            file,
            1280,
            720,
            "JPEG",
            100,
            0,
            (uri) => {
              fetch(`${process.env.API}/admin/upload/image`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: uri }),
              })
                .then((response) => response.json())
                .then((data) => {
                  allUploadedFiles.unshift(data);
                  resolve();
                })
                .catch((err) => {
                  console.log("CLOUDINARY UPLOAD ERR", err);
                  resolve();
                });
            },
            "base64"
          );
        });
        uploadPromises.push(promise);
      }
      Promise.all(uploadPromises)
        .then(() => {
          updatingProduct
            ? setUpdatingProduct({
                ...updatingProduct,
                images: allUploadedFiles,
              })
            : setProduct({ ...product, images: allUploadedFiles });
          setUploading(false);
        })
        .catch((error) => {
          console.log("Error uploading images: ", error);
          setUploading(false);
        });
    }
  };

  const deleteImage = (public_id) => {
    setUploading(true);
    fetch(`${process.env.API}/admin/upload/image`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("IMAGE DELETE RES DATA", data);
        const filteredImages = updatingProduct
          ? updatingProduct.images.filter(
              (image) => image.public_id !== public_id
            )
          : product.images.filter((image) => image.public_id !== public_id);
        updatingProduct
          ? setUpdatingProduct({
              ...updatingProduct,
              images: filteredImages,
            })
          : setProduct({ ...product, images: filteredImages });
      })
      .catch((err) => {
        toast.error("Image delete failed");
        console.log("CLOUDINARY DELETE ERR", err);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const createProduct = async () => {
    try {
      const response = await fetch(`${process.env.API}/admin/product`, {
        method: "POST",
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.err);
      } else {
        toast.success(`Product "${data?.title}" created`);
        router.push("/dashboard/admin/product");
        // window.location.reload();
      }
    } catch (err) {
      console.log("err => ", err);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      const response = await fetch(`${process.env.API}/product?page=${page}`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.err);
      } else {
        setProducts(data?.products);
        setCurrentPage(data?.currentPage);
        setTotalPages(data?.totalPages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateProduct = async () => {
    try {
      const response = await fetch(
        `${process.env.API}/admin/product/${updatingProduct?._id}`,
        {
          method: "PUT",
          body: JSON.stringify(updatingProduct),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.err);
      } else {
        toast.success(`Product "${data?.title}" updated`);
        router.back();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteProduct = async () => {
    try {
      const response = await fetch(
        `${process.env.API}/admin/product/${updatingProduct?._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.err);
      } else {
        toast.success(`Product "${data?.title}" deleted`);
        router.back();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${process.env.API}/product/brands`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const brands = await response.json();
      setBrands(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchColorOptions = async (productId) => {
    try {
      const response = await fetch(
        `${process.env.API}/product/${productId}/colors`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setColorOptions(data.colors);
      } else {
        toast.error(data.err);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const selectColor = (color) => {
    setSelectedColor(color);
  };

  const fetchProductSearchResults = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.API}/search/products?productSearchQuery=${productSearchQuery}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok for search results");
      }
      const data = await response.json();
      console.log("search results data => ", data);
      setProductSearchResults(data);
      router.push(`/search/products?productSearchQuery=${productSearchQuery}`);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <ProductContext.Provider
      value={{
        product,
        setProduct,
        products,
        setProducts,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        updatingProduct,
        setUpdatingProduct,
        uploading,
        setUploading,
        uploadImages,
        deleteImage,
        createProduct,
        fetchProducts,
        updateProduct,
        deleteProduct,
        showImagePreviewModal,
        setShowImagePreviewModal,
        currentImagePreviewUrl,
        setCurrentImagePreviewUrl,
        openImagePreviewModal,
        closeModal,
        showRatingModal,
        setShowRatingModal,
        currentRating,
        setCurrentRating,
        comment,
        setComment,
        brands,
        fetchBrands,
        selectedColor,
        setSelectedColor,
        colorOptions,
        fetchColorOptions,
        selectColor,
        productSearchQuery,
        setProductSearchQuery,
        productSearchResults,
        setProductSearchResults,
        fetchProductSearchResults,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
