const OrderAddress = ({ address }) => {
  const safe = address || {};

  const provinceName = safe.provinceName || safe.province || safe.province_name || "";
  const wardName = safe.wardName || safe.ward || safe.ward_name || safe.communeName || "";
  const houseNumber = safe.houseNumber || safe.house_number || safe.house || "";
  const street = safe.street || safe.streetName || safe.street_name || "";

  const parts = [houseNumber, street, wardName, provinceName].filter(Boolean);

  if (!parts.length) {
    return <div className="text-gray-500">Chưa có thông tin địa chỉ.</div>;
  }

  return (
    <div className="space-y-2 text-gray-700">
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
      <div className="pt-2 text-sm text-gray-500">
        <span className="font-medium">Địa chỉ đầy đủ:</span>{" "}
        {parts.join(", ")}
      </div>
    </div>
  );
};

export default OrderAddress;
