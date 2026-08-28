import { useState } from "react";
import { FiRotateCcw, FiSave } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const FONT_OPTIONS = [
  { value: "Inter, ui-sans-serif, system-ui, sans-serif", label: "Inter / System UI" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

const AdminAppearancePage = () => {
  const { isAdmin } = useAuth();
  const { theme, setTheme, resetTheme } = useTheme();
  const [draft, setDraft] = useState(theme);
  const [message, setMessage] = useState("");

  if (!isAdmin) return <section className="min-h-[70vh] bg-gray-50 py-16 text-center"><h1 className="text-2xl font-bold text-gray-800">Không có quyền truy cập</h1><p className="mt-3 text-gray-500">Chỉ Admin mới được chỉnh sửa giao diện.</p></section>;

  const save = () => { setTheme(draft); setMessage("Đã lưu giao diện. Thay đổi được áp dụng ngay trên toàn website."); };
  const reset = () => { resetTheme(); setDraft({ primary: "#db2777", primaryHover: "#be185d", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontSize: 16, radius: 12 }); setMessage("Đã khôi phục giao diện mặc định."); };

  return <section className="min-h-screen bg-gray-50 py-10"><div className="max-w-5xl mx-auto px-4"><div className="mb-7"><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tùy chỉnh giao diện</h1><p className="mt-2 text-gray-500">Chỉnh các thiết lập cơ bản mà không cần sửa code.</p></div>{message && <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">{message}</div>}
    <div className="grid lg:grid-cols-[1fr_360px] gap-6"><div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Màu chủ đạo</label><div className="flex gap-3 items-center"><input type="color" value={draft.primary} onChange={(e) => setDraft({ ...draft, primary: e.target.value })} className="w-14 h-12 p-1 rounded-lg border" /><input value={draft.primary} onChange={(e) => setDraft({ ...draft, primary: e.target.value })} className="flex-1 border rounded-lg px-4 py-3" /></div></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Màu khi hover</label><div className="flex gap-3 items-center"><input type="color" value={draft.primaryHover} onChange={(e) => setDraft({ ...draft, primaryHover: e.target.value })} className="w-14 h-12 p-1 rounded-lg border" /><input value={draft.primaryHover} onChange={(e) => setDraft({ ...draft, primaryHover: e.target.value })} className="flex-1 border rounded-lg px-4 py-3" /></div></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Font chữ</label><select value={draft.fontFamily} onChange={(e) => setDraft({ ...draft, fontFamily: e.target.value })} className="w-full border rounded-lg px-4 py-3 bg-white">{FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Cỡ chữ cơ bản: {draft.fontSize}px</label><input type="range" min="14" max="20" step="1" value={draft.fontSize} onChange={(e) => setDraft({ ...draft, fontSize: Number(e.target.value) })} className="w-full" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Độ bo góc: {draft.radius}px</label><input type="range" min="6" max="24" step="1" value={draft.radius} onChange={(e) => setDraft({ ...draft, radius: Number(e.target.value) })} className="w-full" /></div><div className="flex flex-col sm:flex-row gap-3 pt-2"><button type="button" onClick={save} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold"><FiSave />Lưu giao diện</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-700"><FiRotateCcw />Khôi phục mặc định</button></div></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><h2 className="font-bold text-gray-800">Xem trước</h2><div className="mt-5 rounded-xl border p-5" style={{ fontFamily: draft.fontFamily, fontSize: `${draft.fontSize}px` }}><div className="h-12 rounded-lg flex items-center justify-center text-white font-semibold" style={{ background: draft.primary }}>Flower Shop</div><h3 className="mt-5 text-xl font-bold">Tiêu đề mẫu</h3><p className="mt-2 text-gray-500">Đây là vùng xem trước để Admin kiểm tra font, màu và kích thước.</p><button type="button" className="mt-5 px-4 py-2 rounded-lg text-white" style={{ background: draft.primary }}>Nút mẫu</button></div><p className="mt-4 text-xs text-gray-500">Thiết lập này chỉ kiểm soát các yếu tố giao diện cơ bản, không can thiệp logic nghiệp vụ.</p></div>
    </div></div></section>;
};

export default AdminAppearancePage;
