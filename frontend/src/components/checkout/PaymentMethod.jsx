const PaymentMethod = ({ value, onChange }) => {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Phương thức thanh toán
      </h3>

      <div className="space-y-3">
        {/* COD */}
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
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

            <p className="mt-1 text-sm text-gray-500">
              Thanh toán trực tiếp khi nhận hoa.
            </p>
          </div>
        </label>

        {/* BANK TRANSFER */}
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
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

            <p className="mt-1 text-sm text-gray-500">
              Xem thông tin chuyển khoản, hoàn tất thanh toán rồi xác nhận trước
              khi đặt hàng.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
