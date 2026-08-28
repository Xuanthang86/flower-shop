/*
============================================================
FLOWER SHOP — APP ROOT
============================================================

Mục đích:
- Root component của toàn bộ ứng dụng.
- Lazy-load AppRoutes để tối ưu tải ứng dụng.
- ErrorBoundary bắt lỗi runtime ở cấp ứng dụng.
============================================================
*/

import { lazy, Suspense } from "react";

import ErrorBoundary from "./components/common/ErrorBoundary";

const AppRoutes = lazy(() => import("./routes/AppRoutes"));

const App = () => {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

              <p className="text-gray-500">Đang tải Flower Shop...</p>
            </div>
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
