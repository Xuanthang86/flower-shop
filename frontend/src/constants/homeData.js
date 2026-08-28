/*
============================================================
FLOWER SHOP — HOME DATA COMPATIBILITY LAYER
============================================================

Mục đích:
- Không còn là nguồn dữ liệu sản phẩm thứ hai.
- Không chứa danh mục riêng.
- Chuyển tiếp dữ liệu từ Data Layer.

TẠI SAO FILE NÀY VẪN TỒN TẠI?

Một số component cũ của project vẫn đang import:

    categories
    featuredProducts

Vì vậy file này tạm thời giữ compatibility layer để
không gây lỗi:

"The requested module ... does not provide an export named
'categories'"

Sau khi toàn bộ project chuyển sang catalog.js, file này
có thể được loại bỏ.
============================================================
*/

import { readProductCategories } from "./productCategories";

import { readProducts } from "@/services/catalog";

/*
============================================================
CATEGORIES
============================================================

Không tạo dữ liệu mới.
Chỉ đọc từ nguồn danh mục chuẩn.
============================================================
*/

export const categories = readProductCategories();

/*
============================================================
FEATURED PRODUCTS
============================================================

Không tạo bộ sản phẩm riêng.

Dữ liệu được lấy từ products.js thông qua catalog service.
============================================================
*/

export const featuredProducts = readProducts()
  .filter((product) => product?.isNew || Number(product?.salesCount || 0) > 0)
  .sort(
    (a, b) =>
      Number(b?.isNew || false) - Number(a?.isNew || false) ||
      Number(b?.salesCount || 0) - Number(a?.salesCount || 0)
  )
  .slice(0, 8);
