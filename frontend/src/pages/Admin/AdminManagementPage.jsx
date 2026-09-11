import {
  FiBox,
  FiImage,
  FiLayout,
  FiMail,
  FiPackage,
  FiPenTool,
  FiUser,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import { PERMISSIONS, ROLES, useAuth } from "@/context/AuthContext";

const AdminManagementPage = () => {
  const navigate = useNavigate();

  const { user, hasPermission } = useAuth();

  const isAdmin = user?.role === ROLES.ADMIN;

  const canManageOrders = isAdmin || hasPermission(PERMISSIONS.MANAGE_ORDERS);

  const canManageProducts =
    isAdmin || hasPermission(PERMISSIONS.MANAGE_PRODUCTS);

  const canManageContent = isAdmin || hasPermission(PERMISSIONS.MANAGE_CONTENT);

  const canManageBlog = isAdmin || hasPermission(PERMISSIONS.MANAGE_BLOG);

  const canManageImages = isAdmin || hasPermission(PERMISSIONS.MANAGE_IMAGES);

  const canManageContact = isAdmin || hasPermission(PERMISSIONS.MANAGE_CONTACT);

  const managementItems = [
    canManageOrders && {
      to: "/admin/orders",
      title: "Quản lý đơn hàng",
      description: "Theo dõi, xử lý và cập nhật trạng thái đơn hàng.",
      icon: FiPackage,
    },

    canManageProducts && {
      to: "/admin/products",
      title: "Quản lý sản phẩm",
      description: "Thêm, sửa, xóa và quản lý danh mục sản phẩm.",
      icon: FiBox,
    },

    canManageContent && {
      to: "/admin/content",
      title: "Quản lý nội dung website",
      description:
        "Quản lý Logo, thanh thông báo và các nội dung hiển thị trên trang chủ.",
      icon: FiLayout,
    },

    canManageBlog && {
      to: "/admin/blog",
      title: "Quản lý bài viết",
      description: "Tạo, chỉnh sửa và xóa bài viết trên website.",
      icon: FiPenTool,
    },

    canManageImages && {
      to: "/admin/images",
      title: "Quản lý hình ảnh",
      description: "Quản lý banner và hình ảnh sản phẩm.",
      icon: FiImage,
    },

    canManageContact && {
      to: "/admin/contact",
      title: "Quản lý thông tin liên hệ",
      description: "Thêm, sửa, xóa và cập nhật toàn bộ thông tin liên hệ.",
      icon: FiMail,
    },

    isAdmin && {
      to: "/admin/users",
      title: "Quản lý tài khoản",
      description: "Quản lý tài khoản quản trị và phân quyền.",
      icon: FiUser,
    },
  ].filter(Boolean);

  return (
    <section className="min-h-[calc(100vh-76px)] bg-gray-50 py-6">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="w-full">
          <header className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
              <FiPackage size={28} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Khu vực quản lý
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              Chọn chức năng bạn muốn quản lý.
            </p>
          </header>

          {managementItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {managementItems.map(({ to, title, description, icon: Icon }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className="group min-h-[190px] rounded-2xl border border-gray-100 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition group-hover:bg-pink-600 group-hover:text-white">
                    <Icon size={27} />
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-pink-600">
                    {title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold text-gray-800">
                Chưa có quyền quản lý
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Tài khoản hiện chưa được cấp quyền sử dụng module quản lý nào.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminManagementPage;
