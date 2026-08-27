// import sweetRose from "@/assets/images/products/sweet-rose.jpg";
// import lovelyTulip from "@/assets/images/products/lovely-tulip.jpg";
// import whiteLily from "@/assets/images/products/white-lily.jpg";
// import sunflower from "@/assets/images/products/sunflower.jpg";

// export const PRODUCT_CATEGORIES = [
//   {
//     id: 1,
//     name: "Hoa khai trương",
//     slug: "hoa-khai-truong",
//   },
//   {
//     id: 2,
//     name: "Hoa sinh nhật",
//     slug: "hoa-sinh-nhat",
//   },
//   {
//     id: 3,
//     name: "Hoa cưới",
//     slug: "hoa-cuoi",
//   },
//   {
//     id: 4,
//     name: "Hoa tốt nghiệp",
//     slug: "hoa-tot-nghiep",
//   },
//   {
//     id: 5,
//     name: "Hoa chia buồn",
//     slug: "hoa-chia-buon",
//   },
// ];

// export const products = [
//   /* =====================================================
//      HOA SINH NHẬT
//   ===================================================== */

//   {
//     id: 1,
//     name: "Sweet Rose",
//     category: "hoa-sinh-nhat",
//     price: 450000,
//     oldPrice: 500000,
//     badge: "Bán chạy",
//     image: sweetRose,
//     description:
//       "Bó hoa hồng Sweet Rose mang vẻ đẹp ngọt ngào, tinh tế, thích hợp làm quà tặng sinh nhật.",
//     sold: 128,
//     isNew: false,
//   },

//   {
//     id: 2,
//     name: "Lovely Tulip",
//     category: "hoa-sinh-nhat",
//     price: 520000,
//     oldPrice: 590000,
//     badge: "Mới",
//     image: lovelyTulip,
//     description:
//       "Bó tulip Lovely Tulip với màu sắc nhẹ nhàng, phù hợp dành tặng người thân và bạn bè trong ngày sinh nhật.",
//     sold: 96,
//     isNew: true,
//   },

//   {
//     id: 3,
//     name: "White Lily",
//     category: "hoa-sinh-nhat",
//     price: 650000,
//     oldPrice: null,
//     badge: "Nổi bật",
//     image: whiteLily,
//     description:
//       "Hoa lily trắng thanh lịch, mang đến vẻ đẹp tinh khôi và sang trọng.",
//     sold: 84,
//     isNew: false,
//   },

//   {
//     id: 4,
//     name: "Sunflower",
//     category: "hoa-sinh-nhat",
//     price: 390000,
//     oldPrice: 450000,
//     badge: "-13%",
//     image: sunflower,
//     description:
//       "Bó hoa hướng dương rực rỡ, mang thông điệp vui vẻ, lạc quan và yêu thương.",
//     sold: 112,
//     isNew: false,
//   },

//   {
//     id: 5,
//     name: "Pink Love",
//     category: "hoa-sinh-nhat",
//     price: 480000,
//     oldPrice: 550000,
//     badge: "-13%",
//     image: sweetRose,
//     description:
//       "Bó hoa hồng hồng dịu dàng dành tặng những người bạn yêu thương.",
//     sold: 76,
//     isNew: false,
//   },

//   {
//     id: 6,
//     name: "Birthday Dream",
//     category: "hoa-sinh-nhat",
//     price: 560000,
//     oldPrice: null,
//     badge: "Mới",
//     image: lovelyTulip,
//     description:
//       "Thiết kế hoa sinh nhật trẻ trung với màu sắc nổi bật và tươi sáng.",
//     sold: 68,
//     isNew: true,
//   },

//   {
//     id: 7,
//     name: "Sweet Lily",
//     category: "hoa-sinh-nhat",
//     price: 620000,
//     oldPrice: 690000,
//     badge: "Nổi bật",
//     image: whiteLily,
//     description: "Lily trắng kết hợp phong cách trang trí hiện đại, tinh tế.",
//     sold: 61,
//     isNew: false,
//   },

