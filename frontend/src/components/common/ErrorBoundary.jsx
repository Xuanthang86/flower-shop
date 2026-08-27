import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("=== FLOWER SHOP ERROR BOUNDARY ===");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message ||
        "Đã xảy ra lỗi không xác định trong ứng dụng.";

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
                !
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mt-5">
                Đã xảy ra lỗi
              </h1>

              <p className="text-gray-500 mt-2">
                Flower Shop không thể hiển thị trang này.
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-xs font-semibold text-red-700 mb-2">
                THÔNG TIN LỖI
              </p>

              <pre className="text-sm text-red-700 whitespace-pre-wrap break-words">
                {errorMessage}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="
                  flex-1
                  px-5
                  py-3
                  rounded-xl
                  bg-pink-600
                  text-white
                  font-medium
                  hover:bg-pink-700
                  transition
                "
              >
                Tải lại trang
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="
                  flex-1
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-gray-200
                  text-gray-700
                  font-medium
                  hover:bg-gray-50
                  transition
                "
              >
                Về trang chủ
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-5">
              Mở DevTools → Console để xem chi tiết lỗi kỹ thuật.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
