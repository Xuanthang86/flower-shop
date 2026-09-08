import { useCallback, useEffect, useState } from "react";

export const UNSAVED_CHANGES_KEY = "flower-shop-unsaved-changes";

export const UNSAVED_CHANGES_EVENT = "flower-shop-unsaved-changes-updated";

export const markUnsavedChanges = () => {
  try {
    localStorage.setItem(UNSAVED_CHANGES_KEY, "1");
  } catch {}

  window.dispatchEvent(new Event(UNSAVED_CHANGES_EVENT));
};

export const clearUnsavedChanges = () => {
  try {
    localStorage.removeItem(UNSAVED_CHANGES_KEY);
  } catch {}

  window.dispatchEvent(new Event(UNSAVED_CHANGES_EVENT));
};

export const hasUnsavedChanges = () => {
  try {
    return Boolean(localStorage.getItem(UNSAVED_CHANGES_KEY));
  } catch {
    return false;
  }
};

export const useUnsavedChanges = (enabled = false) => {
  useEffect(() => {
    if (enabled) {
      markUnsavedChanges();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [enabled]);

  return {
    mark: markUnsavedChanges,
    clear: clearUnsavedChanges,
  };
};

const UnsavedChangesGuard = () => {
  const [dirty, setDirty] = useState(hasUnsavedChanges());

  const [pendingHref, setPendingHref] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setDirty(hasUnsavedChanges());
    };

    window.addEventListener(UNSAVED_CHANGES_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(UNSAVED_CHANGES_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const handleClick = (event) => {
      if (!hasUnsavedChanges() || pendingHref) {
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target.closest?.("a[href]");

      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      const href = anchor.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const url = new URL(href, window.location.origin);

      if (url.origin !== window.location.origin) {
        return;
      }

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setPendingHref(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pendingHref]);

  const cancel = useCallback(() => {
    setPendingHref(null);
  }, []);

  const leave = useCallback(() => {
    if (!pendingHref) {
      return;
    }

    const target = pendingHref;

    clearUnsavedChanges();

    setPendingHref(null);

    window.location.assign(target);
  }, [pendingHref]);

  if (!dirty || !pendingHref) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Nội dung chưa được lưu
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Nội dung đang chỉnh sửa chưa được lưu. Bạn có muốn chuyển trang hay
            không?
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              Ở lại
            </button>

            <button
              type="button"
              onClick={leave}
              className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              Chuyển trang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesGuard;
