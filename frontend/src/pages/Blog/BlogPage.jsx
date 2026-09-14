import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { FiArrowLeft, FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";

import {
  buildDefaultBlogShopInfoHtml,
  composeBlogPostContent,
  normalizeBlogPostContent,
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
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

const normalizeBlogContent = (content = "") =>
  normalizeBlogPostContent(content);

/**
 * Chuẩn hóa ngày hiển thị trên giao diện.
 *
 * Hỗ trợ:
 * - ", 14/09/2026"  -> "14/09/2026"
 * - "，14/09/2026"  -> "14/09/2026"
 * - "14/09/2026"    -> "14/09/2026"
 * - "2026-09-14"    -> "14/09/2026"
 * - " 14/09/2026 "  -> "14/09/2026"
 */
const formatPostDate = (value) => {
  const raw = String(value || "")
    .replace(/^[\s,，]+/, "")
    .trim();

  if (!raw) {
    return "";
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return `${day}/${month}/${year}`;
  }

  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashMatch) {
    return raw;
  }

  return raw.replace(/^[,，]\s*/, "").trim();
};

const BlogPage = () => {
  const { postId } = useParams();

  const [settings, setSettings] = useState(() => readSiteSettings());

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

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

  const currentPost = useMemo(
    () => posts.find((post) => String(post.id) === String(postId)),
    [posts, postId]
  );

  const renderedDefaultTemplate = useMemo(
    () => buildDefaultBlogShopInfoHtml(settings),
    [settings]
  );

  const composedCurrentContent = useMemo(
    () =>
      currentPost ? composeBlogPostContent(currentPost.content, settings) : "",
    [currentPost, settings]
  );

  useEffect(() => {
    const existingSchema = document.getElementById("flower-shop-blog-schema");

    if (existingSchema) {
      existingSchema.remove();
    }

    if (currentPost) {
      const siteName = settings.branding?.siteName || "Flower Shop";

      document.title = `${currentPost.title} | ${siteName}`;

      let description = document.querySelector('meta[name="description"]');

      if (!description) {
        description = document.createElement("meta");
        description.name = "description";
        document.head.appendChild(description);
      }

      description.content =
        stripHtml(normalizeBlogPostContent(currentPost.content)).slice(
          0,
          155
        ) || `Bài viết từ ${siteName}.`;

      let canonical = document.querySelector('link[rel="canonical"]');

      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }

      canonical.href = `${window.location.origin}/blog/${currentPost.id}`;

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
    } else if (!postId) {
      document.title = "Bài viết | Flower Shop";
    }

    return () => {
      document.getElementById("flower-shop-blog-schema")?.remove();
    };
  }, [currentPost, postId, settings]);

  if (postId) {
    if (!currentPost) {
      return (
        <section className="min-h-screen bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Không tìm thấy bài viết
            </h1>

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

    const blogStyle = settings.blog?.defaultShopInfoStyle || {
      backgroundColor: "#fff7fb",
      borderColor: "#fce7f3",
      accentColor: "#db2777",
      headingColor: "#1f2937",
      textColor: "#4b5563",
      borderRadius: 14,
      padding: 14,
      headingFontSize: 19,
      subHeadingFontSize: 15,
      bodyFontSize: 14,
      lineHeight: 1.5,
    };

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
                  className="block h-auto max-h-[260px] w-1/3 min-w-[220px] rounded-xl object-contain"
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
              </div>

              <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                {currentPost.title}
              </h1>

              <style>
                {`
                  .blog-detail-content {
                    color: #374151;
                    font-size: 16px;
                    line-height: 1.6;
                    overflow-x: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    white-space: normal;
                  }

                  .blog-detail-content > p {
                    margin: .4rem 0 !important;
                  }

                  .blog-detail-content > p:first-child {
                    margin-top: .65rem !important;
                  }

                  .blog-detail-content > p:last-child {
                    margin-bottom: 0 !important;
                  }

                  .blog-detail-content h2 {
                    margin: .9rem 0 .35rem !important;
                    font-size: 1.4rem;
                    line-height: 1.3;
                    font-weight: 700;
                    color: #111827;
                  }

                  .blog-detail-content h3 {
                    margin: .7rem 0 .3rem !important;
                    font-size: 1.12rem;
                    line-height: 1.3;
                    font-weight: 700;
                    color: #1f2937;
                  }

                  .blog-detail-content h4,
                  .blog-detail-content h5,
                  .blog-detail-content h6 {
                    margin: .6rem 0 .25rem !important;
                    line-height: 1.35;
                    font-weight: 700;
                    color: #1f2937;
                  }

                  .blog-detail-content ul,
                  .blog-detail-content ol {
                    margin: .35rem 0 .5rem !important;
                    padding-left: 1.3rem;
                  }

                  .blog-detail-content li {
                    margin: 0 0 .12rem !important;
                  }

                  .blog-detail-content blockquote {
                    margin: .55rem 0 !important;
                    padding: .6rem .8rem;
                    border-left: 4px solid #db2777;
                    background: #fdf2f8;
                    border-radius: .6rem;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"] {
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin: .85rem 0 0 !important;
                    padding: ${blogStyle.padding}px !important;
                    border: 1px solid ${blogStyle.borderColor};
                    border-radius: ${blogStyle.borderRadius}px;
                    background: ${blogStyle.backgroundColor};
                    color: ${blogStyle.textColor};
                    font-size: ${blogStyle.bodyFontSize}px;
                    line-height: ${blogStyle.lineHeight};
                    overflow-x: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    header {
                    margin: 0 0 .55rem !important;
                    padding: 0 0 .45rem !important;
                    border-bottom: 1px solid ${blogStyle.borderColor};
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    header p:first-child {
                    margin: 0 0 .2rem !important;
                    color: ${blogStyle.accentColor};
                    font-size: 11px !important;
                    line-height: 1.35 !important;
                    font-weight: 700;
                    letter-spacing: .08em;
                    text-transform: uppercase;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    header h2 {
                    margin: 0 !important;
                    color: ${blogStyle.headingColor};
                    font-size: ${blogStyle.headingFontSize}px !important;
                    line-height: 1.25 !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    header p:last-child {
                    margin: .2rem 0 0 !important;
                    color: ${blogStyle.textColor};
                    font-size: 12px !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    > div {
                    color: ${blogStyle.textColor};
                    font-size: ${blogStyle.bodyFontSize}px;
                    line-height: ${blogStyle.lineHeight};
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    > div > p {
                    margin: 0 0 .45rem !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    section {
                    margin: .4rem 0 !important;
                    padding: .55rem .7rem !important;
                    border: 1px solid #f3f4f6;
                    border-radius: .65rem;
                    background: #fff;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    section:last-child {
                    margin-bottom: 0 !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    section h3 {
                    margin: 0 0 .25rem !important;
                    color: ${blogStyle.headingColor};
                    font-size: ${blogStyle.subHeadingFontSize}px !important;
                    line-height: 1.3 !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    section p {
                    margin: 0 0 .25rem !important;
                    font-size: ${blogStyle.bodyFontSize}px !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    section p:last-child {
                    margin-bottom: 0 !important;
                  }

                  .blog-detail-content
                    [data-flower-shop-default-info="true"]
                    a {
                    color: ${blogStyle.accentColor};
                    font-weight: 600;
                    text-decoration: none;
                    overflow-wrap: anywhere;
                  }

                  .blog-detail-content img {
                    display: block;
                    width: 66.666667%;
                    max-width: 66.666667%;
                    max-height: 420px;
                    height: auto;
                    margin: .65rem auto;
                    border: 0;
                    border-radius: .75rem;
                    object-fit: contain;
                  }

                  .blog-detail-content a {
                    color: #db2777;
                    text-decoration: underline;
                  }

                  .blog-detail-content strong {
                    font-weight: 700;
                  }

                  .blog-detail-content em {
                    font-style: italic;
                  }

                  .blog-detail-content u {
                    text-decoration: underline;
                  }

                  .blog-detail-content table {
                    width: 100%;
                    margin: .65rem 0;
                    border-collapse: collapse;
                  }

                  .blog-detail-content th,
                  .blog-detail-content td {
                    border: 1px solid #e5e7eb;
                    padding: .45rem;
                    text-align: left;
                    overflow-wrap: anywhere;
                  }

                  .blog-detail-content th {
                    background: #f9fafb;
                    font-weight: 700;
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
                className="blog-detail-content mt-4"
                dangerouslySetInnerHTML={{
                  __html:
                    composedCurrentContent ||
                    `${articleContent}${renderedDefaultTemplate}`,
                }}
              />
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Bài viết
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-gray-500">
            Những câu chuyện, kiến thức và cảm hứng từ Flower Shop.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Chưa có bài viết.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const coverImage = getCoverImage(post);

              const excerpt =
                stripHtml(normalizeBlogPostContent(post.content)) ||
                "Khám phá bài viết mới từ Flower Shop.";

              const displayDate = formatPostDate(post.date);

              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
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
                          Flower Shop
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
      </div>
    </section>
  );
};

export default BlogPage;
