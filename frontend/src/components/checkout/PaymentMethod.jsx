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

        {/* BANK TRANSFER */}
        <label
          className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
            value === "bank_transfer"
              ? "border-pink-500 bg-pink-50"
              : "border-gray-200 hover:border-pink-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="bank_transfer"
            checked={value === "bank_transfer"}
            onChange={onChange}
            className="mt-1"
          />

          <div>
            <p className="font-medium text-gray-800">Chuyển khoản ngân hàng</p>

            <p className="text-sm text-gray-500 mt-1">
              Chuyển khoản theo thông tin thanh toán được cung cấp sau khi đặt
              hàng.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
