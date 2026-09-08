import { createElement, useCallback, useEffect, useState } from "react";

export const UNSAVED_CHANGES_KEY = "flower-shop-unsaved-changes";

export const UNSAVED_CHANGES_EVENT = "flower-shop-unsaved-changes-updated";

export const markUnsavedChanges = () => {
  try {
    localStorage.setItem(UNSAVED_CHANGES_KEY, "1");
  } catch (error) {
    console.error("Không thể đánh dấu nội dung chưa lưu:", error);
  }

  window.dispatchEvent(new Event(UNSAVED_CHANGES_EVENT));
};

export const clearUnsavedChanges = () => {
  try {
    localStorage.removeItem(UNSAVED_CHANGES_KEY);
  } catch (error) {
    console.error("Không thể xóa trạng thái nội dung chưa lưu:", error);
  }

  window.dispatchEvent(new Event(UNSAVED_CHANGES_EVENT));
};

export const hasUnsavedChanges = () => {
  try {
    return Boolean(localStorage.getItem(UNSAVED_CHANGES_KEY));
  } catch (error) {
    console.error("Không thể kiểm tra trạng thái chưa lưu:", error);

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

const modalOverlayStyle =
  "fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4";

const modalStyle = "w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl";

const iconStyle =
  "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600 text-lg font-bold";

const buttonRowStyle = "mt-6 flex justify-center gap-3";

const stayButtonStyle =
  "rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200";

const leaveButtonStyle =
  "rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700";

const UnsavedChangesGuard = () => {
  const [dirty, setDirty] = useState(hasUnsavedChanges);

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

      let url;

      try {
        url = new URL(href, window.location.origin);
      } catch (error) {
        console.error("Không thể phân tích đường dẫn:", error);

        return;
      }

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

  return createElement(
    "div",
    {
      className: modalOverlayStyle,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "unsaved-changes-title",
    },
    createElement(
      "div",
      {
        className: modalStyle,
      },
      createElement(
        "div",
        {
          className: "text-center",
        },
        createElement(
          "div",
          {
            className: iconStyle,
          },
          "!"
        ),

        createElement(
          "h2",
          {
            id: "unsaved-changes-title",
            className: "mt-4 text-lg font-bold text-gray-900",
          },
          "Nội dung chưa được lưu"
        ),

        createElement(
          "p",
          {
            className: "mt-3 text-sm leading-6 text-gray-600",
          },
          "Nội dung đang chỉnh sửa chưa được lưu. Bạn có muốn chuyển trang không?"
        ),

        createElement(
          "div",
          {
            className: buttonRowStyle,
          },
          createElement(
            "button",
            {
              type: "button",
              onClick: cancel,
              className: stayButtonStyle,
            },
            "Ở lại"
          ),

          createElement(
            "button",
            {
              type: "button",
              onClick: leave,
              className: leaveButtonStyle,
            },
            "Chuyển trang"
          )
        )
      )
    )
  );
};

export default UnsavedChangesGuard;