//   {
//     id: 8,
//     name: "Sunny Birthday",
//     category: "hoa-sinh-nhat",
//     price: 430000,
//     oldPrice: 490000,
//     badge: "-12%",
//     image: sunflower,
//     description:
//       "Hoa hướng dương tươi sáng dành cho những buổi tiệc sinh nhật đáng nhớ.",
//     sold: 59,
//     isNew: false,
//   },

//   /* =====================================================
//      HOA KHAI TRƯƠNG
//   ===================================================== */

//   {
//     id: 9,
//     name: "Golden Opening",
//     category: "hoa-khai-truong",
//     price: 850000,
//     oldPrice: 950000,
//     badge: "Bán chạy",
//     image: sunflower,
//     description:
//       "Kệ hoa khai trương sang trọng, mang ý nghĩa phát tài và thành công.",
//     sold: 145,
//     isNew: false,
//   },

//   {
//     id: 10,
//     name: "Grand Success",
//     category: "hoa-khai-truong",
//     price: 990000,
//     oldPrice: 1100000,
//     badge: "Mới",
//     image: sweetRose,
//     description:
//       "Kệ hoa khai trương nổi bật với thiết kế cao cấp, phù hợp cho cửa hàng và doanh nghiệp.",
//     sold: 103,
//     isNew: true,
//   },

//   {
//     id: 11,
//     name: "Lucky Bloom",
//     category: "hoa-khai-truong",
//     price: 780000,
//     oldPrice: null,
//     badge: "Nổi bật",
//     image: lovelyTulip,
//     description: "Mẫu hoa khai trương trẻ trung, sang trọng và nhiều màu sắc.",
//     sold: 89,
//     isNew: false,
//   },

//   {
//     id: 12,
//     name: "Prosperity",
//     category: "hoa-khai-truong",
//     price: 920000,
//     oldPrice: 1050000,
//     badge: "-12%",
//     image: sunflower,
//     description: "Kệ hoa mang thông điệp thịnh vượng và phát triển.",
//     sold: 81,
//     isNew: false,
//   },

//   {
//     id: 13,
//     name: "Business Start",
//     category: "hoa-khai-truong",
//     price: 880000,
//     oldPrice: null,
//     badge: "Mới",
//     image: whiteLily,
//     description:
//       "Mẫu hoa khai trương thanh lịch dành cho các sự kiện quan trọng.",
//     sold: 73,
//     isNew: true,
//   },

//   {
//     id: 14,
//     name: "Success Garden",
//     category: "hoa-khai-truong",
//     price: 1050000,
//     oldPrice: 1180000,
//     badge: "Bán chạy",
//     image: sweetRose,
//     description: "Thiết kế hoa khai trương cao cấp với màu sắc sang trọng.",
//     sold: 120,
//     isNew: false,
//   },

//   {
//     id: 15,
//     name: "Happy Opening",
//     category: "hoa-khai-truong",
//     price: 760000,
//     oldPrice: 850000,
//     badge: "-11%",
//     image: sunflower,
//     description: "Mẫu hoa khai trương rực rỡ và nổi bật.",
//     sold: 64,
//     isNew: false,
//   },

//   {
//     id: 16,
//     name: "Premium Opening",
//     category: "hoa-khai-truong",
//     price: 1250000,
//     oldPrice: null,
//     badge: "Nổi bật",
//     image: lovelyTulip,
//     description: "Kệ hoa khai trương cao cấp dành cho những dịp đặc biệt.",
//     sold: 57,
//     isNew: false,
//   },

//   /* =====================================================
//      HOA CƯỚI
//   ===================================================== */

//   {
//     id: 17,
//     name: "Wedding Love",
//     category: "hoa-cuoi",
//     price: 1200000,
//     oldPrice: 1350000,
//     badge: "Bán chạy",
//     image: sweetRose,
//     description: "Hoa cưới hồng nhẹ nhàng và lãng mạn dành cho cô dâu.",
//     sold: 138,
//     isNew: false,
//   },

