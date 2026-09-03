import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white"
            >
              <FiArrowLeft />
              Quay lại bài viết
            </Link>
          </div>
        </section>
      );
    }

    return (
      <section className="min-h-screen bg-gray-50 py-8 md:py-12">
        <article className="mx-auto max-w-4xl px-4">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
          >
            <FiArrowLeft />
            Tất cả bài viết
          </Link>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {currentPost.image && (
              <div className="max-h-[500px] overflow-hidden bg-gray-100">
                <img
                  src={currentPost.image}
                  alt={currentPost.title}
                  className="mx-auto max-h-[500px] w-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              {currentPost.date && (
                <p className="text-sm text-gray-400">{currentPost.date}</p>
              )}

              <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                {currentPost.title}
              </h1>

              <div
                className="blog-content mt-8"
                dangerouslySetInnerHTML={{
                  __html: currentPost.content || "",
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Bài viết
          </h1>

          <p className="mt-2 text-gray-500">
            Những câu chuyện, kiến thức và cảm hứng từ Flower Shop.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Chưa có bài viết.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const excerpt = stripHtml(post.content);

              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    {post.image ? (
                      <img
                        src={post.image}
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
                      <p className="text-xs font-medium text-pink-600">
                        {post.date}
                      </p>
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
