const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">
            Tại sao chọn chúng tôi
          </h2>
          <p className="mt-3 text-gray-500">
            Cam kết chất lượng và dịch vụ hàng đầu.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-10">
          <div className="text-center border p-8 rounded-xl bg-gray-50">
            [Icon 1]
            <h4 className="font-semibold mt-4">Hoa tươi 100%</h4>
          </div>
          <div className="text-center border p-8 rounded-xl bg-gray-50">
            [Icon 2]
            <h4 className="font-semibold mt-4">Giao hàng nhanh</h4>
          </div>
          <div className="text-center border p-8 rounded-xl bg-gray-50">
            [Icon 3]
            <h4 className="font-semibold mt-4">Thiết kế tinh tế</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
