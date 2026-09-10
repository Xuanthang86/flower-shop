import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      <Categories />

      <FeaturedProducts />
    </div>
  );
};

export default HomePage;
