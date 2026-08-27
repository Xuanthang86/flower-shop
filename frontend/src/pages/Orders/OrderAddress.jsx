const OrderAddress = ({ address }) => {
  const safe = address || {};

  const provinceName =
    safe.provinceName || safe.province || safe.province_name || "";

  const wardName =
    safe.wardName || safe.ward || safe.ward_name || safe.communeName || "";

  const houseNumber = safe.houseNumber || safe.house_number || safe.house || "";

  const street = safe.street || safe.streetName || safe.street_name || "";

  const parts = [houseNumber, street, wardName, provinceName].filter(Boolean);

  if (!parts.length) {
    return <div className="text-gray-500">Chưa có thông tin địa chỉ.</div>;
  }

  return (
    <div className="space-y-3 text-gray-700">
      <div>
        <span className="font-medium text-gray-600">Số nhà:</span>{" "}
        {houseNumber || "—"}
      </div>

      <div>
        <span className="font-medium text-gray-600">Đường:</span>{" "}
        {street || "—"}
      </div>

      <div>
        <span className="font-medium text-gray-600">Phường/Xã:</span>{" "}
        {wardName || "—"}
      </div>

      <div>
        <span className="font-medium text-gray-600">Tỉnh/Thành phố:</span>{" "}
        {provinceName || "—"}
      </div>

      <div className="pt-3 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-600">
          Địa chỉ đầy đủ:
        </span>

        <p className="font-semibold text-gray-900 mt-1">{parts.join(", ")}</p>
      </div>
    </div>
  );
};

export default OrderAddress;
