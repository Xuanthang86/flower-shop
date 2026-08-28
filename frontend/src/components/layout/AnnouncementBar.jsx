/*
============================================================
FLOWER SHOP — ANNOUNCEMENT BAR
============================================================

CẬP NHẬT:
- Hiển thị nhiều thông báo nổi bật.
- Chạy ngang liên tục.
- Không dùng <marquee>.
- Không dùng setInterval.
- Dừng khi người dùng hover.
- Hỗ trợ prefers-reduced-motion.
- Không chứa dữ liệu danh mục/sản phẩm.
============================================================
*/

import Container from "@/components/common/Container";

const ANNOUNCEMENTS = [
  "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
  "🚚 Đặt trước 14h — giao hoa trong ngày",
  "💐 Hoa tươi được tuyển chọn mỗi ngày",
  "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
];

const AnnouncementBar = () => {
  const renderMessages = (group) =>
    ANNOUNCEMENTS.map((message, index) => (
      <span key={`${group}-${index}`} className="announcement-item">
        {message}
        <span className="announcement-separator" aria-hidden="true">
          •
        </span>
      </span>
    ));

  return (
    <div className="announcement-bar" aria-label="Thông báo nổi bật">
      <Container className="announcement-container">
        <div className="announcement-viewport">
          <div className="announcement-track">
            <div className="announcement-group">{renderMessages("first")}</div>

            <div className="announcement-group" aria-hidden="true">
              {renderMessages("second")}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AnnouncementBar;
