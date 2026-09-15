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
  readSiteSettings,
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

const readSnapshot = async () => {
  await hydrateProducts();

  return {
    products: readProducts(),
    categories: readCategories(),
    settings: readSiteSettings(),
  };
};

const readLastSyncedAt = () => {
  try {
    const value = localStorage.getItem(SYNC_TIMESTAMP_KEY);

    return value ? new Date(value).getTime() : 0;
  } catch {
    return 0;
  }
};

const writeLastSyncedAt = (updatedAt) => {
  if (!updatedAt) return;

  try {
    localStorage.setItem(SYNC_TIMESTAMP_KEY, updatedAt);
  } catch (error) {
    console.warn("[sharedDataSync] Không thể lưu thời điểm đồng bộ:", error);
  }
};

const applySnapshot = async (snapshot, updatedAt) => {
  if (!snapshot || typeof snapshot !== "object") {
    return;
  }

  applyingRemote = true;

  try {
    if (Array.isArray(snapshot.products)) {
      await applyRemoteProducts(snapshot.products, updatedAt);
    }

    if (Array.isArray(snapshot.categories)) {
      localStorage.setItem(
        PRODUCT_CATEGORIES_STORAGE_KEY,
        JSON.stringify(snapshot.categories)
      );

      dispatch(CATEGORY_UPDATED_EVENT);
    }

    if (snapshot.settings && typeof snapshot.settings === "object") {
      localStorage.setItem(
        SITE_SETTINGS_STORAGE_KEY,
        JSON.stringify(snapshot.settings)
      );

      dispatch(SITE_SETTINGS_UPDATED_EVENT);
    }

    writeLastSyncedAt(updatedAt);
  } finally {
    applyingRemote = false;
  }
};

const fetchSnapshot = async () => {
  const response = await fetch(`${API_BASE_URL}/data/snapshot`, {
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể tải dữ liệu dùng chung.");
  }

  return payload;
};

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

const pullSnapshot = async () => {
  if (pushing || applyingRemote) {
    return;
  }

  try {
    const payload = await fetchSnapshot();

    if (payload?.initialized === false) {
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

    if (serverTime && localTime && serverTime <= localTime) {
      return;
    }

    await applySnapshot(payload.snapshot, payload.updatedAt);

    /*
     * Nếu trong lúc pull local đã phát sinh mutation mới, không để remote
     * snapshot trở thành điểm kết thúc của chuỗi đồng bộ. Push lại catalog
     * mới sau khi merge conflict tại Catalog.
     */
    if (lastPushedChangeVersion !== localChangeVersion) {
      schedulePush();
    }
  } catch (error) {
    console.warn("[sharedDataSync] Pull:", error?.message || error);
  }
};

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

    schedulePush();
  };

  window.addEventListener(PRODUCT_UPDATED_EVENT, handleChange);

  window.addEventListener(CATEGORY_UPDATED_EVENT, handleChange);

  window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleChange);

  /*
   * Đảm bảo Catalog hydrate trước khi remote snapshot có cơ hội push/pull
   * dữ liệu, tránh seed/default memory trở thành snapshot remote ngoài ý muốn.
   */
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

    started = false;
  };
};
