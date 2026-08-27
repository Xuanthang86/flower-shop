// const OrderAddress = ({ address }) => {
//   if (!address) {
//     return <div className="text-gray-500">Chưa có thông tin địa chỉ.</div>;
//   }

//   /*
//    * Hỗ trợ cả dữ liệu mới và một số dữ liệu cũ.
//    */
//   const provinceName = address.provinceName || address.province || "";

//   const wardName = address.wardName || address.ward || "";

//   const houseNumber = address.houseNumber || "";

//   const street = address.street || address.streetName || "";

//   const fullAddressParts = [houseNumber, street, wardName, provinceName].filter(
//     Boolean
//   );

//   if (fullAddressParts.length === 0) {
//     return <div className="text-gray-500">Chưa có thông tin địa chỉ.</div>;
//   }

//   return (
//     <div className="space-y-2 text-gray-700">
//       {houseNumber && (
//         <div>
//           <span className="font-medium text-gray-600">Số nhà:</span>{" "}
//           {houseNumber}
//         </div>
//       )}

//       {street && (
//         <div>
//           <span className="font-medium text-gray-600">Đường:</span> {street}
//         </div>
//       )}

//       {wardName && (
//         <div>
//           <span className="font-medium text-gray-600">Phường/Xã:</span>{" "}
//           {wardName}
//         </div>
//       )}

//       {provinceName && (
//         <div>
//           <span className="font-medium text-gray-600">Tỉnh/Thành phố:</span>{" "}
//           {provinceName}
//         </div>
//       )}

//       <div className="pt-2 text-sm text-gray-500">
//         <span className="font-medium">Địa chỉ đầy đủ:</span>{" "}
//         {fullAddressParts.join(", ")}
//       </div>
//     </div>
//   );
// };

// export default OrderAddress;

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
