import { useEffect, useState } from "react";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const BlogPage = () => {
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

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-bold text-gray-800">Bài viết</h1>

        {settings.blogPosts.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-8 text-center text-gray-500">
            Chưa có bài viết.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {settings.blogPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800">
                    {post.title}
                  </h2>

                  {post.date && (
                    <p className="mt-1 text-xs text-gray-400">{post.date}</p>
                  )}

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {post.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
