import Container from "@/components/common/Container";
import { Link } from "react-router-dom";
import heroBouquet from "@/assets/images/hero/hero-bouquet.jpg";

const Hero = () => {
  return (
    <section className="bg-pink-50">
      <Container>
        <div className="grid min-h-[200px] grid-cols-1 items-center gap-6 py-8 lg:grid-cols-2 lg:gap-10 lg:py-7">
          {/* CONTENT */}
          <div className="text-center lg:text-left">
            <p className="font-medium uppercase tracking-wider text-pink-600">
              Flower Shop
            </p>

            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Gửi yêu thương qua{" "}
              <span className="text-pink-600">từng bó hoa</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 lg:mx-0">
              Hàng trăm mẫu hoa tươi được thiết kế bởi florist chuyên nghiệp,
              giao nhanh trong ngày.
            </p>

            <div className="mt-5 flex justify-center gap-3 lg:justify-start">
              <Link
                to="/products"
                className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-700"
              >
                Mua ngay
              </Link>

              <Link
                to="/products"
                className="rounded-lg border border-pink-600 px-5 py-2.5 text-sm font-medium text-pink-600 transition hover:bg-pink-100"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center lg:justify-end">
            <div className="h-52 w-52 overflow-hidden rounded-full shadow-xl md:h-64 md:w-64">
              <img
                src={heroBouquet}
                alt="Bó hoa tươi Flower Shop"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
