"use client";
import { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [percentOff, setPercentOff] = useState(0);
  const [validCoupon, setValidCoupon] = useState(false);

  // Load cart items từ local storage khi component mount
  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    console.log("Stored cart items from localStorage:", storedCartItems); // Log kiểm tra dữ liệu
    if (storedCartItems && storedCartItems !== "undefined") {
      try {
        const parsedItems = JSON.parse(storedCartItems);
        console.log("Parsed cart items:", parsedItems); // Log kiểm tra sau khi parse
        if (Array.isArray(parsedItems)) {
          setCartItems(parsedItems);
        }
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error);
      }
    }
  }, []);



  // Lưu cart items vào local storage khi cartItems thay đổi
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log("Saving cart items to localStorage:", cartItems); // Log trước khi lưu
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } else {
      console.log("Cart is empty, not saving.");
    }
  }, [cartItems]);

  // Thêm vào giỏ hàng
  const addToCart = (product, quantity) => {
    console.log("Adding product to cart:", product, quantity);
    const existingProduct = cartItems.find((item) => item._id === product._id);

    if (existingProduct) {
      const updatedCartItems = cartItems.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      console.log(" cart items:", updatedCartItems);
      setCartItems(updatedCartItems);
    } else {
      const newCartItems = [...cartItems, { ...product, quantity }];
      console.log("New cart items:", newCartItems);
      setCartItems(newCartItems);
    }
  };


  // Xóa khỏi giỏ hàng
  const removeFromCart = (productId) => {
    const updatedCartItems = cartItems.filter((item) => item._id !== productId);
    setCartItems(updatedCartItems);

    // Cập nhật local storage
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  // Cập nhật số lượng
  const updateQuantity = (product, quantity) => {
    const updatedItems = cartItems.map((item) =>
      item._id === product._id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
  };

  // Áp dụng mã giảm giá
  const handleCoupon = async (coupon) => {
    try {
      const response = await fetch(`${process.env.API}/stripe/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ couponCode: coupon }),
      });

      if (!response.ok) {
        setPercentOff(0);
        setValidCoupon(false);
        toast.error("Invalid coupon code");
        return;
      }

      const data = await response.json();
      setPercentOff(data.percent_off);
      setValidCoupon(true);
      toast.success(`${data?.name} applied successfully`);
    } catch (err) {
      console.error(err);
      setPercentOff(0);
      setValidCoupon(false);
      toast.error("CouponCode ");
    }
  };

  // Xóa giỏ hàng
  const clearCart = () => {
    localStorage.removeItem("cartItems");
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        couponCode,
        setCouponCode,
        handleCoupon,
        percentOff,
        validCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
