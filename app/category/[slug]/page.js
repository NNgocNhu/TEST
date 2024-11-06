import ProductList from "@/components/product/ProductList";
import TagsList from "@/components/tag/TagList";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = params; // Lấy slug từ params

  console.log("Params:", params); // Log params để kiểm tra

  const category = await getCategory(slug);
  return {
    title: category?.name,
    description: `Best selling products on category ${category?.name}`,
  };
}

async function getCategory(slug) {
  console.log('Fetching category with slug:', slug);
  const apiUrl = `${process.env.API}/category/${slug}`;
  console.log("Fetching category from:", apiUrl); // Log apiUrl

  try {
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // console.log('Fetched category data:', data);
    return data; 
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export default async function CategoryViewPage({ params }) {
  const slug = params?.slug;

  if (!slug) {
    console.error("Slug is not found!");
    return <p>Invalid category slug!</p>;
  }

  const { category, products } = await getCategory(slug) || {};

  if (!category) {
    return <p>Category not found!</p>;
  }

  return (
    <main>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 mt-5">
            <div className="btn btn-danger btn-raised border-20 col p-4 mb-3">
              {category?.name} 
              <div className="mt-4">
                <TagsList category={category} />
              </div>
            </div>
          </div>
          <div className="col-lg-9">
            <p className="text-center lead fw-bold">
              Products in category "{category?.name}"
            </p>
            <ProductList products={products} />
          </div>
        </div>
      </div>
    </main>
  );
}
