/*
============================================================
FLOWER SHOP — CATALOG SERVICE
============================================================

Quản lý tập trung:
- Products
- Categories
- Đồng bộ Home / Products / Product Detail / Admin
- Bảo vệ dữ liệu seed
- Tự phục hồi image + description bị thiếu
============================================================
*/

import { products as defaultProducts } from "@/data/products";
import {
  readProductsFromIndexedDB,
  saveProductsToIndexedDB,
} from "@/services/catalogStorage";

import {
  DEFAULT_PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES_STORAGE_KEY,
  CATEGORY_UPDATED_EVENT,
  normalizeCategories,
} from "@/constants/productCategories";

export const PRODUCT_STORAGE_KEY = "flower-shop-products";

export const PRODUCT_UPDATED_EVENT = "flower-shop-products-updated";

let productsCache = null;

let productsPersistencePromise = Promise.resolve();

let productsHydrationPromise = null;

/*
 * Dùng để tránh race condition giữa:
 *
 * - quá trình hydrate IndexedDB
 * - thao tác thêm/sửa/xóa sản phẩm
 *
 * Nếu một thao tác thay đổi sản phẩm xảy ra trong lúc
 * IndexedDB đang được hydrate, hydration cũ không được phép
 * ghi đè dữ liệu mới lên productsCache.
 */
let productsMutationVersion = 0;

export { CATEGORY_UPDATED_EVENT };

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeProduct = (product = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...product,
  };

  const image =
    merged.image ||
    merged.images?.[0] ||
    merged.imageUrl ||
    merged.thumbnail ||
    fallback.image ||
    fallback.images?.[0] ||
    fallback.imageUrl ||
    fallback.thumbnail ||
    "";

  return {
    ...merged,

    id: merged.id ?? fallback.id,

    name: String(merged.name || fallback.name || "").trim(),

    category: String(merged.category || fallback.category || "").trim(),

    price: safeNumber(merged.price ?? fallback.price, 0),

    oldPrice:
      merged.oldPrice === null ||
      merged.oldPrice === undefined ||
      merged.oldPrice === ""
        ? null
        : safeNumber(merged.oldPrice, 0),

    badge: String(merged.badge || fallback.badge || "").trim(),

    image,

    description: String(
      merged.description || fallback.description || ""
    ).trim(),

    salesCount: safeNumber(
      merged.salesCount ?? merged.sold ?? fallback.salesCount ?? fallback.sold,
      0
    ),

    isNew: Boolean(merged.isNew ?? fallback.isNew ?? false),
  };
};

const normalizeProducts = (items, seedProducts = defaultProducts) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seedById = new Map(
    seedProducts.map((product) => [String(product.id), product])
  );

  const seedByName = new Map(
    seedProducts.map((product) => [
      String(product.name || "")
        .trim()
        .toLowerCase(),
      product,
    ])
  );

  const seen = new Set();

  return items
    .map((product) => {
      const idFallback = seedById.get(String(product?.id)) || {};

      const nameFallback =
        seedByName.get(
          String(product?.name || "")
            .trim()
            .toLowerCase()
        ) || {};

      const fallback = {
        ...nameFallback,
        ...idFallback,
      };

      return normalizeProduct(product, fallback);
    })
    .filter((product) => {
      const id = String(product.id ?? "");

      if (!id || seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    });
};

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(`Không thể đọc dữ liệu ${key}:`, error);

    return null;
  }
};

const isQuotaExceededError = (error) => {
  if (!error) {
    return false;
  }

  const name = String(error.name || "").toLowerCase();

  const message = String(error.message || "").toLowerCase();

  return (
    name === "quotaexceedederror" ||
    name === "ns_error_dom_quota_reached" ||
    Number(error.code) === 22 ||
    Number(error.code) === 1014 ||
    message.includes("quota") ||
    message.includes("storage") ||
    message.includes("exceeded") ||
    message.includes("full") ||
    message.includes("maximum size")
  );
};

