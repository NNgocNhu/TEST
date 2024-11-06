import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import Category from "@/models/category";
import Tag from "@/models/tag";
import User from "@/models/user";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const ratingSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 200,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxlength: 160,
      minLength: 1,
      text: true, //search
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000000,
      minLength: 1,
      text: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 12,
      minLength: 1,
      validate: {
        validator: function (value) {
          return value !== 0;
        },
        message: "Price must be greater than 0",
      },
    },
    previousPrice: Number,
    // color: String,
    // colors: [String],
    // brand: String,
    // stock: Number,
    colors: {
      type: [String],
      required: true,
      validate: {
        validator: function (colors) {
          // Đảm bảo ít nhất một màu được nhập và tất cả các màu đều bắt đầu bằng chữ cái
          // return colors.length > 0 && colors.every(color => /^[A-Za-z]/.test(color));
          return colors.length > 0 ;
        },
        message: "Each color must begin with a letter!",
      },
    },
    brand: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= 1;
        },
        message: "Stock must be greater than 0",
      },
    },
    shipping: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    images: [
      {
        secure_url: {
          type: String,
          default: "",
        },
        public_id: {
          type: String,
          default: "",
        },
      },
    ],
    sold: {
      type: Number,
      default: 0,
    },
    likes: [likeSchema],
    ratings: [ratingSchema],
  },
  { timestamps: true }
);

productSchema.plugin(uniqueValidator, { message: " already exists" });
export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
