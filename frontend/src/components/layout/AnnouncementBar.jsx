/*
============================================================
FLOWER SHOP — ANNOUNCEMENT BAR
============================================================

- Lấy nội dung từ siteSettings.js.
- Chạy ngang liên tục.
- Không dùng marquee.
- Không dùng setInterval.
- Có pause khi hover.
- Có hỗ trợ prefers-reduced-motion.
============================================================
*/

import { useEffect, useState } from "react";

import Container from "@/components/common/Container";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const AnnouncementBar = () => {
  const [messages, setMessages] = useState(
    () => readSiteSettings().announcementMessages
  );

  useEffect(() => {
    const refresh = () => {
      setMessages(readSiteSettings().announcementMessages);
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const validMessages = messages.filter(
    (message) => String(message || "").trim() !== ""
  );

  if (validMessages.length === 0) {
    return null;
  }

  const renderGroup = (group) => (
    <div className="announcement-group" aria-hidden={group !== "first"}>
      {validMessages.map((message, index) => (
        <span key={`${group}-${index}`} className="announcement-item">
          {message}

          <span className="announcement-separator" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="announcement-bar" aria-label="Thông báo nổi bật">
      <Container className="announcement-container">
        <div className="announcement-viewport">
          <div className="announcement-track">
            {renderGroup("first")}
            {renderGroup("second")}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AnnouncementBar;
