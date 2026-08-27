const Newsletter = () => {
  return (
    <section className="py-20 bg-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold">Đăng ký nhận bản tin</h2>
        <p className="mt-4 text-pink-100">
          Cập nhật xu hướng hoa mới nhất và nhận ưu đãi độc quyền.
        </p>
        <form className="mt-10 max-w-xl mx-auto flex gap-4">
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            className="flex-1 px-5 py-3 rounded-lg text-gray-900"
          />
          <button
            type="submit"
            className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-100 transition"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
