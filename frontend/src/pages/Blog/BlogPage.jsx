import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { FiArrowLeft, FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";

import {
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

const normalizeBlogContent = (content = "") => {
  const value = String(content || "").trim();

  if (!value) {
    return "<p>Nội dung bài viết đang được cập nhật.</p>";
  }

  const hasHtmlTag =
    /<\s*(p|div|h1|h2|h3|h4|ul|ol|li|blockquote|img|table|br)\b/i.test(value);

  if (hasHtmlTag) {
    return value;
  }

  return value
    .split(/\n\s*\n+/)
    .map((paragraph) => {
      const text = paragraph.replace(/\n/g, "<br />").trim();

      return text ? `<p>${text}</p>` : "";
    })
    .filter(Boolean)
    .join("");
};

const BlogPage = () => {
  const { postId } = useParams();

  const [settings, setSettings] = useState(() => readSiteSettings());

  useEffect(() => {
    const refresh = () => setSettings(readSiteSettings());

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

  useEffect(() => {
    if (currentPost) {
      document.title = `${currentPost.title} | Flower Shop`;

      let description = document.querySelector('meta[name="description"]');

      if (!description) {
        description = document.createElement("meta");
        description.name = "description";
        document.head.appendChild(description);
      }

      description.content =
        stripHtml(currentPost.content).slice(0, 155) ||
        "Bài viết từ Flower Shop.";

      let canonical = document.querySelector('link[rel="canonical"]');

      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }

      canonical.href = `${window.location.origin}/blog/${currentPost.id}`;
    } else if (!postId) {
      document.title = "Bài viết | Flower Shop";
    }
  }, [currentPost, postId]);

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

    return (
      <section className="min-h-screen bg-gray-50 py-8 md:py-12">
        <article className="mx-auto max-w-4xl px-4">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-pink-100 bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 shadow-sm hover:bg-pink-50"
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
                  className="block h-auto max-h-[360px] w-2/3 min-w-[280px] rounded-xl object-contain"
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {currentPost.date && (
                  <span className="inline-flex items-center gap-2">
                    <FiCalendar size={15} />
                    {currentPost.date}
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
                    line-height: 1.9;
                    overflow-wrap: anywhere;
                  }

                  .blog-detail-content p {
                    margin: 0 0 1.5rem;
                  }

                  .blog-detail-content h2 {
                    margin: 2rem 0 1rem;
                    font-size: 1.65rem;
                    line-height: 1.35;
                    font-weight: 700;
                    color: #111827;
                  }

                  .blog-detail-content h3 {
                    margin: 1.5rem 0 .75rem;
                    font-size: 1.3rem;
                    line-height: 1.4;
                    font-weight: 700;
                    color: #1f2937;
                  }

                  .blog-detail-content ul,
                  .blog-detail-content ol {
                    margin: 1rem 0 1.5rem;
                    padding-left: 1.5rem;
                  }

                  .blog-detail-content ul {
                    list-style: disc;
                  }

                  .blog-detail-content ol {
                    list-style: decimal;
                  }

                  .blog-detail-content li {
                    margin-bottom: .5rem;
                  }

                  .blog-detail-content blockquote {
                    margin: 1.5rem 0;
                    padding: 1rem 1.25rem;
                    border-left: 4px solid #db2777;
                    background: #fdf2f8;
                    border-radius: .75rem;
                  }

                  .blog-detail-content img {
                    display: block;
                    width: 66.666667%;
                    max-width: 66.666667%;
                    max-height: 420px;
                    height: auto;
                    margin: 1.5rem auto;
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
                    margin: 1.5rem 0;
                    border-collapse: collapse;
                  }

                  .blog-detail-content th,
                  .blog-detail-content td {
                    border: 1px solid #e5e7eb;
                    padding: .75rem;
                    text-align: left;
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
                className="blog-detail-content mt-8"
                dangerouslySetInnerHTML={{
                  __html: normalizeBlogContent(currentPost.content),
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

              const excerpt = stripHtml(post.content);

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
                        {post.date && (
                          <span className="inline-flex items-center gap-1.5">
                            <FiCalendar />
                            {post.date}
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
                        {excerpt || "Khám phá bài viết mới từ Flower Shop."}
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
