import { useEffect, useState } from "react";

import { FiTrash2, FiUpload } from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { readProducts, PRODUCT_UPDATED_EVENT } from "@/services/catalog";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const readImageFile = (file, onSuccess, onError) => {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    onError("Vui lòng chọn đúng file hình ảnh.");
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    onError("Hình ảnh không được vượt quá 2MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => onSuccess(String(reader.result || ""));

  reader.onerror = () => onError("Không thể đọc hình ảnh.");

  reader.readAsDataURL(file);
};

const AdminImageManagementPage = () => {
  const [activeTab, setActiveTab] = useState("banners");

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [products, setProducts] = useState(() => readProducts());

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refreshSettings = () => {
      setSettings(readSiteSettings());
    };

    const refreshProducts = () => {
      setProducts(readProducts());
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener("storage", refreshSettings);

    window.addEventListener("storage", refreshProducts);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener("storage", refreshSettings);

      window.removeEventListener("storage", refreshProducts);
    };
  }, []);

  const banners = Array.isArray(settings.hero?.banners)
    ? settings.hero.banners
    : [];

  const productImages = products.filter((product) => product.image);

  const handleAddBanner = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setMessage("");
    setError("");

    readImageFile(
      file,
      (image) => {
        try {
          const banner = {
            id: `banner-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            image,
            alt: "Flower Shop",
            createdAt: new Date().toISOString(),
          };

          const saved = saveSiteSettings({
            ...settings,
            hero: {
              ...settings.hero,
              banners: [...banners, banner],
            },
          });

          setSettings(saved);
          setMessage("Đã thêm banner thành công.");
        } catch (saveError) {
          console.error(saveError);
          setError("Không thể lưu banner.");
        }
      },
      setError
    );
  };

  const handleDeleteBanner = (banner) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) {
      return;
    }

    try {
      const saved = saveSiteSettings({
        ...settings,
        hero: {
          ...settings.hero,
          banners: banners.filter(
            (item) => String(item.id) !== String(banner.id)
          ),
        },
      });

      setSettings(saved);
      setMessage("Đã xóa banner.");
      setError("");
    } catch (saveError) {
      console.error(saveError);
      setError("Không thể xóa banner.");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hình ảnh</h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý Banner và xem hình ảnh sản phẩm.
          </p>
        </div>

        {(message || error) && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="mb-6 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("banners")}
            className={`flex-1 px-5 py-4 font-semibold ${
              activeTab === "banners"
                ? "bg-pink-600 text-white"
                : "text-gray-700 hover:bg-pink-50"
            }`}
          >
            Banner
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex-1 px-5 py-4 font-semibold ${
              activeTab === "products"
                ? "bg-pink-600 text-white"
                : "text-gray-700 hover:bg-pink-50"
            }`}
          >
            Hình ảnh sản phẩm
          </button>
        </div>

        {activeTab === "banners" && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Banner trang chủ</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {banners.length} banner
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 font-semibold text-white hover:bg-pink-700">
                <FiUpload />
                Thêm banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddBanner}
                  className="hidden"
                />
              </label>
            </div>

            {banners.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                Chưa có banner.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <img
                        src={banner.image}
                        alt={banner.alt || `Banner ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">Banner {index + 1}</p>

                        <p className="text-xs text-gray-400">Trang chủ</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(banner)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                        title="Xóa banner"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "products" && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="border-b border-gray-100 pb-5">
              <h2 className="text-xl font-bold">Hình ảnh sản phẩm</h2>

              <p className="mt-1 text-sm text-gray-500">
                Chỉ xem hình ảnh. Không chỉnh sửa sản phẩm tại đây.
              </p>
            </div>

            {productImages.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                Chưa có hình ảnh sản phẩm.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {productImages.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="border-t border-gray-100 p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-gray-800">
                        {product.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  );
};

export default AdminImageManagementPage;
