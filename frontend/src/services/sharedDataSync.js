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

/*
 * ============================================================
 * READ SNAPSHOT
 * ============================================================
 *
 * Blog được đọc từ kho riêng.
 *
 * Không đưa blogPosts vào settings.
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
     * --------------------------------------------------------
     * PRODUCTS
     * --------------------------------------------------------
     */
    if (Array.isArray(snapshot.products)) {
      await applyRemoteProducts(snapshot.products, updatedAt);
    }

    /*
     * --------------------------------------------------------
     * CATEGORIES
     * --------------------------------------------------------
     */
    if (Array.isArray(snapshot.categories)) {
      localStorage.setItem(
        PRODUCT_CATEGORIES_STORAGE_KEY,
        JSON.stringify(snapshot.categories)
      );

      dispatch(CATEGORY_UPDATED_EVENT);
    }

    /*
     * --------------------------------------------------------
     * SITE SETTINGS
     * --------------------------------------------------------
     *
     * Tuyệt đối không để remote snapshot ghi đè blog.
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

        /*
         * Blog không thuộc site settings.
         */
        blogPosts: [],
      };

      localStorage.setItem(
        SITE_SETTINGS_STORAGE_KEY,
        JSON.stringify(mergedSettings)
      );

      dispatch(SITE_SETTINGS_UPDATED_EVENT);
    }

    /*
     * --------------------------------------------------------
     * BLOG POSTS
     * --------------------------------------------------------
     *
     * Đây là phần sửa lỗi mất bài viết.
     *
     * Phiên bản backend mới trả:
     *
     * snapshot.blogPosts
     *
     * nhưng vẫn hỗ trợ phiên bản backend cũ:
     *
     * payload.blogPosts
     */
    const remoteBlogPosts = Array.isArray(snapshot.blogPosts)
      ? snapshot.blogPosts
      : null;

    /*
     * Nếu snapshot không chứa blogPosts,
     * không được hiểu là server đang có [].
     *
     * Điều này rất quan trọng để tránh xóa blog local.
     */
    if (remoteBlogPosts !== null) {
      const currentBlogPosts = readBlogPosts();

      /*
       * Nếu server có bài viết:
       * nhận dữ liệu server.
       */
      if (remoteBlogPosts.length > 0) {
        try {
          localStorage.setItem(
            BLOG_POSTS_STORAGE_KEY,
            JSON.stringify(remoteBlogPosts)
          );

          dispatch(BLOG_POSTS_UPDATED_EVENT);
        } catch (error) {
          console.warn("[sharedDataSync] Không thể lưu blog snapshot:", error);
        }
      }

      /*
       * Nếu server trả []:
       *
       * - local có bài -> KHÔNG xóa local.
       * - local cũng không có -> giữ [].
       *
       * Mục đích:
       * không để một snapshot server chưa có blog
       * vô tình xóa bài viết đang có trên trình duyệt.
       */
      if (remoteBlogPosts.length === 0 && currentBlogPosts.length === 0) {
        try {
          localStorage.setItem(BLOG_POSTS_STORAGE_KEY, "[]");
        } catch (error) {
          console.warn("[sharedDataSync] Không thể khởi tạo blog rỗng:", error);
        }
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
       * Không xóa dữ liệu local.
       * Đẩy local lên server.
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
     * ========================================================
     * BLOG BACKWARD COMPATIBILITY
     * ========================================================
     *
     * Backend mới:
     * payload.snapshot.blogPosts
     *
     * Backend cũ:
     * payload.blogPosts
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
     * Nếu server chưa có blog nhưng local đang có,
     * giữ local và push ngược lên server.
     */
    const localBlogPostsBeforePull = readBlogPosts();

    const remoteBlogPosts = Array.isArray(snapshot.blogPosts)
      ? snapshot.blogPosts
      : null;

    const shouldRestoreLocalBlogToServer =
      localBlogPostsBeforePull.length > 0 &&
      remoteBlogPosts !== null &&
      remoteBlogPosts.length === 0;

    /*
     * Nếu server chưa trả blogPosts:
     * tuyệt đối không xem đó là [].
     */
    if (remoteBlogPosts === null) {
      delete snapshot.blogPosts;
    }

    /*
     * Chỉ bỏ qua snapshot khi timestamp server cũ hơn
     * timestamp local đã đồng bộ.
     */
    if (
      serverTime &&
      localTime &&
      serverTime <= localTime &&
      !shouldRestoreLocalBlogToServer
    ) {
      return;
    }

    await applySnapshot(snapshot, payload.updatedAt);

    /*
     * Nếu local có blog còn server chưa có:
     * giữ local và đẩy lại lên server.
     */
    if (shouldRestoreLocalBlogToServer) {
      localChangeVersion += 1;
    }

    if (
      shouldRestoreLocalBlogToServer ||
      lastPushedChangeVersion !== localChangeVersion
    ) {
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
 * START SHARED DATA SYNC
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

    /*
     * Blog, category và settings cũng phải tạo
     * một phiên bản thay đổi mới để snapshot
     * được push lên server.
     */
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

  /*
   * Đảm bảo Catalog hydrate trước khi remote snapshot
   * có cơ hội push/pull dữ liệu.
   */
  hydrateProducts().catch((error) => {
    console.warn(
      "[sharedDataSync] Catalog hydration:",
      error?.message || error
    );
  });

  /*
   * Pull dữ liệu ngay khi app khởi động.
   */
  pullSnapshot();

  /*
   * Sau đó kiểm tra định kỳ.
   */
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
