import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";

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
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
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
      <>
        <style>
          {`
            .blog-detail-content {
              color: #374151;
              font-size: 16px;
              line-height: 1.9;
              overflow-wrap: anywhere;
            }

            .blog-detail-content p {
              margin: 0 0 1.25rem;
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
              width: auto;
              max-width: 100%;
              max-height: 560px;
              margin: 1.5rem auto;
              border-radius: 1rem;
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

            .blog-detail-content br {
              display: block;
              content: "";
              margin-top: .35rem;
            }
          `}
        </style>

        <section className="min-h-screen bg-gray-50 py-8 md:py-12">
          <article className="mx-auto max-w-4xl px-4">
            <Link
              to="/blog"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
            >
              <FiArrowLeft />
              Tất cả bài viết
            </Link>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {coverImage && (
                <div className="flex max-h-[520px] items-center justify-center overflow-hidden bg-gray-50">
                  <img
                    src={coverImage}
                    alt={currentPost.title}
                    className="max-h-[520px] w-full object-contain"
                  />
                </div>
              )}

              <div className="p-6 md:p-10">
                {currentPost.date && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                    <FiCalendar size={15} />
                    {currentPost.date}
                  </div>
                )}

                <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                  {currentPost.title}
                </h1>

                <div
                  className="blog-detail-content mt-8"
                  dangerouslySetInnerHTML={{
                    __html:
                      currentPost.content ||
                      "<p>Nội dung bài viết đang được cập nhật.</p>",
                  }}
                />
              </div>
            </div>
          </article>
        </section>
      </>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Bài viết
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-gray-500">
            Những câu chuyện, kiến thức và cảm hứng từ Flower Shop.
          </p>
        </div>

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
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          Flower Shop
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {post.date && (
                        <div className="flex items-center gap-2 text-xs font-medium text-pink-600">
                          <FiCalendar />
                          {post.date}
                        </div>
                      )}

                      <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-7 text-gray-900 group-hover:text-pink-600">
                        {post.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                        {excerpt || "Khám phá bài viết mới từ Flower Shop."}
                      </p>

                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600">
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