//   {
//     id: 18,
//     name: "White Wedding",
//     category: "hoa-cuoi",
//     price: 1350000,
//     oldPrice: null,
//     badge: "Mới",
//     image: whiteLily,
//     description: "Bó hoa cưới trắng tinh khôi với phong cách thanh lịch.",
//     sold: 97,
//     isNew: true,
//   },

//   {
//     id: 19,
//     name: "Romantic Tulip",
//     category: "hoa-cuoi",
//     price: 1100000,
//     oldPrice: 1250000,
//     badge: "-12%",
//     image: lovelyTulip,
//     description: "Hoa cưới tulip mang phong cách hiện đại và lãng mạn.",
//     sold: 91,
//     isNew: false,
//   },

//   {
//     id: 20,
//     name: "Wedding Sunshine",
//     category: "hoa-cuoi",
//     price: 980000,
//     oldPrice: null,
//     badge: "Nổi bật",
//     image: sunflower,
//     description:
//       "Hoa cưới mang sắc vàng tươi sáng, tạo điểm nhấn cho ngày trọng đại.",
//     sold: 85,
//     isNew: false,
//   },

//   /* =====================================================
//      HOA TỐT NGHIỆP
//   ===================================================== */

//   {
//     id: 21,
//     name: "Congratulations",
//     category: "hoa-tot-nghiep",
//     price: 420000,
//     oldPrice: 480000,
//     badge: "Bán chạy",
//     image: sunflower,
//     description: "Bó hoa tốt nghiệp rực rỡ dành tặng bạn bè và người thân.",
//     sold: 131,
//     isNew: false,
//   },

//   {
//     id: 22,
//     name: "Graduate Rose",
//     category: "hoa-tot-nghiep",
//     price: 450000,
//     oldPrice: null,
//     badge: "Mới",
//     image: sweetRose,
//     description: "Hoa hồng tốt nghiệp với thiết kế trẻ trung.",
//     sold: 88,
//     isNew: true,
//   },

//   {
//     id: 23,
//     name: "Future Bloom",
//     category: "hoa-tot-nghiep",
//     price: 490000,
//     oldPrice: 550000,
//     badge: "-11%",
//     image: lovelyTulip,
//     description:
//       "Mẫu hoa tốt nghiệp mang thông điệp về một tương lai tươi sáng.",
//     sold: 72,
//     isNew: false,
//   },

//   {
//     id: 24,
//     name: "White Graduation",
//     category: "hoa-tot-nghiep",
//     price: 520000,
//     oldPrice: null,
//     badge: "Nổi bật",
//     image: whiteLily,
//     description: "Hoa tốt nghiệp thanh lịch, tinh tế.",
//     sold: 69,
//     isNew: false,
//   },

//   /* =====================================================
//      HOA CHIA BUỒN
//   ===================================================== */

//   {
//     id: 25,
//     name: "Peaceful White",
//     category: "hoa-chia-buon",
//     price: 750000,
//     oldPrice: 850000,
//     badge: "Bán chạy",
//     image: whiteLily,
//     description: "Kệ hoa chia buồn mang vẻ đẹp trang nghiêm và thanh khiết.",
//     sold: 106,
//     isNew: false,
//   },

//   {
//     id: 26,
//     name: "Silent Rose",
//     category: "hoa-chia-buon",
//     price: 680000,
//     oldPrice: null,
//     badge: "Mới",
//     image: sweetRose,
//     description: "Mẫu hoa chia buồn trang nhã và tinh tế.",
//     sold: 74,
//     isNew: true,
//   },

//   {
//     id: 27,
//     name: "Memory Lily",
//     category: "hoa-chia-buon",
//     price: 820000,
//     oldPrice: 900000,
//     badge: "-9%",
//     image: whiteLily,
//     description: "Hoa lily trắng thể hiện sự tưởng nhớ và thành kính.",
//     sold: 63,
//     isNew: false,
//   },

