import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminManagementBackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/admin")}
      className="relative top-2 my-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-[#fffdfa] px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <FiArrowLeft size={17} />
      <span>Quay lại Khu vực quản lý</span>
    </button>
  );
};

export default AdminManagementBackButton;
