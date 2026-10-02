import {
  PRODUCT_UPDATED_EVENT,
  applyRemoteProducts,
  hydrateProducts,
  readProducts,
  CATEGORY_UPDATED_EVENT,
  readCategories,
} from "@/services/catalog";

import {
  SITE_SETTINGS_STORAGE_KEY,
  SITE_SETTINGS_UPDATED_EVENT,
  BLOG_POSTS_STORAGE_KEY,
  BLOG_POSTS_UPDATED_EVENT,
  readSiteSettings,
  readBlogPosts,
} from "@/services/siteSettings";

import { PRODUCT_CATEGORIES_STORAGE_KEY } from "@/constants/productCategories";

const normalizeApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const base = String(configured).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl();

const SYNC_TIMESTAMP_KEY = "flower-shop-shared-sync-updated-at";

const POLL_INTERVAL = 5000;

const PUSH_DELAY = 700;

let started = false;

let applyingRemote = false;

let pushTimer = null;

let refreshTimer = null;

let pushing = false;

let pushRequested = false;

let localChangeVersion = 0;

let lastPushedChangeVersion = 0;

const dispatch = (eventName) => {
  window.dispatchEvent(new Event(eventName));
};

// const parseTimestamp = (value) => {
//   const timestamp = value ? new Date(value).getTime() : NaN;

//   return Number.isFinite(timestamp) ? timestamp : 0;
// };

/*
 * ============================================================
 * BLOG MERGE
 * ============================================================
 *
 * Trong giai đoạn migration:
 *
 * local + remote phải được hợp nhất.
 *
 * Không được:
 *
 * remote → ghi đè local
 *
 * nếu hai phía đều có dữ liệu.
 *
 * Khi cùng một bài có cùng ID:
 * ưu tiên bản có updatedAt mới hơn.
 */
const getBlogPostIdentity = (post) => {
  const id = String(post?.id || "").trim();

  if (id) {
    return `id:${id}`;
  }

  const slug = String(post?.slug || "")
    .trim()
    .toLowerCase();

  if (slug) {
    return `slug:${slug}`;
  }

  return "";
};

const parseTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : NaN;

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const isDeletedBlogPost = (post) =>
  Boolean(
    post?.deletedAt || post?.isDeleted === true || post?.status === "deleted"
  );

const mergeBlogPosts = (localPosts, remotePosts) => {
  const local = Array.isArray(localPosts) ? localPosts : [];

  const remote = Array.isArray(remotePosts) ? remotePosts : [];

  const map = new Map();

  const addPost = (post) => {
    if (!post || typeof post !== "object") {
      return;
    }

    const identity = getBlogPostIdentity(post);

    if (!identity) {
      return;
    }

    const existing = map.get(identity);

    if (!existing) {
      map.set(identity, post);
      return;
    }

    const existingUpdatedAt = parseTimestamp(existing.updatedAt);
    const nextUpdatedAt = parseTimestamp(post.updatedAt);

    /*
     * deletedAt là trạng thái ưu tiên cao hơn
     * nội dung bài viết.
     */
    if (isDeletedBlogPost(post) && !isDeletedBlogPost(existing)) {
      map.set(identity, post);
      return;
    }

    if (isDeletedBlogPost(existing) && !isDeletedBlogPost(post)) {
      return;
    }

    if (nextUpdatedAt >= existingUpdatedAt) {
      map.set(identity, post);
    }
  };

  local.forEach(addPost);
  remote.forEach(addPost);

  return Array.from(map.values());
};

/*
 * ============================================================
 * READ SNAPSHOT
 * ============================================================
 */

const readSnapshot = async () => {
  await hydrateProducts();

  return {
    products: readProducts(),

    categories: readCategories(),

    settings: {
      ...readSiteSettings(),

      /*
       * Blog không thuộc site settings.
       */
      blogPosts: [],
    },

    /*
     * Blog là domain dữ liệu riêng.
     */
    blogPosts: readBlogPosts(),
  };
};

/*
 * ============================================================
 * SYNC TIMESTAMP
 * ============================================================
 */

const readLastSyncedAt = () => {
  try {
    const value = localStorage.getItem(SYNC_TIMESTAMP_KEY);

    return value ? new Date(value).getTime() : 0;
  } catch {
    return 0;
  }
};

