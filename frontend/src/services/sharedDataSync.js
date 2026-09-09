import {
  PRODUCT_STORAGE_KEY,
  PRODUCT_UPDATED_EVENT,
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let started = false;
let applyingRemote = false;
let pushTimer = null;
let refreshTimer = null;

const dispatch = (eventName) => {
  window.dispatchEvent(new Event(eventName));
};

const readSnapshot = () => ({
  products: readProducts(),
  categories: readCategories(),
  settings: readSiteSettings(),
});

const applySnapshot = (snapshot) => {
  if (!snapshot) return;

  applyingRemote = true;

  try {
    if (Array.isArray(snapshot.products)) {
      localStorage.setItem(
        PRODUCT_STORAGE_KEY,
        JSON.stringify(snapshot.products)
      );

      dispatch(PRODUCT_UPDATED_EVENT);
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
  } finally {
    applyingRemote = false;
  }
};

const fetchSnapshot = async () => {
  const response = await fetch(`${API_BASE_URL}/data/snapshot`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu dùng chung.");
  }

  return response.json();
};

const pushSnapshot = async () => {
  if (applyingRemote) return;

  const snapshot = readSnapshot();

  const response = await fetch(`${API_BASE_URL}/data/snapshot`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snapshot),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));

    throw new Error(
      payload.message || "Không thể đồng bộ dữ liệu với máy chủ."
    );
  }
};

const pullSnapshot = async () => {
  try {
    const payload = await fetchSnapshot();

    if (payload?.initialized && payload?.snapshot) {
      applySnapshot(payload.snapshot);
      return;
    }

    if (!payload?.initialized) {
      await pushSnapshot();
    }
  } catch (error) {
    console.warn("Shared data sync:", error.message);
  }
};

const schedulePush = () => {
  if (applyingRemote) return;

  window.clearTimeout(pushTimer);

  pushTimer = window.setTimeout(() => {
    pushSnapshot().catch((error) =>
      console.warn("Shared data push:", error.message)
    );
  }, 700);
};

export const startSharedDataSync = () => {
  if (started) {
    return () => {};
  }

  started = true;

  pullSnapshot();

  refreshTimer = window.setInterval(pullSnapshot, 5000);

  const handleChange = () => {
    schedulePush();
  };

  window.addEventListener(PRODUCT_UPDATED_EVENT, handleChange);

  window.addEventListener(CATEGORY_UPDATED_EVENT, handleChange);

  window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleChange);

  return () => {
    window.clearInterval(refreshTimer);

    window.clearTimeout(pushTimer);

    window.removeEventListener(PRODUCT_UPDATED_EVENT, handleChange);

    window.removeEventListener(CATEGORY_UPDATED_EVENT, handleChange);

    window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleChange);

    started = false;
  };
};
