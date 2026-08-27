import { lazy, Suspense } from "react";

import ErrorBoundary from "./components/common/ErrorBoundary";

const AppRoutes = lazy(() => import("./routes/AppRoutes"));

const App = () => {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />

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
