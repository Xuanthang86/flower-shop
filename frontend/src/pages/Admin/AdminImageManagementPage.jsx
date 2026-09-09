import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiImage,
  FiSave,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { readProducts, PRODUCT_UPDATED_EVENT } from "@/services/catalog";

import { uploadImageFile } from "@/services/media";

const STANDARD_BANNER_TEXT = "Kích thước chuẩn khuyến nghị: 1600 × 700 px.";

const MessageModal = ({ message, error, onClose }) => {
  if (!message && !error) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}
        >
          {error ? <FiTrash2 /> : <FiSave />}
        </div>

        <p
          className={`mt-4 text-center text-sm font-medium ${
            error ? "text-red-700" : "text-gray-700"
          }`}
        >
          {error || message}
        </p>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminImageManagementPage = () => {
  const [activeTab, setActiveTab] = useState("banners");

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [products, setProducts] = useState(() => readProducts());

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const [deleteBanner, setDeleteBanner] = useState(null);

  useEffect(() => {
    document.title = "Quản lý hình ảnh | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";
  }, []);

  useEffect(() => {
    const refreshSettings = () => setSettings(readSiteSettings());

    const refreshProducts = () => setProducts(readProducts());

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

  const banners = useMemo(() => {
    return Array.isArray(settings.hero?.banners)
      ? [...settings.hero.banners].sort(
          (a, b) => Number(a.priority || 0) - Number(b.priority || 0)
        )
      : [];
  }, [settings]);

  const productImages = useMemo(
    () => products.filter((product) => product.image),
    [products]
  );

  const closeMessage = () => {
    setMessage("");
    setError("");
  };

  const updateBanners = (nextBanners) => {
    const saved = saveSiteSettings({
      ...settings,
      hero: {
        ...(settings.hero || {}),
        banners: nextBanners
          .map((banner, index) => ({
            ...banner,
            priority:
              Number(banner.priority) > 0 ? Number(banner.priority) : index + 1,
            duration: Math.min(15, Math.max(5, Number(banner.duration || 8))),
          }))
          .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)),
      },
    });

    setSettings(saved);
  };

  const handleAddBanner = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setBusy(true);
    closeMessage();

    try {
      const imageUrl = await uploadImageFile(file, {
        folder: "flower-shop/banners",
      });

      const nextPriority =
        banners.length === 0
          ? 1
          : Math.max(...banners.map((banner) => Number(banner.priority || 0))) +
            1;

      const banner = {
        id: `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        image: imageUrl,
        mobileImage: "",
        alt: `Banner Flower Shop ${nextPriority}`,
        priority: nextPriority,
        duration: 8,
        visible: true,
        createdAt: new Date().toISOString(),
      };

      updateBanners([...banners, banner]);

      setMessage(`Đã thêm banner thành công. ${STANDARD_BANNER_TEXT}`);
    } catch (uploadError) {
      setError(
        uploadError.message || "Không thể tải banner lên kho ảnh dùng chung."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteBanner = () => {
    if (!deleteBanner) return;

    try {
      updateBanners(
        banners
          .filter((banner) => String(banner.id) !== String(deleteBanner.id))
          .map((banner, index) => ({
            ...banner,
            priority: index + 1,
          }))
      );

      setDeleteBanner(null);
      setMessage("Đã xóa banner.");
    } catch (deleteError) {
      setDeleteBanner(null);
      setError(deleteError.message || "Không thể xóa banner.");
    }
  };

  const updateBannerField = (bannerId, field, value) => {
    const next = banners.map((banner) =>
      String(banner.id) === String(bannerId)
        ? {
            ...banner,
            [field]: value,
          }
        : banner
    );

    try {
      updateBanners(next);
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu cấu hình banner.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hình ảnh</h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý Banner và hình ảnh sản phẩm.
          </p>
        </header>

        <div className="mb-5 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("banners")}
            className={`flex-1 px-5 py-3.5 text-sm font-semibold ${
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
            className={`flex-1 px-5 py-3.5 text-sm font-semibold ${
              activeTab === "products"
                ? "bg-pink-600 text-white"
                : "text-gray-700 hover:bg-pink-50"
            }`}
          >
            Hình ảnh sản phẩm
          </button>
        </div>

        {activeTab === "banners" && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Banner trang chủ</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {banners.length} banner
                </p>
              </div>

              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700">
                <FiUpload />
                {busy ? "Đang tải..." : "Thêm banner"}

                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={handleAddBanner}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-3 rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-xs text-pink-700">
              {STANDARD_BANNER_TEXT} Nên sử dụng WebP/JPEG chất lượng tốt và
              dung lượng nhẹ.
            </div>

            {banners.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                Chưa có banner.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {banners.map((banner, index) => (
                  <article
                    key={banner.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gray-50 p-2">
                      <img
                        src={banner.image}
                        alt={banner.alt || `Banner ${index + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />

                      <span className="absolute left-2 top-2 rounded-md bg-gray-900/80 px-2 py-1 text-[10px] font-bold text-white">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="space-y-3 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs font-semibold text-gray-600">
                          Ưu tiên
                          <input
                            type="number"
                            min="1"
                            value={banner.priority || index + 1}
                            onChange={(event) =>
                              updateBannerField(
                                banner.id,
                                "priority",
                                Number(event.target.value)
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                          />
                        </label>

                        <label className="text-xs font-semibold text-gray-600">
                          Thời gian
                          <select
                            value={banner.duration || 8}
                            onChange={(event) =>
                              updateBannerField(
                                banner.id,
                                "duration",
                                Number(event.target.value)
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                          >
                            {Array.from({ length: 11 }, (_, i) => i + 5).map(
                              (seconds) => (
                                <option key={seconds} value={seconds}>
                                  {seconds} giây
                                </option>
                              )
                            )}
                          </select>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={banner.visible !== false}
                            onChange={(event) =>
                              updateBannerField(
                                banner.id,
                                "visible",
                                event.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-pink-600"
                          />

                          {banner.visible !== false ? (
                            <>
                              <FiEye />
                              Hiển thị
                            </>
                          ) : (
                            <>
                              <FiEyeOff />
                              Đang ẩn
                            </>
                          )}
                        </label>

                        <button
                          type="button"
                          onClick={() => setDeleteBanner(banner)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "products" && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold">Hình ảnh sản phẩm</h2>

              <p className="mt-1 text-sm text-gray-500">
                Giao diện ảnh đồng nhất với Tất cả sản phẩm.
              </p>
            </div>

            {productImages.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                Chưa có hình ảnh sản phẩm.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {productImages.map((product) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex h-32 items-center justify-center overflow-hidden bg-gray-50 p-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    </div>

                    <div className="p-3">
                      <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold text-gray-800">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-pink-600">
                        {Number(product.price || 0).toLocaleString("vi-VN")} ₫
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Đã bán:{" "}
                        {Number(product.salesCount || 0).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <MessageModal message={message} error={error} onClose={closeMessage} />

      {deleteBanner && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-lg font-bold">Xóa banner?</h2>

            <p className="mt-2 text-sm text-gray-500">
              Banner này sẽ bị xóa khỏi danh sách hiển thị.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteBanner(null)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleDeleteBanner}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminImageManagementPage;