//   {
//     id: 28,
//     name: "Eternal Sympathy",
//     category: "hoa-chia-buon",
//     price: 900000,
//     oldPrice: null,
//     badge: "Nổi bật",
//     image: lovelyTulip,
//     description: "Kệ hoa chia buồn với thiết kế trang trọng.",
//     sold: 58,
//     isNew: false,
//   },
// ];

import sweetRose from "@/assets/images/products/sweet-rose.jpg";
import lovelyTulip from "@/assets/images/products/lovely-tulip.jpg";
import whiteLily from "@/assets/images/products/white-lily.jpg";
import sunflower from "@/assets/images/products/sunflower.jpg";

/*
==========================================================
DANH MỤC SẢN PHẨM
==========================================================
*/

export const PRODUCT_CATEGORIES = [
  {
    id: 1,
    name: "Hoa khai trương",
    slug: "hoa-khai-truong",
  },
  {
    id: 2,
    name: "Hoa sinh nhật",
    slug: "hoa-sinh-nhat",
  },
  {
    id: 3,
    name: "Hoa cưới",
    slug: "hoa-cuoi",
  },
  {
    id: 4,
    name: "Hoa tốt nghiệp",
    slug: "hoa-tot-nghiep",
  },
  {
    id: 5,
    name: "Hoa chia buồn",
    slug: "hoa-chia-buon",
  },
];

/*
==========================================================
SẢN PHẨM
==========================================================

QUAN TRỌNG:

product.category phải dùng SLUG.

Ví dụ:

category: "hoa-sinh-nhat"

Không dùng:

category: 2
==========================================================
*/

