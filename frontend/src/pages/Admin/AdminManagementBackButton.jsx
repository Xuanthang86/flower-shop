import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminManagementBackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/admin")}
      className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
    >
      <FiArrowLeft size={17} />
      Quay lại Khu vực quản lý
    </button>
  );
};

export default AdminManagementBackButton;