const getStorageWriteErrorMessage = (error, entityLabel = "dữ liệu") => {
  if (isQuotaExceededError(error)) {
    return (
      `Không thể lưu ${entityLabel} vì bộ nhớ trình duyệt (localStorage) ` +
      `đã đạt giới hạn hoặc không còn đủ dung lượng. ` +
      `Ảnh Cloudinary vẫn tồn tại, nhưng danh sách sản phẩm chưa được lưu. ` +
      `Hãy kiểm tra/xóa dữ liệu website không cần thiết trong trình duyệt ` +
      `rồi thực hiện lại thao tác.`
    );
  }

  const name = String(error?.name || "").toLowerCase();

  if (name === "securityerror" || name === "notallowederror") {
    return (
      `Trình duyệt hiện không cho phép website ghi vào bộ nhớ localStorage. ` +
      `Hãy kiểm tra chế độ riêng tư, quyền lưu dữ liệu website hoặc ` +
      `cài đặt chặn storage của trình duyệt rồi thử lại.`
    );
  }

  const message = String(error?.message || "").toLowerCase();

  if (
    name === "typeerror" ||
    message.includes("circular") ||
    message.includes("cyclic")
  ) {
    return (
      `Không thể lưu ${entityLabel} vì dữ liệu chứa cấu trúc ` +
      `không thể chuyển thành JSON.`
    );
  }

  return (
    `Không thể lưu ${entityLabel} vào bộ nhớ trình duyệt. ` +
    `Nguyên nhân kỹ thuật: ${error?.message || "không xác định"}`
  );
};

const createStorageWriteError = (error, entityLabel) =>
  new Error(getStorageWriteErrorMessage(error, entityLabel), {
    cause: error,
  });

const writeJson = (key, value, entityLabel = "dữ liệu") => {
  let serialized;

  try {
    serialized = JSON.stringify(value);
  } catch (error) {
    console.error(`Không thể chuyển dữ liệu ${key} thành JSON:`, error);

    throw createStorageWriteError(error, entityLabel);
  }

  try {
    localStorage.setItem(key, serialized);

    return true;
  } catch (error) {
    console.error(`Không thể lưu dữ liệu ${key}:`, error);

    throw createStorageWriteError(error, entityLabel);
  }
};

const writeJsonSafely = (key, value, entityLabel = "dữ liệu") => {
  try {
    return writeJson(key, value, entityLabel);
  } catch (error) {
    /*
     * Việc ghi cache/seed trong quá trình đọc không được làm hỏng
     * toàn bộ giao diện. Các thao tác save chính thức vẫn dùng
     * writeJson và sẽ throw lỗi để UI hiển thị chính xác.
     */
    console.error(`Không thể ghi dữ liệu phụ trợ ${key}:`, error);

    return false;
  }
};

const getInitialProductsFromLocalStorage = () => {
  const stored = readJson(PRODUCT_STORAGE_KEY);

  if (!Array.isArray(stored)) {
    return normalizeProducts(defaultProducts);
  }

  return normalizeProducts(stored, defaultProducts);
};

const createProductPersistenceError = (error) => {
  if (isQuotaExceededError(error)) {
    return new Error(
      "Không thể lưu danh sách sản phẩm vào bộ nhớ trình duyệt. " +
        "Hệ thống đã chuyển dữ liệu sản phẩm sang IndexedDB nhưng trình duyệt vẫn từ chối ghi dữ liệu. " +
        "Hãy kiểm tra dung lượng lưu trữ của trình duyệt hoặc chế độ riêng tư rồi thử lại.",
      {
        cause: error,
      }
    );
  }

  return new Error(
    `Không thể lưu danh sách sản phẩm vào IndexedDB. ${
      error?.message || "Nguyên nhân không xác định."
    }`,
    {
      cause: error,
    }
  );
};

const removeLegacyProductStorage = () => {
  try {
    localStorage.removeItem(PRODUCT_STORAGE_KEY);
  } catch (removeError) {
    console.warn(
      "Không thể xóa dữ liệu sản phẩm cũ khỏi localStorage:",
      removeError
    );
  }
};

