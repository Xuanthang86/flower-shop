import { useEffect, useMemo, useState } from "react";

import {
  FiCheckCircle,
  FiEdit2,
  FiPlus,
  FiSave,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useNotification } from "@/context/NotificationProvider";

import {
  COUPON_TYPES,
  deleteCoupon,
  getCouponUsage,
  normalizeCoupon,
  readCoupons,
  saveCoupon,
  toggleCouponActive,
} from "@/services/coupon";

import { PRODUCT_CATEGORIES } from "@/data/products";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const emptyForm = {
  id: "",
  code: "",
  name: "",
  type: COUPON_TYPES.PERCENTAGE,
  value: "",
  minimumOrder: "",
  maximumDiscount: "",
  startDate: "",
  endDate: "",
  active: true,
  usageLimit: "",
  perUserLimit: "",
  categoryRestriction: [],
  productRestriction: "",
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDate = (value) => {
  if (!value) {
    return "Không giới hạn";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không hợp lệ";
  }

  return date.toLocaleString("vi-VN");
};

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState(() => readCoupons());

  const [form, setForm] = useState(emptyForm);

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    document.title = "Quản lý khuyến mãi | Flower Shop";
  }, []);

  useEffect(() => {
    const refresh = () => {
      setCoupons(readCoupons());
    };

    window.addEventListener("flower-shop-coupons-updated", refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("flower-shop-coupons-updated", refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const categories = useMemo(
    () => (Array.isArray(PRODUCT_CATEGORIES) ? PRODUCT_CATEGORIES : []),
    []
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCategoryToggle = (slug) => {
    setForm((current) => {
      const currentValues = current.categoryRestriction || [];

      const nextValues = currentValues.includes(slug)
        ? currentValues.filter((item) => item !== slug)
        : [...currentValues, slug];

      return {
        ...current,
        categoryRestriction: nextValues,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      const nextCoupon = normalizeCoupon({
        ...form,

        value: Number(form.value || 0),

        minimumOrder: Number(form.minimumOrder || 0),

        maximumDiscount: Number(form.maximumDiscount || 0),

        usageLimit: Number(form.usageLimit || 0),

        perUserLimit: Number(form.perUserLimit || 0),

        productRestriction: String(form.productRestriction || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        startDate: form.startDate ? new Date(form.startDate).toISOString() : "",

        endDate: form.endDate ? new Date(form.endDate).toISOString() : "",
      });

      saveCoupon(nextCoupon);

      setCoupons(readCoupons());

      resetForm();

      notifySuccess(editing ? "Đã cập nhật coupon." : "Đã tạo coupon.");
    } catch (error) {
      notifyError(error?.message || "Không thể lưu coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setForm({
      ...coupon,

      value: coupon.value,

      minimumOrder: coupon.minimumOrder || "",

      maximumDiscount: coupon.maximumDiscount || "",

      usageLimit: coupon.usageLimit || "",

      perUserLimit: coupon.perUserLimit || "",

      startDate: toDateTimeLocal(coupon.startDate),

      endDate: toDateTimeLocal(coupon.endDate),

      categoryRestriction: coupon.categoryRestriction || [],

      productRestriction: (coupon.productRestriction || []).join(", "),
    });

    setEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (coupon) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa coupon "${coupon.code}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteCoupon(coupon.id);

      setCoupons(readCoupons());

      if (form.id === coupon.id) {
        resetForm();
      }

      notifySuccess("Đã xóa coupon.");
    } catch (error) {
      notifyError(error?.message || "Không thể xóa coupon.");
    }
  };

  const handleToggleActive = (coupon) => {
    try {
      toggleCouponActive(coupon.id);

      setCoupons(readCoupons());

      notifySuccess(coupon.active ? "Đã tắt coupon." : "Đã bật coupon.");
    } catch (error) {
      notifyError(error?.message || "Không thể thay đổi trạng thái coupon.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
              <FiTag size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Quản lý khuyến mãi
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Tạo và quản lý mã giảm giá cho khách hàng.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editing ? "Chỉnh sửa coupon" : "Tạo coupon mới"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Các trường không giới hạn có thể để trống.
                </p>
              </div>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <FiX />
                  Hủy
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mã coupon *
                </label>

                <input
                  value={form.code}
                  onChange={(event) =>
                    updateForm(
                      "code",
                      event.target.value.toUpperCase().replace(/\s+/g, "")
                    )
                  }
                  className={inputClass}
                  placeholder="VD: FLOWER10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tên chương trình *
                </label>

                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className={inputClass}
                  placeholder="Giảm giá khách hàng mới"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Loại giảm
                  </label>

                  <select
                    value={form.type}
                    onChange={(event) => updateForm("type", event.target.value)}
                    className={inputClass}
                  >
                    <option value={COUPON_TYPES.PERCENTAGE}>Phần trăm</option>

                    <option value={COUPON_TYPES.FIXED}>Số tiền cố định</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mức giảm *
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={
                      form.type === COUPON_TYPES.PERCENTAGE ? 100 : undefined
                    }
                    value={form.value}
                    onChange={(event) =>
                      updateForm("value", event.target.value)
                    }
                    className={inputClass}
                    placeholder={
                      form.type === COUPON_TYPES.PERCENTAGE ? "10" : "50000"
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Đơn tối thiểu
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.minimumOrder}
                    onChange={(event) =>
                      updateForm("minimumOrder", event.target.value)
                    }
                    className={inputClass}
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Giảm tối đa
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.maximumDiscount}
                    onChange={(event) =>
                      updateForm("maximumDiscount", event.target.value)
                    }
                    className={inputClass}
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Bắt đầu
                  </label>

                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) =>
                      updateForm("startDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Kết thúc
                  </label>

                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) =>
                      updateForm("endDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tổng lượt sử dụng
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(event) =>
                      updateForm("usageLimit", event.target.value)
                    }
                    className={inputClass}
                    placeholder="0 = không giới hạn"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mỗi khách hàng
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.perUserLimit}
                    onChange={(event) =>
                      updateForm("perUserLimit", event.target.value)
                    }
                    className={inputClass}
                    placeholder="0 = không giới hạn"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Giới hạn danh mục
                </p>

                <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  {categories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={(form.categoryRestriction || []).includes(
                          category.slug
                        )}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />

                      {category.name}
                    </label>
                  ))}

                  <p className="pt-1 text-xs text-gray-500">
                    Không chọn danh mục = áp dụng cho mọi danh mục.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giới hạn sản phẩm
                </label>

                <input
                  value={form.productRestriction}
                  onChange={(event) =>
                    updateForm("productRestriction", event.target.value)
                  }
                  className={inputClass}
                  placeholder="ID sản phẩm, cách nhau bằng dấu phẩy"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Không nhập = áp dụng cho mọi sản phẩm.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink-100 bg-pink-50 p-4">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    updateForm("active", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />

                <span className="text-sm font-semibold text-gray-700">
                  Coupon đang hoạt động
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {editing ? <FiSave /> : <FiPlus />}

                {saving
                  ? "Đang lưu..."
                  : editing
                    ? "Lưu thay đổi"
                    : "Tạo coupon"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Danh sách coupon
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {coupons.length} coupon
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {coupons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  Chưa có coupon.
                </div>
              ) : (
                coupons.map((coupon) => {
                  const usage = getCouponUsage(coupon.code);

                  return (
                    <div
                      key={coupon.id}
                      className="rounded-2xl border border-gray-100 p-5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-pink-50 px-3 py-1.5 font-bold text-pink-600">
                              {coupon.code}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                coupon.active
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {coupon.active ? "Đang hoạt động" : "Tắt"}
                            </span>
                          </div>

                          <h3 className="mt-3 font-bold text-gray-900">
                            {coupon.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Giảm{" "}
                            {coupon.type === COUPON_TYPES.PERCENTAGE
                              ? `${coupon.value}%`
                              : formatMoney(coupon.value)}
                          </p>

                          <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                            <span>
                              Đơn tối thiểu:{" "}
                              {coupon.minimumOrder
                                ? formatMoney(coupon.minimumOrder)
                                : "Không"}
                            </span>

                            <span>
                              Giảm tối đa:{" "}
                              {coupon.maximumDiscount
                                ? formatMoney(coupon.maximumDiscount)
                                : "Không"}
                            </span>

                            <span>
                              Thời gian: {formatDate(coupon.startDate)} →{" "}
                              {formatDate(coupon.endDate)}
                            </span>

                            <span>
                              Lượt dùng: {usage.total}
                              {coupon.usageLimit
                                ? ` / ${coupon.usageLimit}`
                                : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(coupon)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <FiCheckCircle />

                            {coupon.active ? "Tắt" : "Bật"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(coupon)}
                            className="inline-flex items-center gap-2 rounded-lg border border-pink-200 px-3 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
                          >
                            <FiEdit2 />
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(coupon)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AdminCouponsPage;
