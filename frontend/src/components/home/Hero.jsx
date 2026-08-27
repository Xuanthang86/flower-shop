import Container from "@/components/common/Container";
import { Link } from "react-router-dom";
import heroBouquet from "@/assets/images/hero/hero-bouquet.jpg";

const Hero = () => {
  return (
    <section className="bg-pink-50">
      <Container>
        <div className="min-h-[600px] grid grid-cols-1 lg:grid-cols-2 items-center gap-12 py-16">
          {/* Cột trái: Nội dung */}
          <div className="text-center lg:text-left">
            <p className="text-pink-600 font-medium uppercase tracking-wider">
              Flower Shop
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-4">
              Gửi yêu thương qua{" "}
              <span className="text-pink-600">từng bó hoa</span>
            </h1>

            <p className="text-gray-600 mt-6 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Hàng trăm mẫu hoa tươi được thiết kế bởi florist chuyên nghiệp,
              giao nhanh trong ngày.
            </p>

            <div className="mt-8 flex gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition duration-300"
              >
                Mua ngay
              </Link>

              <Link
                to="/products"
                className="border border-pink-600 text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-100 transition duration-300"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </div>

          {/* Cột phải: Ảnh hoa */}
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="w-64 h-64 md:w-[400px] md:h-[400px] rounded-full overflow-hidden shadow-xl">
              <img
                src={heroBouquet}
                alt="Bó hoa tươi Flower Shop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