const persistProducts = async (products) => {
  try {
    await saveProductsToIndexedDB(products);

    /*
     * Chỉ xóa localStorage cũ SAU KHI IndexedDB xác nhận
     * ghi thành công.
     */
    removeLegacyProductStorage();

    return products;
  } catch (error) {
    throw createProductPersistenceError(error);
  }
};

const hydrateProductsFromIndexedDB = async () => {
  /*
   * Ghi nhớ phiên bản dữ liệu tại thời điểm bắt đầu hydrate.
   *
   * Nếu trong lúc chờ IndexedDB phản hồi có thao tác
   * thêm/sửa/xóa sản phẩm, hydration cũ không được phép
   * ghi đè dữ liệu mới.
   */
  const hydrationVersion = productsMutationVersion;

  try {
    const indexedProducts = await readProductsFromIndexedDB();

    /*
     * Có thao tác dữ liệu mới trong lúc hydration đang chạy.
     * Không dùng kết quả IndexedDB cũ để ghi đè cache.
     */
    if (productsMutationVersion !== hydrationVersion) {
      return productsCache;
    }

    /*
     * Trường hợp IndexedDB đã có dữ liệu:
     *
     * Đây chính là dữ liệu chính thức của catalog.
     */
    if (Array.isArray(indexedProducts)) {
      productsCache = normalizeProducts(indexedProducts, defaultProducts);

      /*
       * Nếu localStorage vẫn còn bản cũ thì xóa để tránh
       * giữ một bản catalog cũ song song với IndexedDB.
       */
      removeLegacyProductStorage();

      window.dispatchEvent(new Event(PRODUCT_UPDATED_EVENT));

      return productsCache;
    }

    /*
     * Chưa có dữ liệu trong IndexedDB.
     *
     * Đây là lần migrate đầu tiên:
     * lấy dữ liệu hiện tại từ localStorage rồi chuyển sang IndexedDB.
     */
    const legacyProducts = getInitialProductsFromLocalStorage();

    /*
     * Kiểm tra lại một lần nữa trước khi migrate.
     * Nếu có mutation xảy ra trong lúc đọc localStorage,
     * không được ghi bản dữ liệu cũ vào IndexedDB.
     */
    if (productsMutationVersion !== hydrationVersion) {
      return productsCache;
    }

    productsCache = legacyProducts;

    await saveProductsToIndexedDB(legacyProducts);

    removeLegacyProductStorage();

    window.dispatchEvent(new Event(PRODUCT_UPDATED_EVENT));

    return productsCache;
  } catch (error) {
    console.error("Không thể khởi tạo kho sản phẩm IndexedDB:", error);

    /*
     * Nếu IndexedDB không khả dụng, vẫn giữ dữ liệu hiện tại
     * trong bộ nhớ để giao diện không bị blank.
     */
    if (!Array.isArray(productsCache)) {
      productsCache = getInitialProductsFromLocalStorage();
    }

    return productsCache;
  }
};

export const hydrateProducts = () => {
  if (!productsHydrationPromise) {
    productsHydrationPromise = hydrateProductsFromIndexedDB();
  }

  return productsHydrationPromise;
};

export const readProducts = () => {
  if (!Array.isArray(productsCache)) {
    productsCache = getInitialProductsFromLocalStorage();
  }

  return productsCache;
};

export const saveProducts = (products) => {
  const normalized = normalizeProducts(products, defaultProducts);

  productsMutationVersion += 1;

  productsCache = normalized;

  /*
   * API đồng bộ cũ vẫn được giữ để không phá các màn hình
   * đang gọi saveProducts() hiện tại.
   *
   * Tuy nhiên việc ghi bền vững được xếp hàng sau hydration
   * và các lần persistence trước đó.
   */
  const nextPersistence = productsPersistencePromise
    .catch(() => undefined)
    .then(() => hydrateProducts())
    .then(() => persistProducts(normalized));

  productsPersistencePromise = nextPersistence;

  /*
   * saveProducts() là API đồng bộ cũ nên không await được.
   *
   * Gắn catch vào nhánh xử lý để tránh tạo
   * unhandled promise rejection trong trình duyệt.
   *
   * waitForProductsPersistence() vẫn có thể nhận được
   * promise gốc và phát hiện lỗi khi cần.
   */
  nextPersistence.catch((error) => {
    console.error("Không thể lưu danh sách sản phẩm:", error);
  });

  window.dispatchEvent(new Event(PRODUCT_UPDATED_EVENT));

  return normalized;
};

