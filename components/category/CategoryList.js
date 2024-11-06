"use client";
import { useEffect } from "react";
import { useCategory } from "@/context/category";
export default function CategoryList() {
  const { fetchCategories, categories, setUpdatingCategory } = useCategory();
  useEffect(() => {
    fetchCategories();
  }, [])
  return <div className="my-5">
    <div className="row">
      <div className="col">
        {categories?.map((c) => (
          <button key={c._id} className="btn" onClick={() => setUpdatingCategory(c)}>{c.name}</button>
        ))}
      </div>
    </div>
  </div >
}