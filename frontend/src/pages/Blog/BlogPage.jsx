import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { FiArrowLeft, FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";

import {
  buildDefaultBlogShopInfoHtml,
  composeBlogPostContent,
  normalizeBlogPostContent,
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
  getSiteName,
} from "@/services/siteSettings";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getFirstImageFromHtml = (html = "") => {
  const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);

  return match?.[1] || "";
};

const getCoverImage = (post) =>
  post?.image || getFirstImageFromHtml(post?.content);

const formatPostDate = (value) => {
  const raw = String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim();

  if (!raw) {
    return "";
  }

  const vietnameseDateMatch = raw.match(
    /(?:^|[^\d])(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})(?:$|[^\d])/
  );

  if (vietnameseDateMatch) {
    const [, day, month, year] = vietnameseDateMatch;

    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  const isoDateMatch = raw.match(
    /(?:^|[^\d])(\d{4})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})(?:$|[^\d])/
  );

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;

    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  return raw.replace(/^[\s,，.;:|_-]+/, "").trim();
};

const normalizeBlogContent = (content = "") =>
  normalizeBlogPostContent(content);

const DESKTOP_POSTS_PER_PAGE = 9;
const NON_DESKTOP_POSTS_PER_PAGE = 8;

const BlogPage = () => {
  const { slug, categorySlug } = useParams();

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [settings, setSettings] = useState(() => readSiteSettings());

  const siteName = getSiteName(settings);

  /*
   * Toàn bộ bài viết lấy từ siteSettings.
   * Không còn biến posts undefined.
   */
  const posts = useMemo(
    () =>
      Array.isArray(settings.blogPosts)
        ? settings.blogPosts.filter((post) => post?.status !== "draft")
        : [],
    [settings.blogPosts]
  );

  /*
   * Danh mục bài viết.
   */
  const categories = useMemo(
    () =>
      Array.isArray(settings.blogCategories)
        ? settings.blogCategories.filter(
            (category) => category?.active !== false
          )
        : [],
    [settings.blogCategories]
  );

  const totalPosts = posts.length;

  const getCategoryPostCount = (category) =>
    posts.filter(
      (post) =>
        String(post?.categoryId || "") === String(category?.id || "") ||
        String(post?.categorySlug || "") === String(category?.slug || "")
    ).length;

  /*
   * Khi Admin thay đổi Site Settings,
   * Blog tự cập nhật mà không cần reload.
   */
  useEffect(() => {
    const refresh = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (event) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  /*
   * Lọc bài viết theo danh mục.
   *
   * /blog
   *      -> tất cả
   *
   * /blog/category/slug
   *      -> danh mục tương ứng
   */
  const filteredPosts = useMemo(() => {
    if (!categorySlug) {
      return posts;
    }

    return posts.filter(
      (post) =>
        String(post?.categorySlug || "") === String(categorySlug) ||
        String(post?.categoryId || "") === String(categorySlug)
    );
  }, [posts, categorySlug]);

  /*
   * Chỉ hiển thị tối đa 8 bài mới nhất ở trang Blog.
   */
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const dateA = new Date(a?.publishedAt || a?.date || 0).getTime();

      const dateB = new Date(b?.publishedAt || b?.date || 0).getTime();

      return dateB - dateA;
    });
  }, [filteredPosts]);

  const postsPerPage = isDesktop
    ? DESKTOP_POSTS_PER_PAGE
    : NON_DESKTOP_POSTS_PER_PAGE;

  const totalPages = isDesktop
    ? Math.max(1, Math.ceil(sortedPosts.length / postsPerPage))
    : 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const displayPosts = useMemo(() => {
    if (!isDesktop) {
      return sortedPosts.slice(0, NON_DESKTOP_POSTS_PER_PAGE);
    }

    const startIndex = (currentPage - 1) * DESKTOP_POSTS_PER_PAGE;

    return sortedPosts.slice(startIndex, startIndex + DESKTOP_POSTS_PER_PAGE);
  }, [sortedPosts, currentPage, isDesktop]);

  const goToBlogPage = (page) => {
    if (!isDesktop) {
      return;
    }

    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  /*
   * Tìm bài viết chi tiết.
   *
   * Hỗ trợ cả:
   * /blog/:id
   * /blog/:slug
   */
  const currentPost = useMemo(() => {
    if (!slug) {
      return null;
    }

    return (
      posts.find(
        (post) =>
          String(post?.id || "") === String(slug) ||
          String(post?.slug || "") === String(slug)
      ) || null
    );
  }, [posts, slug]);

  const renderedDefaultTemplate = useMemo(
    () => buildDefaultBlogShopInfoHtml(settings),
    [settings]
  );

  const composedCurrentContent = useMemo(
    () =>
      currentPost ? composeBlogPostContent(currentPost.content, settings) : "",
    [currentPost, settings]
  );

  /*
   * SEO / document.title.
   */
  useEffect(() => {
    const existingSchema = document.getElementById("flower-shop-blog-schema");

    existingSchema?.remove();

    if (!slug) {
      document.title = `Bài viết | ${siteName}`;

      return undefined;
    }

    if (!currentPost) {
      document.title = `Bài viết | ${siteName}`;

      return undefined;
    }

    document.title = `${currentPost.title} | ${siteName}`;

    let description = document.querySelector('meta[name="description"]');

    if (!description) {
      description = document.createElement("meta");

      description.name = "description";

      document.head.appendChild(description);
    }

    description.content =
      stripHtml(normalizeBlogPostContent(currentPost.content)).slice(0, 155) ||
      `Bài viết từ ${siteName}.`;

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");

      canonical.rel = "canonical";

      document.head.appendChild(canonical);
    }

    canonical.href = `${window.location.origin}/blog/${currentPost.slug || currentPost.id}`;

    const coverImage = getCoverImage(currentPost);

    const normalizedDate = formatPostDate(currentPost.date);

    const schemaDate = normalizedDate
      ? normalizedDate.split("/").reverse().join("-")
      : "";

    const schema = {
      "@context": "https://schema.org",

      "@type": "BlogPosting",

      headline: currentPost.title,

      description: stripHtml(
        normalizeBlogPostContent(currentPost.content)
      ).slice(0, 300),

      url: canonical.href,

      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical.href,
      },

      datePublished: schemaDate
        ? `${schemaDate}T${currentPost.time || "08:00"}:00`
        : undefined,

      dateModified: currentPost.updatedAt || undefined,

      image: coverImage ? [coverImage] : undefined,

      author: {
        "@type": "Organization",
        name: siteName,
        url: window.location.origin,
      },

      publisher: {
        "@type": "Organization",
        name: siteName,
        url: window.location.origin,

        logo: settings.branding?.logoImage
          ? {
              "@type": "ImageObject",
              url: settings.branding.logoImage,
            }
          : undefined,
      },
    };

    Object.keys(schema).forEach((key) => {
      if (schema[key] === undefined || schema[key] === null) {
        delete schema[key];
      }
    });

    const schemaScript = document.createElement("script");

    schemaScript.id = "flower-shop-blog-schema";

    schemaScript.type = "application/ld+json";

    schemaScript.textContent = JSON.stringify(schema);

    document.head.appendChild(schemaScript);

    return () => {
      document.getElementById("flower-shop-blog-schema")?.remove();
    };
  }, [currentPost, siteName, slug, settings]);

  /*
   * =====================================================
   * CHI TIẾT BÀI VIẾT
   * =====================================================
   */
  if (slug) {
    if (!currentPost) {
      return (
        <section className="min-h-screen bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Không tìm thấy bài viết
            </h1>

            <p className="mt-3 text-gray-500">
              Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được thay đổi.
            </p>

            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-pink-700"
            >
              <FiArrowLeft />
              Quay lại bài viết
            </Link>
          </div>
        </section>
      );
    }

    const coverImage = getCoverImage(currentPost);

    const articleContent = normalizeBlogContent(currentPost.content);

    const displayDate = formatPostDate(currentPost.date);

    return (
      <section className="min-h-screen bg-gray-50 py-8 md:py-10">
        <article className="mx-auto max-w-4xl px-4">
          <Link
            to="/blog"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-pink-100 bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 shadow-sm hover:bg-pink-50"
          >
            <FiArrowLeft />
            Tất cả bài viết
          </Link>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {coverImage && (
              <div className="flex items-center justify-center overflow-hidden bg-gray-50 p-4 md:p-6">
                <img
                  src={coverImage}
                  alt={currentPost.title}
                  loading="eager"
                  decoding="async"
                  className="block h-auto max-h-[320px] w-2/3 rounded-xl object-contain"
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {displayDate && (
                  <span className="inline-flex items-center gap-2">
                    <FiCalendar size={15} />
                    {displayDate}
                  </span>
                )}

                <span className="inline-flex items-center gap-2">
                  <FiClock size={15} />
                  {currentPost.time || "08:00"}
                </span>

                {currentPost.categoryName && (
                  <span className="rounded-full bg-pink-50 px-3 py-1 font-medium text-pink-600">
                    {currentPost.categoryName}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                {currentPost.title}
              </h1>

              <div className="blog-detail-content mt-5">
                <style>
                  {`
                    .blog-detail-content figure {
                    display: block;
                    width: 100%;
                    margin: 1rem 0;
                    overflow: hidden !important;
                    border-radius: 16px !important;
                    clip-path: inset(0 round 16px);
                    }

                    .blog-detail-content img {
                    display: block !important;
                    width: 66.666667% !important;
                    max-width: 66.666667% !important;
                    height: auto !important;
                    max-height: 420px;
                    margin: .75rem auto !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    object-fit: contain;
                    clip-path: inset(0 round 16px);
                    }

                    .blog-detail-content figure img,
                    .blog-detail-content p img,
                    .blog-detail-content div img {
                    border-radius: 16px !important;
                    clip-path: inset(0 round 16px);
                    }

                    .blog-detail-content figure img {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    }

                    .blog-detail-content img[style] {
                    border-radius: 16px !important;
                    clip-path: inset(0 round 16px);
                    }

                    @media (max-width: 767px) {
                      .blog-detail-content img {
                        width: 100%;
                        max-width: 100%;
                      }
                    }
                  `}
                </style>

                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      composedCurrentContent ||
                      `${articleContent}${renderedDefaultTemplate}`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>
    );
  }

  /*
   * =====================================================
   * DANH SÁCH BÀI VIẾT
   * =====================================================
   */
  return (
    <section className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {settings.blog?.introTitle || "Bài viết"}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-gray-500">
            {String(
              settings.blog?.introDescription ||
                "Những câu chuyện, kiến thức và cảm hứng từ {{siteName}}."
            ).replace(/\{\{siteName\}\}/g, siteName)}
          </p>

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-gray-500">
            {String(
              settings.blog?.shopSummary ||
                "{{siteName}} chia sẻ những câu chuyện, kiến thức về hoa và cảm hứng cho những dịp đặc biệt."
            ).replace(/\{\{siteName\}\}/g, siteName)}
          </p>
        </header>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Link
              to="/blog"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !categorySlug
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              Tất cả ({totalPosts})
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/blog/category/${category.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categorySlug === category.slug
                    ? "bg-pink-600 text-white"
                    : "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                {category.name} ({getCategoryPostCount(category)})
              </Link>
            ))}
          </div>
        )}

        {displayPosts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">
              {categorySlug
                ? "Chưa có bài viết trong danh mục này."
                : "Chưa có bài viết."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayPosts.map((post) => {
              const coverImage = getCoverImage(post);

              const excerpt =
                String(post.excerpt || "").trim() ||
                stripHtml(normalizeBlogPostContent(post.content)) ||
                `Khám phá bài viết mới từ ${siteName}.`;

              const displayDate = formatPostDate(post.date);

              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  className="group flex h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex w-full flex-col">
                    <div className="flex h-44 items-center justify-center overflow-hidden bg-gray-100 p-3">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full max-w-full rounded-lg object-contain transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          {siteName}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-pink-600">
                        {displayDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <FiCalendar />
                            {displayDate}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5">
                          <FiClock />
                          {post.time || "08:00"}
                        </span>
                      </div>

                      {post.categoryName && (
                        <span className="mt-2 w-fit rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600">
                          {post.categoryName}
                        </span>
                      )}

                      <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-7 text-gray-900 group-hover:text-pink-600">
                        {post.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                        {excerpt}
                      </p>

                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-600">
                          Đọc bài viết
                          <FiArrowRight className="transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {isDesktop && totalPages > 1 && (
          <nav
            aria-label="Phân trang bài viết"
            className="mt-8 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => goToBlogPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Trang trước"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToBlogPage(page)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                    page === currentPage
                      ? "bg-pink-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => goToBlogPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &gt;
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