export const saveProductsAsync = async (products) => {
  /*
   * Phải hoàn tất hydration trước khi tính danh sách mới.
   *
   * Đây là điểm quan trọng để không xảy ra tình trạng:
   *
   * IndexedDB đang có 128 sản phẩm
   * nhưng cache tạm thời vẫn là 28 sản phẩm seed.
   */
  await hydrateProducts();

  const normalized = normalizeProducts(products, defaultProducts);

  productsMutationVersion += 1;

  productsCache = normalized;

  /*
   * Xếp hàng tuần tự các lần ghi IndexedDB.
   *
   * Nếu một lần ghi trước đó lỗi, lần ghi mới vẫn có
   * cơ hội thực hiện thay vì bị reject dây chuyền.
   */
  const nextPersistence = productsPersistencePromise
    .catch(() => undefined)
    .then(() => persistProducts(normalized));

  productsPersistencePromise = nextPersistence;

  await nextPersistence;

  window.dispatchEvent(new Event(PRODUCT_UPDATED_EVENT));

  return normalized;
};

export const waitForProductsPersistence = async () => {
  await productsPersistencePromise;
};

/*
 * QUAN TRỌNG:
 *
 * Khởi động quá trình hydrate ngay khi catalog service được
 * import lần đầu.
 *
 * Nếu không có dòng này:
 *
 * - saveProductsAsync() vẫn có thể lưu 128 sản phẩm vào IndexedDB;
 * - Admin đang mở vẫn thấy 128;
 * - nhưng sau reload readProducts() sẽ không tự đọc IndexedDB;
 * - kết quả sẽ quay về defaultProducts (28 sản phẩm).
 *
 * Đây chính là nguyên nhân của lỗi 128 -> 28 đã xảy ra.
 */
hydrateProducts();

export const getProductById = (productId, products = readProducts()) =>
  products.find((product) => String(product.id) === String(productId)) || null;

export const getProductsByCategory = (
  categorySlug,
  products = readProducts()
) =>
  products.filter(
    (product) => String(product.category) === String(categorySlug)
  );

export const searchProducts = (keyword, products = readProducts()) => {
  const query = String(keyword || "")
    .trim()
    .toLowerCase();

  if (!query) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.category, product.badge, product.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
};

export const getFeaturedProducts = (
  categorySlug,
  limit = 5,
  products = readProducts()
) =>
  getProductsByCategory(categorySlug, products)
    .sort((a, b) => {
      const newDifference = Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));

      if (newDifference !== 0) {
        return newDifference;
      }

      return Number(b.salesCount || 0) - Number(a.salesCount || 0);
    })
    .slice(0, limit);

export const readCategories = () => {
  const stored = readJson(PRODUCT_CATEGORIES_STORAGE_KEY);

  if (Array.isArray(stored) && stored.length > 0) {
    return normalizeCategories(stored);
  }

  const seeded = normalizeCategories(DEFAULT_PRODUCT_CATEGORIES);

  writeJsonSafely(PRODUCT_CATEGORIES_STORAGE_KEY, seeded, "danh mục mặc định");

  return seeded;
};

export const saveCategories = (categories) => {
  const normalized = normalizeCategories(categories);

  writeJson(PRODUCT_CATEGORIES_STORAGE_KEY, normalized, "danh mục");

  window.dispatchEvent(new Event(CATEGORY_UPDATED_EVENT));

  return normalized;
};

export const getCategoryBySlug = (slug, categories = readCategories()) =>
  categories.find((category) => String(category.slug) === String(slug)) || null;

export const getActiveCategories = (categories = readCategories()) =>
  categories
    .filter((category) => category.active !== false)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

export const getCatalogSnapshot = () => ({
  products: readProducts(),
  categories: readCategories(),
});
