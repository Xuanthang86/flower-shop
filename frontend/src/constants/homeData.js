import birthdayImage from "@/assets/images/categories/category-birthday.jpg";
import openingImage from "@/assets/images/categories/category-opening.jpg";
import weddingImage from "@/assets/images/categories/category-wedding.jpg";
import graduationImage from "@/assets/images/categories/category-graduation.jpg";
import funeralImage from "@/assets/images/categories/category-funeral.jpg";

/* =========================================================
   DANH MỤC NỔI BẬT
   ========================================================= */

export const categories = [
  {
    id: 1,
    name: "Hoa khai trương",
    slug: "hoa-khai-truong",
    image: openingImage,
  },
  {
    id: 2,
    name: "Hoa sinh nhật",
    slug: "hoa-sinh-nhat",
    image: birthdayImage,
  },
  {
    id: 3,
    name: "Hoa cưới",
    slug: "hoa-cuoi",
    image: weddingImage,
  },
  {
    id: 4,
    name: "Hoa tốt nghiệp",
    slug: "hoa-tot-nghiep",
    image: graduationImage,
  },
  {
    id: 5,
    name: "Hoa chia buồn",
    slug: "hoa-chia-buon",
    image: funeralImage,
  },
];

/* =========================================================
   SẢN PHẨM NỔI BẬT
   =========================================================

   Phần này có thể giữ lại nếu project hiện tại của bạn
   vẫn đang sử dụng featuredProducts ở nơi khác.
*/

export const featuredProducts = [
  {
    id: 1,
    name: "Sweet Rose",
    price: 450000,
    image: "/images/flower1.jpg",
  },
  {
    id: 2,
    name: "Lovely Tulip",
    price: 520000,
    image: "/images/flower2.jpg",
  },
  {
    id: 3,
    name: "White Lily",
    price: 650000,
    image: "/images/flower3.jpg",
  },
  {
    id: 4,
    name: "Sunflower",
    price: 390000,
    image: "/images/flower4.jpg",
  },
];
