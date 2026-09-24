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

const parseTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : NaN;

  return Number.isFinite(timestamp) ? timestamp : 0;
};

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
const mergeBlogPosts = (localPosts, remotePosts) => {
  const local = Array.isArray(localPosts) ? localPosts : [];

  const remote = Array.isArray(remotePosts) ? remotePosts : [];

  const result = [];

  const indexByIdentity = new Map();

  const getIdentity = (post) => {
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

    const title = String(post?.title || "")
      .trim()
      .toLowerCase();

    if (title) {
      return `title:${title}`;
    }

    return "";
  };

  const addPost = (post, source) => {
    if (!post || typeof post !== "object") {
      return;
    }

    const identity = getIdentity(post);

    if (!identity) {
      result.push(post);

      return;
    }

    const existingIndex = indexByIdentity.get(identity);

    if (existingIndex === undefined) {
      indexByIdentity.set(identity, result.length);

      result.push(post);

      return;
    }

    const existing = result[existingIndex];

    const existingUpdatedAt = parseTimestamp(existing?.updatedAt);

    const nextUpdatedAt = parseTimestamp(post?.updatedAt);

    /*
     * Nếu cùng bài:
     * bản cập nhật mới hơn được giữ.
     */
    if (
      nextUpdatedAt > existingUpdatedAt ||
      (nextUpdatedAt === existingUpdatedAt && source === "remote")
    ) {
      result[existingIndex] = post;
    }
  };

  /*
   * Local trước để không làm mất dữ liệu
   * đang có trên browser.
   */
  local.forEach((post) => addPost(post, "local"));

  /*
   * Sau đó merge remote.
   */
  remote.forEach((post) => addPost(post, "remote"));

  return result;
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

    const localTime = readLastSyncedAt();

    /*
     * BACKWARD COMPATIBILITY
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
     * không coi là [].
     */
    if (!Array.isArray(snapshot.blogPosts)) {
      delete snapshot.blogPosts;
    }

    /*
     * Timestamp chỉ được dùng để bỏ qua
     * snapshot thực sự cũ.
     *
     * Blog vẫn được bảo vệ bằng merge.
     */
    if (serverTime && localTime && serverTime <= localTime) {
      return;
    }

    await applySnapshot(snapshot, payload.updatedAt);

    /*
     * Sau khi merge local + remote,
     * push lại snapshot hợp nhất.
     *
     * Điều này bảo vệ các bài viết cũ
     * chưa có trên server.
     */
    const localBlogPosts = readBlogPosts();

    const remoteBlogPosts = Array.isArray(snapshot.blogPosts)
      ? snapshot.blogPosts
      : null;

    if (
      remoteBlogPosts !== null &&
      localBlogPosts.length > remoteBlogPosts.length
    ) {
      localChangeVersion += 1;

      schedulePush();
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
