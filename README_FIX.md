# Flower Shop — Bản sửa triệt để 5 vấn đề

## 1. Các file thay thế

Chép đúng các file trong thư mục `frontend/` của dự án:

- `src/utils/password.js`
- `src/context/AuthContext.jsx`
- `src/context/AuthProvider.jsx`
- `src/components/layout/HeaderIcons.jsx`
- `src/components/layout/UserMenu.jsx`
- `src/components/orders/OrderAddress.jsx`
- `src/pages/Admin/AdminOrderDetailPage.jsx`
- `src/pages/Admin/AdminUsersPage.jsx`
- `src/routes/AppRoutes.jsx`

## 2. Cấu trúc nên dùng

```text
flower-shop/
├─ backend/
├─ database/
├─ design/
├─ docker/
├─ docs/
└─ frontend/
   ├─ public/
   └─ src/
      ├─ assets/
      ├─ components/
      │  ├─ auth/
      │  ├─ cart/
      │  ├─ checkout/
      │  ├─ common/
      │  ├─ home/
      │  ├─ layout/
      │  ├─ orders/
      │  └─ product/
      ├─ context/
      ├─ data/
      ├─ pages/
      │  ├─ Admin/
      │  ├─ Cart/
      │  ├─ Checkout/
      │  ├─ Home/
      │  ├─ Orders/
      │  ├─ ProductDetail/
      │  ├─ Products/
      │  └─ Profile/
      ├─ routes/
      └─ utils/
```

Các thư mục `hooks/` và `redux/` không dùng thì nên xóa; không nên để thư mục rỗng nếu chưa có kế hoạch sử dụng.

## 3. Quan trọng: xóa phiên đăng nhập cũ

Sau khi thay `AuthProvider.jsx`, mở DevTools → Application → Storage và xóa:

- `localStorage["flower-shop-auth"]`
- `sessionStorage["flower-shop-auth"]`

Không xóa `flower-shop-users` nếu muốn giữ tài khoản và đơn hàng demo.

## 4. Kiểm tra 5 yêu cầu

1. Tài khoản: Header hiển thị `UserMenu`; click vào tên/avatar có `Thông tin tài khoản`.
2. Số nhà: Admin order detail dùng chung `OrderAddress`, đọc cả `houseNumber`, `house_number`, `house`.
3. Logout: phiên chỉ nằm ở `sessionStorage`; đóng tab/trình duyệt không khôi phục phiên; logout xóa cả sessionStorage và localStorage key cũ.
4. Mật khẩu: tối thiểu 8 ký tự + hoa + thường + số + ký hiệu đặc biệt. Register và tạo staff đều dùng chung validator.
5. Phân quyền:
   - `admin`: toàn quyền.
   - `manager`: quản lý đơn hàng + báo cáo.
   - `product_manager`: tạo/sửa/quản lý sản phẩm.
   - `customer`: không có quyền admin.
   - `/admin/users` chỉ `admin`.
   - `/admin/orders/:orderId` yêu cầu `manage_orders`.

## 5. Cảnh báo kiến trúc

Đây vẫn là mô hình frontend/localStorage. Không được coi là hệ thống bảo mật production. Người dùng có thể sửa localStorage bằng DevTools. Khi triển khai thật cần backend/API, database, mật khẩu hash bằng Argon2/bcrypt, session/JWT/HttpOnly cookie và kiểm tra quyền ở server.
