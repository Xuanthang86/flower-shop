import Container from "@/components/common/Container";

const ANNOUNCEMENTS = [
  "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
  "🚚 Đặt trước 14h giao trong ngày tại khu vực áp dụng",
  "💐 Hoa tươi chọn lọc, thiết kế theo yêu cầu",
  "🎁 Tặng thiệp miễn phí cho đơn quà tặng",
];

const AnnouncementBar = () => (
  <div className="bg-pink-600 text-white overflow-hidden" aria-label="Thông báo ưu đãi">
    <Container className="h-9 flex items-center overflow-hidden">
      <div className="announcement-marquee flex min-w-max items-center whitespace-nowrap text-xs md:text-sm font-medium">
        {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center">
            <span className="px-8">{item}</span>
            <span aria-hidden="true" className="opacity-60">•</span>
          </span>
        ))}
      </div>
    </Container>
  </div>
);

export default AnnouncementBar;
