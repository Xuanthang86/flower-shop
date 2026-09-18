const PaymentMethod = ({ value, onChange, bankTransferEnabled = true }) => {
  const bankTransferDisabled = bankTransferEnabled === false;

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Phương thức thanh toán
      </h3>

      <div className="space-y-3">
        {/* COD */}
        <label
          className={`flex items-start gap-3 rounded-xl border p-4 transition ${
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
          aria-disabled={bankTransferDisabled}
          className={`flex items-start gap-3 rounded-xl border p-4 transition ${
            bankTransferDisabled
              ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-50"
              : value === "bank_transfer"
                ? "cursor-pointer border-pink-500 bg-pink-50"
                : "cursor-pointer border-gray-200 hover:border-pink-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="bank_transfer"
            checked={value === "bank_transfer"}
            onChange={onChange}
            disabled={bankTransferDisabled}
            className="mt-1 disabled:cursor-not-allowed"
          />

          <div>
            <p
              className={`font-medium ${
                bankTransferDisabled ? "text-gray-500" : "text-gray-800"
              }`}
            >
              Chuyển khoản ngân hàng
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {bankTransferDisabled
                ? "Shop hiện chưa bật thanh toán chuyển khoản."
                : "Xem thông tin chuyển khoản, hoàn tất thanh toán rồi xác nhận trước khi đặt hàng."}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