export const products = [
  /*
  ========================================================
  HOA SINH NHẬT
  ========================================================
  */

  {
    id: 1,
    name: "Sweet Rose",
    category: "hoa-sinh-nhat",
    price: 450000,
    oldPrice: 500000,
    badge: "Bán chạy",
    image: sweetRose,
    description:
      "Bó hoa hồng Sweet Rose mang vẻ đẹp ngọt ngào, tinh tế, thích hợp làm quà tặng sinh nhật.",
    salesCount: 128,
    isNew: false,
  },

  {
    id: 2,
    name: "Lovely Tulip",
    category: "hoa-sinh-nhat",
    price: 520000,
    oldPrice: 590000,
    badge: "Mới",
    image: lovelyTulip,
    description:
      "Bó tulip Lovely Tulip với màu sắc nhẹ nhàng, phù hợp dành tặng người thân và bạn bè trong ngày sinh nhật.",
    salesCount: 96,
    isNew: true,
  },

  {
    id: 3,
    name: "White Lily",
    category: "hoa-sinh-nhat",
    price: 650000,
    oldPrice: null,
    badge: "Nổi bật",
    image: whiteLily,
    description:
      "Hoa lily trắng thanh lịch, mang đến vẻ đẹp tinh khôi và sang trọng.",
    salesCount: 84,
    isNew: false,
  },

  {
    id: 4,
    name: "Sunflower",
    category: "hoa-sinh-nhat",
    price: 390000,
    oldPrice: 450000,
    badge: "-13%",
    image: sunflower,
    description:
      "Bó hoa hướng dương rực rỡ, mang thông điệp vui vẻ, lạc quan và yêu thương.",
    salesCount: 112,
    isNew: false,
  },

  {
    id: 5,
    name: "Pink Love",
    category: "hoa-sinh-nhat",
    price: 480000,
    oldPrice: 550000,
    badge: "-13%",
    image: sweetRose,
    description:
      "Bó hoa hồng hồng dịu dàng dành tặng những người bạn yêu thương.",
    salesCount: 76,
    isNew: false,
  },

  {
    id: 6,
    name: "Birthday Dream",
    category: "hoa-sinh-nhat",
    price: 560000,
    oldPrice: null,
    badge: "Mới",
    image: lovelyTulip,
    description:
      "Thiết kế hoa sinh nhật trẻ trung với màu sắc nổi bật và tươi sáng.",
    salesCount: 68,
    isNew: true,
  },

  {
    id: 7,
    name: "Sweet Lily",
    category: "hoa-sinh-nhat",
    price: 620000,
    oldPrice: 690000,
    badge: "Nổi bật",
    image: whiteLily,
    description: "Lily trắng kết hợp phong cách trang trí hiện đại, tinh tế.",
    salesCount: 61,
    isNew: false,
  },

  {
    id: 8,
    name: "Sunny Birthday",
    category: "hoa-sinh-nhat",
    price: 430000,
    oldPrice: 490000,
    badge: "-12%",
    image: sunflower,
    description:
      "Hoa hướng dương tươi sáng dành cho những buổi tiệc sinh nhật đáng nhớ.",
    salesCount: 59,
    isNew: false,
  },

  /*
  ========================================================
  HOA KHAI TRƯƠNG
  ========================================================
  */

  {
    id: 9,
    name: "Golden Opening",
    category: "hoa-khai-truong",
    price: 850000,
    oldPrice: 950000,
    badge: "Bán chạy",
    image: sunflower,
    description:
      "Kệ hoa khai trương sang trọng, mang ý nghĩa phát tài và thành công.",
    salesCount: 145,
    isNew: false,
  },

  {
    id: 10,
    name: "Grand Success",
    category: "hoa-khai-truong",
    price: 990000,
    oldPrice: 1100000,
    badge: "Mới",
    image: sweetRose,
    description:
      "Kệ hoa khai trương nổi bật với thiết kế cao cấp, phù hợp cho cửa hàng và doanh nghiệp.",
    salesCount: 103,
    isNew: true,
  },

  {
    id: 11,
    name: "Lucky Bloom",
    category: "hoa-khai-truong",
    price: 780000,
    oldPrice: null,
    badge: "Nổi bật",
    image: lovelyTulip,
    description: "Mẫu hoa khai trương trẻ trung, sang trọng và nhiều màu sắc.",
    salesCount: 89,
    isNew: false,
  },

  {
    id: 12,
    name: "Prosperity",
    category: "hoa-khai-truong",
    price: 920000,
    oldPrice: 1050000,
    badge: "-12%",
    image: sunflower,
    description: "Kệ hoa mang thông điệp thịnh vượng và phát triển.",
    salesCount: 81,
    isNew: false,
  },

  {
    id: 13,
    name: "Business Start",
    category: "hoa-khai-truong",
    price: 880000,
    oldPrice: null,
    badge: "Mới",
    image: whiteLily,
    description:
      "Mẫu hoa khai trương thanh lịch dành cho các sự kiện quan trọng.",
    salesCount: 73,
    isNew: true,
  },

  {
    id: 14,
    name: "Success Garden",
    category: "hoa-khai-truong",
    price: 1050000,
    oldPrice: 1180000,
    badge: "Bán chạy",
    image: sweetRose,
    description: "Thiết kế hoa khai trương cao cấp với màu sắc sang trọng.",
    salesCount: 120,
    isNew: false,
  },

  {
    id: 15,
    name: "Happy Opening",
    category: "hoa-khai-truong",
    price: 760000,
    oldPrice: 850000,
    badge: "-11%",
    image: sunflower,
    description: "Mẫu hoa khai trương rực rỡ và nổi bật.",
    salesCount: 64,
    isNew: false,
  },

  {
    id: 16,
    name: "Premium Opening",
    category: "hoa-khai-truong",
    price: 1250000,
    oldPrice: null,
    badge: "Nổi bật",
    image: lovelyTulip,
    description: "Kệ hoa khai trương cao cấp dành cho những dịp đặc biệt.",
    salesCount: 57,
    isNew: false,
  },

  /*
  ========================================================
  HOA CƯỚI
  ========================================================
  */

  {
    id: 17,
    name: "Wedding Love",
    category: "hoa-cuoi",
    price: 1200000,
    oldPrice: 1350000,
    badge: "Bán chạy",
    image: sweetRose,
    description: "Hoa cưới hồng nhẹ nhàng và lãng mạn dành cho cô dâu.",
    salesCount: 138,
    isNew: false,
  },

  {
    id: 18,
    name: "White Wedding",
    category: "hoa-cuoi",
    price: 1350000,
    oldPrice: null,
    badge: "Mới",
    image: whiteLily,
    description: "Bó hoa cưới trắng tinh khôi với phong cách thanh lịch.",
    salesCount: 97,
    isNew: true,
  },

  {
    id: 19,
    name: "Romantic Tulip",
    category: "hoa-cuoi",
    price: 1100000,
    oldPrice: 1250000,
    badge: "-12%",
    image: lovelyTulip,
    description: "Hoa cưới tulip mang phong cách hiện đại và lãng mạn.",
    salesCount: 91,
    isNew: false,
  },

  {
    id: 20,
    name: "Wedding Sunshine",
    category: "hoa-cuoi",
    price: 980000,
    oldPrice: null,
    badge: "Nổi bật",
    image: sunflower,
    description:
      "Hoa cưới mang sắc vàng tươi sáng, tạo điểm nhấn cho ngày trọng đại.",
    salesCount: 85,
    isNew: false,
  },

  /*
  ========================================================
  HOA TỐT NGHIỆP
  ========================================================
  */

  {
    id: 21,
    name: "Congratulations",
    category: "hoa-tot-nghiep",
    price: 420000,
    oldPrice: 480000,
    badge: "Bán chạy",
    image: sunflower,
    description: "Bó hoa tốt nghiệp rực rỡ dành tặng bạn bè và người thân.",
    salesCount: 131,
    isNew: false,
  },

  {
    id: 22,
    name: "Graduate Rose",
    category: "hoa-tot-nghiep",
    price: 450000,
    oldPrice: null,
    badge: "Mới",
    image: sweetRose,
    description: "Hoa hồng tốt nghiệp với thiết kế trẻ trung.",
    salesCount: 88,
    isNew: true,
  },

  {
    id: 23,
    name: "Future Bloom",
    category: "hoa-tot-nghiep",
    price: 490000,
    oldPrice: 550000,
    badge: "-11%",
    image: lovelyTulip,
    description:
      "Mẫu hoa tốt nghiệp mang thông điệp về một tương lai tươi sáng.",
    salesCount: 72,
    isNew: false,
  },

  {
    id: 24,
    name: "White Graduation",
    category: "hoa-tot-nghiep",
    price: 520000,
    oldPrice: null,
    badge: "Nổi bật",
    image: whiteLily,
    description: "Hoa tốt nghiệp thanh lịch, tinh tế.",
    salesCount: 69,
    isNew: false,
  },

  /*
  ========================================================
  HOA CHIA BUỒN
  ========================================================
  */

  {
    id: 25,
    name: "Peaceful White",
    category: "hoa-chia-buon",
    price: 750000,
    oldPrice: 850000,
    badge: "Bán chạy",
    image: whiteLily,
    description: "Kệ hoa chia buồn mang vẻ đẹp trang nghiêm và thanh khiết.",
    salesCount: 106,
    isNew: false,
  },

  {
    id: 26,
    name: "Silent Rose",
    category: "hoa-chia-buon",
    price: 680000,
    oldPrice: null,
    badge: "Mới",
    image: sweetRose,
    description: "Mẫu hoa chia buồn trang nhã và tinh tế.",
    salesCount: 74,
    isNew: true,
  },

  {
    id: 27,
    name: "Memory Lily",
    category: "hoa-chia-buon",
    price: 820000,
    oldPrice: 900000,
    badge: "-9%",
    image: whiteLily,
    description: "Hoa lily trắng thể hiện sự tưởng nhớ và thành kính.",
    salesCount: 63,
    isNew: false,
  },

  {
    id: 28,
    name: "Eternal Sympathy",
    category: "hoa-chia-buon",
    price: 900000,
    oldPrice: null,
    badge: "Nổi bật",
    image: lovelyTulip,
    description: "Kệ hoa chia buồn với thiết kế trang trọng.",
    salesCount: 58,
    isNew: false,
  },
];
