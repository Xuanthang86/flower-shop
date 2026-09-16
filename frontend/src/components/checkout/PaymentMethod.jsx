const PaymentMethod = ({ value, onChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Phương thức thanh toán
      </h3>

      <div className="space-y-3">
        {/* COD */}
        <label
          className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
            value === "cod"
              ? "border-pink-500 bg-pink-50"
              : "border-gray-200 hover:border-pink-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={value === "cod"}
            onChange={onChange}
            className="mt-1"
          />

          <div>
            <p className="font-medium text-gray-800">
              Thanh toán khi nhận hàng
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Thanh toán trực tiếp khi nhận hoa.
            </p>
          </div>
        </label>

        {/* BANK TRANSFER - CHƯA HỖ TRỢ */}
        <label className="flex items-start gap-3 border rounded-xl p-4 bg-gray-50 border-gray-200 cursor-not-allowed opacity-70">
          <input
            type="radio"
            name="paymentMethod"
            value="bank_transfer"
            checked={value === "bank_transfer"}
            onChange={onChange}
            disabled
            className="mt-1"
          />

          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800">
                Chuyển khoản ngân hàng
              </p>

              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                Chưa hỗ trợ
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Phương thức thanh toán này chưa được triển khai.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
