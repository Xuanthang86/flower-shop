import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { FiArrowLeft, FiCheck, FiHeart, FiShoppingCart } from "react-icons/fi";

import {
  getProductById,
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import { ROLES, useAuth } from "@/context/AuthContext";

import { useCart } from "@/context/useCart";

import { useNotification } from "@/context/NotificationContext";

const WISHLIST_KEY = "flower-shop-wishlist";

const STAFF_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.PRODUCT_MANAGER,
]);

const ensureMeta = (attribute, value, content) => {
  let element = document.querySelector(`meta[${attribute}="${value}"]`);

  if (!element) {
    element = document.createElement("meta");

    element.setAttribute(attribute, value);

    document.head.appendChild(element);
  }

  element.setAttribute("content", content);

  return element;
};

const ensureCanonical = (url) => {
  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");

    link.setAttribute("rel", "canonical");

    document.head.appendChild(link);
  }

  link.setAttribute("href", url);

  return link;
};

const ProductDetailPage = () => {
  const { productId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { addToCart } = useCart();

  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const [isFavorite, setIsFavorite] = useState(false);

  const isStaff = STAFF_ROLES.has(user?.role);

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts());

    const refreshCategories = () => setCategories(readCategories());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);
    };
  }, []);

  const product = useMemo(
    () => getProductById(productId, products),
    [productId, products]
  );

  const category = product
    ? categories.find((item) => item.slug === product.category)
    : null;

  useEffect(() => {
    if (!user || isStaff || !product) {
      setIsFavorite(false);

      return;
    }

    const userId = user.id || user.email;

    try {
      const raw = localStorage.getItem(`${WISHLIST_KEY}-${userId}`);

      const ids = raw ? JSON.parse(raw) : [];

      setIsFavorite(
        Array.isArray(ids) && ids.map(String).includes(String(product.id))
      );
    } catch {
      setIsFavorite(false);
    }
  }, [user, product, isStaff]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [productId]);

  /*
   * SEO metadata + Product JSON-LD.
   */
  useEffect(() => {
    const jsonLdId = "flower-shop-product-jsonld";

    const breadcrumbId = "flower-shop-breadcrumb-jsonld";

    const existingProductSchema = document.getElementById(jsonLdId);

    const existingBreadcrumbSchema = document.getElementById(breadcrumbId);

    if (existingProductSchema) {
      existingProductSchema.remove();
    }

    if (existingBreadcrumbSchema) {
      existingBreadcrumbSchema.remove();
    }

    const canonicalUrl = `${window.location.origin}/products/${encodeURIComponent(
      productId
    )}`;

    if (!product) {
      document.title = "Không tìm thấy sản phẩm | Flower Shop";

      ensureMeta(
        "name",
        "description",
        "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật."
      );

      ensureMeta("name", "robots", "noindex,nofollow");

      ensureCanonical(canonicalUrl);

      return;
    }

    const description = String(
      product.description || `Khám phá ${product.name} tại Flower Shop.`
    )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    document.title = `${product.name} | Flower Shop`;

    ensureMeta("name", "description", description);

    ensureMeta("name", "robots", "index,follow");

    ensureMeta("property", "og:title", `${product.name} | Flower Shop`);

    ensureMeta("property", "og:description", description);

    ensureMeta("property", "og:type", "product");

    if (product.image) {
      ensureMeta("property", "og:image", product.image);
    }

    ensureCanonical(canonicalUrl);

    const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

    const productSchema = {
      "@context": "https://schema.org",

      "@type": "Product",

      name: product.name,

      description,

      image: product.image ? [product.image] : undefined,

      sku: String(product.id),

      category: category?.name || product.category || undefined,

      brand: {
        "@type": "Brand",
        name: "Flower Shop",
      },

      offers: {
        "@type": "Offer",

        url: canonicalUrl,

        priceCurrency: "VND",

        price: Number(product.price || 0),

        availability:
          Number(product.stock) === 0
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",

        itemCondition: "https://schema.org/NewCondition",
      },
    };

    Object.keys(productSchema).forEach((key) => {
      if (productSchema[key] === undefined) {
        delete productSchema[key];
      }
    });

    const productScript = document.createElement("script");

    productScript.id = jsonLdId;

    productScript.type = "application/ld+json";

    productScript.textContent = safeJson(productSchema);

    document.head.appendChild(productScript);

    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Sản phẩm",
        item: `${window.location.origin}/products`,
      },
    ];

    if (category) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${window.location.origin}/products?category=${encodeURIComponent(
          category.slug
        )}`,
      });
    }

    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: product.name,
      item: canonicalUrl,
    });

    const breadcrumbScript = document.createElement("script");

    breadcrumbScript.id = breadcrumbId;

    breadcrumbScript.type = "application/ld+json";

    breadcrumbScript.textContent = safeJson({
      "@context": "https://schema.org",

      "@type": "BreadcrumbList",

      itemListElement: breadcrumbItems,
    });

    document.head.appendChild(breadcrumbScript);

    return () => {
      document.getElementById(jsonLdId)?.remove();

      document.getElementById(breadcrumbId)?.remove();
    };
  }, [product, category, productId]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter(
        (item) =>
          item.category === product.category &&
          String(item.id) !== String(product.id)
      )
      .sort((a, b) => {
        const newDiff = Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));

        if (newDiff !== 0) {
          return newDiff;
        }

        return Number(b.salesCount || 0) - Number(a.salesCount || 0);
      })
      .slice(0, 8);
  }, [product, products]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (isStaff) {
      notifyError(
        "Tài khoản quản trị không có quyền mua hàng. Vui lòng sử dụng tài khoản khách hàng."
      );

      return;
    }

    if (!user) {
      notifyInfo("Vui lòng đăng nhập để mua hàng.");

      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    const result = addToCart(product);

    if (!result?.success) {
      notifyError(result?.message || "Không thể thêm sản phẩm vào giỏ hàng.");

      return;
    }

    notifySuccess(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  const handleToggleFavorite = () => {
    if (!product) {
      return;
    }

    if (isStaff) {
      notifyError(
        "Tài khoản quản trị không có quyền sử dụng sản phẩm yêu thích."
      );

      return;
    }

    if (!user) {
      notifyInfo("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.");

      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    const userId = user.id || user.email;

    const key = `${WISHLIST_KEY}-${userId}`;

    let ids = [];

    try {
      const raw = localStorage.getItem(key);

      const parsed = raw ? JSON.parse(raw) : [];

      ids = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      ids = [];
    }

    const id = String(product.id);

    const updatedIds = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : [...ids, id];

    localStorage.setItem(key, JSON.stringify(updatedIds));

    setIsFavorite(updatedIds.includes(id));

    notifySuccess(
      updatedIds.includes(id)
        ? "Đã thêm sản phẩm vào danh sách yêu thích."
        : "Đã bỏ sản phẩm khỏi danh sách yêu thích."
    );
  };

  if (!product) {
    return (
      <section className="min-h-[70vh] bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">
              Không tìm thấy sản phẩm
            </h1>

            <p className="mt-3 text-gray-500">
              Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-medium text-white hover:bg-pink-700"
            >
              <FiArrowLeft />
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section key={productId} className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          to="/products"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
        >
          <FiArrowLeft />
          Quay lại sản phẩm
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-xs text-gray-400 md:text-sm"
        >
          <Link to="/products" className="hover:text-pink-600">
            Sản phẩm
          </Link>

          <span aria-hidden="true">/</span>

          {category && (
            <>
              <Link
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="font-medium text-pink-600"
              >
                {category.name}
              </Link>

              <span aria-hidden="true">/</span>
            </>
          )}

          <span className="line-clamp-1 text-gray-500">{product.name}</span>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-gray-50 p-4 md:p-6">
              <div className="mx-auto aspect-square max-w-md overflow-hidden rounded-2xl bg-white">
                <img
                  src={product.image}
                  alt={product.name}
                  width="800"
                  height="800"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              {category && (
                <Link
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="inline-flex rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600"
                >
                  {category.name}
                </Link>
              )}

              <h1 className="mt-4 text-2xl font-bold text-gray-800 md:text-3xl">
                {product.name}
              </h1>

              {product.badge && (
                <div className="mt-3">
                  <span className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
                    {product.badge}
                  </span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-pink-600 md:text-3xl">
                  {formatPrice(product.price)}
                </span>

                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                {typeof product.salesCount === "number" && (
                  <span>
                    Đã bán{" "}
                    <strong className="text-gray-700">
                      {product.salesCount}
                    </strong>
                  </span>
                )}

                {product.isNew && (
                  <span className="flex items-center gap-1 font-medium text-green-600">
                    <FiCheck />
                    Sản phẩm mới
                  </span>
                )}
              </div>

              <div className="my-6 border-t border-gray-100" />

              {isStaff ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-800">
                    Tài khoản quản trị
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    Admin, Manager và Quản lý sản phẩm chỉ có quyền quản trị hệ
                    thống, không có quyền mua hàng hoặc thêm sản phẩm vào yêu
                    thích.
                  </p>

                  <Link
                    to="/admin"
                    className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Đi tới khu vực quản trị →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3.5 font-semibold text-white hover:bg-pink-700"
                  >
                    <FiShoppingCart />
                    Thêm vào giỏ
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`flex h-12 items-center justify-center rounded-xl border sm:w-14 ${
                      isFavorite
                        ? "border-pink-300 bg-pink-50 text-pink-600"
                        : "border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-600"
                    }`}
                    aria-label={
                      isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"
                    }
                  >
                    <FiHeart
                      size={20}
                      className={isFavorite ? "fill-current" : ""}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-gray-800">Mô tả sản phẩm</h2>

          <p className="mt-4 leading-7 text-gray-600">{product.description}</p>
        </section>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-products-heading" className="mt-10">
            <h2
              id="related-products-heading"
              className="mb-5 text-xl font-bold text-gray-800 md:text-2xl"
            >
              Sản phẩm liên quan
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <Link
                    to={`/products/${item.id}`}
                    aria-label={`Xem ${item.name}`}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        width="600"
                        height="600"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-3 md:p-4">
                    <Link to={`/products/${item.id}`}>
                      <h3 className="min-h-[40px] line-clamp-2 text-sm font-semibold text-gray-800 hover:text-pink-600 md:text-base">
                        {item.name}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm font-bold text-pink-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

export default ProductDetailPage;
