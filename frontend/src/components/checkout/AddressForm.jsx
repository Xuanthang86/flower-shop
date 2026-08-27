import { useEffect, useMemo, useState } from "react";
import locations from "@/data/locations/vietnamLocations.json";

const normalizeText = (text = "") => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const getDisplayName = (name = "") => {
  return name.replace(/^Thành phố\s+/i, "").replace(/^Tỉnh\s+/i, "");
};

const EMPTY_ADDRESS = {
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
  houseNumber: "",
  street: "",
};

const AddressForm = ({ value = {}, onChange }) => {
  const address = {
    ...EMPTY_ADDRESS,
    ...value,
  };

  const [provinceOpen, setProvinceOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);

  const [provinceSearch, setProvinceSearch] = useState(
    address.provinceName || ""
  );

  const [wardSearch, setWardSearch] = useState(address.wardName || "");

  /*
   * Đồng bộ input khi dữ liệu address từ component cha thay đổi.
   */
  useEffect(() => {
    setProvinceSearch(address.provinceName || "");
  }, [address.provinceName]);

  useEffect(() => {
    setWardSearch(address.wardName || "");
  }, [address.wardName]);

  /*
   * TỈNH / THÀNH PHỐ ĐANG CHỌN
   */
  const selectedProvince = useMemo(() => {
    return locations.find(
      (province) => String(province.code) === String(address.provinceCode)
    );
  }, [address.provinceCode]);

  /*
   * DANH SÁCH PHƯỜNG / XÃ
   */
  const wards = useMemo(() => {
    if (!selectedProvince) {
      return [];
    }

    return selectedProvince.wards || [];
  }, [selectedProvince]);

  /*
   * LỌC TỈNH / THÀNH PHỐ
   */
  const filteredProvinces = useMemo(() => {
    const keyword = normalizeText(provinceSearch);

    if (!keyword) {
      return locations;
    }

    return locations.filter((province) => {
      const fullName = normalizeText(province.name);
      const displayName = normalizeText(getDisplayName(province.name));

      return fullName.includes(keyword) || displayName.includes(keyword);
    });
  }, [provinceSearch]);

  /*
   * LỌC PHƯỜNG / XÃ
   */
  const filteredWards = useMemo(() => {
    const keyword = normalizeText(wardSearch);

    if (!keyword) {
      return wards;
    }

    return wards.filter((ward) => normalizeText(ward.name).includes(keyword));
  }, [wards, wardSearch]);

  /*
   * CHỌN TỈNH / THÀNH PHỐ
   */
  const handleProvinceSelect = (province) => {
    const provinceName = getDisplayName(province.name);

    setProvinceSearch(provinceName);
    setWardSearch("");

    setProvinceOpen(false);
    setWardOpen(false);

    onChange({
      ...EMPTY_ADDRESS,

      provinceCode: String(province.code),
      provinceName,

      wardCode: "",
      wardName: "",

      houseNumber: address.houseNumber || "",
      street: address.street || "",
    });
  };

  /*
   * CHỌN PHƯỜNG / XÃ
   */
  const handleWardSelect = (ward) => {
    setWardSearch(ward.name);
    setWardOpen(false);

    onChange({
      ...address,

      wardCode: String(ward.code),
      wardName: ward.name,
    });
  };

  /*
   * NHẬP TỈNH / THÀNH PHỐ
   */
  const handleProvinceSearch = (event) => {
    const keyword = event.target.value;

    setProvinceSearch(keyword);
    setProvinceOpen(true);

    if (!keyword.trim()) {
      setWardSearch("");

      onChange({
        ...address,

        provinceCode: "",
        provinceName: "",
        wardCode: "",
        wardName: "",
      });
    }
  };

  /*
   * NHẬP PHƯỜNG / XÃ
   */
  const handleWardSearch = (event) => {
    const keyword = event.target.value;

    setWardSearch(keyword);
    setWardOpen(true);

    if (!keyword.trim()) {
      onChange({
        ...address,

        wardCode: "",
        wardName: "",
      });
    }
  };

  /*
   * SỐ NHÀ
   */
  const handleHouseNumberChange = (event) => {
    onChange({
      ...address,
      houseNumber: event.target.value,
    });
  };

  /*
   * TÊN ĐƯỜNG
   */
  const handleStreetChange = (event) => {
    onChange({
      ...address,
      street: event.target.value,
    });
  };

  return (
    <div className="space-y-5">
      {/* TỈNH / THÀNH PHỐ */}
      <div className="relative">
        <label
          htmlFor="provinceSearch"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tỉnh/Thành phố *
        </label>

        <input
          id="provinceSearch"
          type="text"
          value={provinceSearch}
          onChange={handleProvinceSearch}
          onFocus={() => setProvinceOpen(true)}
          placeholder="Nhập tên tỉnh/thành phố..."
          autoComplete="off"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />

        {provinceOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredProvinces.length > 0 ? (
              filteredProvinces.map((province) => (
                <button
                  key={province.code}
                  type="button"
                  onClick={() => handleProvinceSelect(province)}
                  className="w-full text-left px-4 py-3 hover:bg-pink-50 transition border-b border-gray-100 last:border-b-0"
                >
                  {getDisplayName(province.name)}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Không tìm thấy tỉnh/thành phố phù hợp.
              </div>
            )}
          </div>
        )}
      </div>

      {/* PHƯỜNG / XÃ */}
      <div className="relative">
        <label
          htmlFor="wardSearch"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Phường/Xã *
        </label>

        <input
          id="wardSearch"
          type="text"
          value={wardSearch}
          onChange={handleWardSearch}
          onFocus={() => {
            if (selectedProvince) {
              setWardOpen(true);
            }
          }}
          disabled={!selectedProvince}
          autoComplete="off"
          placeholder={
            selectedProvince
              ? "Nhập tên phường/xã..."
              : "Vui lòng chọn tỉnh/thành phố trước"
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none disabled:bg-gray-100 disabled:text-gray-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />

        {wardOpen && selectedProvince && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredWards.length > 0 ? (
              filteredWards.map((ward) => (
                <button
                  key={ward.code}
                  type="button"
                  onClick={() => handleWardSelect(ward)}
                  className="w-full text-left px-4 py-3 hover:bg-pink-50 transition border-b border-gray-100 last:border-b-0"
                >
                  {ward.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Không tìm thấy phường/xã phù hợp.
              </div>
            )}
          </div>
        )}
      </div>

      {/* SỐ NHÀ */}
      <div>
        <label
          htmlFor="houseNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Số nhà *
        </label>

        <input
          id="houseNumber"
          name="houseNumber"
          type="text"
          value={address.houseNumber || ""}
          onChange={handleHouseNumberChange}
          placeholder="Ví dụ: 123"
          autoComplete="street-address"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />
      </div>

      {/* TÊN ĐƯỜNG */}
      <div>
        <label
          htmlFor="street"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tên đường *
        </label>

        <input
          id="street"
          name="street"
          type="text"
          value={address.street || ""}
          onChange={handleStreetChange}
          placeholder="Ví dụ: Nguyễn Văn Linh"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />
      </div>
    </div>
  );
};

export default AddressForm;