const writeLastSyncedAt = (updatedAt) => {
  if (!updatedAt) {
    return;
  }

  try {
    localStorage.setItem(SYNC_TIMESTAMP_KEY, updatedAt);
  } catch (error) {
    console.warn("[sharedDataSync] Không thể lưu thời điểm đồng bộ:", error);
  }
};

/*
 * ============================================================
 * APPLY REMOTE SNAPSHOT
 * ============================================================
 */

const applySnapshot = async (snapshot, updatedAt) => {
  if (!snapshot || typeof snapshot !== "object") {
    return;
  }

  applyingRemote = true;

  try {
    /*
     * PRODUCTS
     */
    if (Array.isArray(snapshot.products)) {
      await applyRemoteProducts(snapshot.products, updatedAt);
    }

    /*
     * CATEGORIES
     */
    if (Array.isArray(snapshot.categories)) {
      localStorage.setItem(
        PRODUCT_CATEGORIES_STORAGE_KEY,
        JSON.stringify(snapshot.categories)
      );

      dispatch(CATEGORY_UPDATED_EVENT);
    }

    /*
     * SITE SETTINGS
     */
    if (snapshot.settings && typeof snapshot.settings === "object") {
      const currentSettings = readSiteSettings();

      const remoteSettings = {
        ...snapshot.settings,
      };

      delete remoteSettings.blogPosts;

      const mergedSettings = {
        ...currentSettings,

        ...remoteSettings,

        blogPosts: [],
      };

      localStorage.setItem(
        SITE_SETTINGS_STORAGE_KEY,
        JSON.stringify(mergedSettings)
      );

      dispatch(SITE_SETTINGS_UPDATED_EVENT);
    }

    /*
     * BLOG
     */
    const remoteBlogPosts = Array.isArray(snapshot.blogPosts)
      ? snapshot.blogPosts
      : null;

    /*
     * Không có blog trong response:
     * không đụng vào local.
     */
    if (remoteBlogPosts !== null) {
      const currentBlogPosts = readBlogPosts();

      const mergedBlogPosts = mergeBlogPosts(currentBlogPosts, remoteBlogPosts);

      try {
        localStorage.setItem(
          BLOG_POSTS_STORAGE_KEY,
          JSON.stringify(mergedBlogPosts)
        );

        dispatch(BLOG_POSTS_UPDATED_EVENT);
      } catch (error) {
        console.warn("[sharedDataSync] Không thể lưu blog snapshot:", error);
      }
    }

    writeLastSyncedAt(updatedAt);
  } finally {
    applyingRemote = false;
  }
};

/*
 * ============================================================
 * FETCH SNAPSHOT
 * ============================================================
 */

