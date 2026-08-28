/*
============================================================
FLOWER SHOP — ANNOUNCEMENT BAR
============================================================

Cập nhật:
- Nhiều thông báo nổi bật.
- Tự động chuyển nội dung.
- Không dùng marquee HTML.
- Animation nhẹ, phù hợp Header.
============================================================
*/

import { useEffect, useState } from "react";

import Container from "@/components/common/Container";

const ANNOUNCEMENTS = [
  "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
  "🚚 Đặt trước 14h — giao hoa trong ngày",
  "💐 Hoa tươi được tuyển chọn mỗi ngày",
  "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % ANNOUNCEMENTS.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="bg-pink-600 text-white overflow-hidden">
      <Container className="h-10 flex items-center justify-center text-sm">
        <div
          key={currentIndex}
          className="animate-[fadeIn_0.5s_ease-in-out] text-center px-4"
          aria-live="polite"
        >
          {ANNOUNCEMENTS[currentIndex]}
        </div>
      </Container>
    </div>
  );
};

export default AnnouncementBar;