const fetchSnapshot = async () => {
  const response = await fetch(`${API_BASE_URL}/data/snapshot`, {
    cache: "no-store",

    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể tải dữ liệu dùng chung.");
  }

  return payload;
};

/*
 * ============================================================
 * PUSH SNAPSHOT
 * ============================================================
 */

const pushSnapshot = async () => {
  if (applyingRemote) {
    return;
  }

  if (pushing) {
    pushRequested = true;

    return;
  }

  pushing = true;

  pushRequested = false;

  const changeVersionAtStart = localChangeVersion;

  try {
    const snapshot = await readSnapshot();

    const response = await fetch(`${API_BASE_URL}/data/snapshot`, {
      method: "PUT",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(snapshot),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload?.message || "Không thể đồng bộ dữ liệu với máy chủ."
      );
    }

    if (localChangeVersion === changeVersionAtStart) {
      lastPushedChangeVersion = changeVersionAtStart;

      if (payload?.updatedAt) {
        writeLastSyncedAt(payload.updatedAt);
      }
    } else {
      pushRequested = true;
    }
  } finally {
    pushing = false;
  }

  if (pushRequested || lastPushedChangeVersion !== localChangeVersion) {
    pushRequested = false;

    schedulePush();
  }
};

/*
 * ============================================================
 * PULL SNAPSHOT
 * ============================================================
 */

const pullSnapshot = async () => {
  if (pushing || applyingRemote) {
    return;
  }

  try {
    const payload = await fetchSnapshot();

    if (payload?.initialized === false) {
      /*
       * Server chưa có snapshot.
       *
       * Không xóa local.
       */
      await pushSnapshot();

      return;
    }

    if (payload?.initialized !== true || !payload?.snapshot) {
      return;
    }

    const serverTime = payload.updatedAt
      ? new Date(payload.updatedAt).getTime()
      : 0;

    /*
     * BACKWARD COMPATIBILITY
     *
     * Một số phiên bản backend cũ có thể trả blogPosts
     * ở root-level thay vì snapshot.blogPosts.
     */
    const snapshot = {
      ...payload.snapshot,
    };

    if (Array.isArray(payload.snapshot.blogPosts)) {
      snapshot.blogPosts = payload.snapshot.blogPosts;
    } else if (Array.isArray(payload.blogPosts)) {
      snapshot.blogPosts = payload.blogPosts;
    }

    /*
     * Nếu server không có blog field:
     * tuyệt đối không coi là [].
     *
     * Điều này tránh việc backend cũ làm mất
     * dữ liệu blog hiện tại của browser.
     */
    if (!Array.isArray(snapshot.blogPosts)) {
      delete snapshot.blogPosts;
    }

    /*
     * ========================================================
     * BLOG ĐƯỢC ĐỒNG BỘ ĐỘC LẬP VỚI SNAPSHOT TIMESTAMP
     * ========================================================
     *
     * Đây là điểm sửa quan trọng.
     *
     * Không được dùng:
     *
     *   serverTime <= localTime
     *
     * để bỏ qua toàn bộ snapshot vì Blog có thể chứa
     * tombstone (status: deleted).
     *
     * Browser khác phải luôn có cơ hội merge trạng thái
     * xóa từ MongoDB.
     */
    const remoteBlogPosts = Array.isArray(snapshot.blogPosts)
      ? snapshot.blogPosts
      : null;

    /*
     * Chụp dữ liệu blog hiện tại trước khi merge.
     */
    const currentBlogPosts = readBlogPosts();

    /*
     * Merge local + remote.
     *
     * mergeBlogPosts() đã có quy tắc:
     *
     * deleted > active
     *
     * nên tombstone từ MongoDB không bị bài viết cũ
     * ở browser khác ghi đè lại.
     */
    let mergedBlogPosts = currentBlogPosts;

    if (remoteBlogPosts !== null) {
      mergedBlogPosts = mergeBlogPosts(currentBlogPosts, remoteBlogPosts);
    }

    /*
     * ========================================================
     * CÁC DOMAIN KHÁC
     * ========================================================
     *
     * Products / Categories / Settings vẫn sử dụng
     * timestamp để tránh nhận snapshot cũ.
     *
     * Blog đã được xử lý riêng ở trên.
     */
    const localTime = readLastSyncedAt();

    const shouldApplyGeneralSnapshot =
      !serverTime || !localTime || serverTime > localTime;

    if (shouldApplyGeneralSnapshot) {
      await applySnapshot(snapshot, payload.updatedAt);
    } else if (remoteBlogPosts !== null) {
      /*
       * Snapshot tổng thể không mới hơn,
       * nhưng Blog vẫn phải được merge.
       *
       * applySnapshot() không được gọi ở đây vì nếu gọi,
       * các domain khác có thể bị ghi lại từ snapshot cũ.
       */
      applyingRemote = true;

      try {
        localStorage.setItem(
          BLOG_POSTS_STORAGE_KEY,
          JSON.stringify(mergedBlogPosts)
        );

        dispatch(BLOG_POSTS_UPDATED_EVENT);

        writeLastSyncedAt(payload.updatedAt || new Date().toISOString());
      } catch (error) {
        console.warn("[sharedDataSync] Không thể lưu blog snapshot:", error);
      } finally {
        applyingRemote = false;
      }
    }

    /*
     * ========================================================
     * XÁC ĐỊNH BLOG CÓ CẦN PUSH LẠI KHÔNG
     * ========================================================
     *
     * Không chỉ kiểm tra length.
     *
     * Ví dụ:
     *
     * local:
     *   [A deleted]
     *
     * remote:
     *   [A active]
     *
     * length vẫn bằng nhau,
     * nhưng dữ liệu hoàn toàn khác.
     *
     * Vì vậy phải so sánh nội dung.
     */

    if (remoteBlogPosts !== null) {
      const normalizeForComparison = (posts) =>
        (Array.isArray(posts) ? posts : [])
          .map((post) => ({
            id: String(post?.id || ""),
            slug: String(post?.slug || ""),
            status: String(post?.status || ""),
            isDeleted: post?.isDeleted === true,
            deletedAt: String(post?.deletedAt || ""),
            updatedAt: String(post?.updatedAt || ""),
            title: String(post?.title || ""),
            content: String(post?.content || ""),
            image: String(post?.image || ""),
            categoryId: String(post?.categoryId || ""),
            publishedAt: String(post?.publishedAt || ""),
            date: String(post?.date || ""),
            time: String(post?.time || ""),
          }))
          .sort((a, b) => {
            const identityA = `${a.id}|${a.slug}`;
            const identityB = `${b.id}|${b.slug}`;

            return identityA.localeCompare(identityB);
          });

      const mergedComparable = JSON.stringify(
        normalizeForComparison(mergedBlogPosts)
      );

      const remoteComparable = JSON.stringify(
        normalizeForComparison(remoteBlogPosts)
      );

      /*
       * Nếu merge tạo ra dữ liệu khác server,
       * browser này đang có thông tin mà server chưa có
       * hoặc đang cần cập nhật tombstone.
       *
       * Push snapshot hợp nhất trở lại MongoDB.
       */
      if (mergedComparable !== remoteComparable) {
        localChangeVersion += 1;

        schedulePush();
      }
    }

    /*
     * Nếu snapshot tổng thể mới hơn,
     * applySnapshot() đã ghi sync timestamp.
     *
     * Nếu snapshot tổng thể cũ nhưng Blog vẫn được xử lý,
     * timestamp cũng được cập nhật để tránh vòng lặp pull vô hạn.
     */
    if (shouldApplyGeneralSnapshot) {
      /*
       * applySnapshot() đã xử lý timestamp.
       */
    } else if (remoteBlogPosts !== null && payload.updatedAt) {
      writeLastSyncedAt(payload.updatedAt);
    }
  } catch (error) {
    console.warn("[sharedDataSync] Pull:", error?.message || error);
  }
};
/*
 * ============================================================
 * SCHEDULE PUSH
 * ============================================================
 */

const schedulePush = () => {
  if (applyingRemote) {
    return;
  }

  window.clearTimeout(pushTimer);

  pushTimer = window.setTimeout(() => {
    pushSnapshot().catch((error) => {
      console.warn("[sharedDataSync] Push:", error?.message || error);
    });
  }, PUSH_DELAY);
};

/*
 * ============================================================
 * START
 * ============================================================
 */

export const startSharedDataSync = () => {
  if (started) {
    return () => {};
  }

  started = true;

  const handleChange = (event) => {
    if (applyingRemote) {
      return;
    }

    const source = event?.detail?.source;

    if (source === "hydrate" || source === "remote") {
      return;
    }

    if (event?.type === PRODUCT_UPDATED_EVENT) {
      localChangeVersion += 1;
    }

    if (
      event?.type === CATEGORY_UPDATED_EVENT ||
      event?.type === SITE_SETTINGS_UPDATED_EVENT ||
      event?.type === BLOG_POSTS_UPDATED_EVENT
    ) {
      localChangeVersion += 1;
    }

    schedulePush();
  };

  window.addEventListener(PRODUCT_UPDATED_EVENT, handleChange);

  window.addEventListener(CATEGORY_UPDATED_EVENT, handleChange);

  window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleChange);

  window.addEventListener(BLOG_POSTS_UPDATED_EVENT, handleChange);

  hydrateProducts().catch((error) => {
    console.warn(
      "[sharedDataSync] Catalog hydration:",
      error?.message || error
    );
  });

  pullSnapshot();

  refreshTimer = window.setInterval(pullSnapshot, POLL_INTERVAL);

  return () => {
    window.clearInterval(refreshTimer);

    window.clearTimeout(pushTimer);

    window.removeEventListener(PRODUCT_UPDATED_EVENT, handleChange);

    window.removeEventListener(CATEGORY_UPDATED_EVENT, handleChange);

    window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleChange);

    window.removeEventListener(BLOG_POSTS_UPDATED_EVENT, handleChange);

    started = false;
  };
};
