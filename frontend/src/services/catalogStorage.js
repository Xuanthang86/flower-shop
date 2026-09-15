const DB_NAME = "flower-shop-catalog";

const DB_VERSION = 1;

const PRODUCT_STORE_NAME = "products";

const PRODUCT_RECORD_KEY = "catalog";

const openCatalogDatabase = () =>
  new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(
        new Error(
          "Trình duyệt hiện tại không hỗ trợ IndexedDB để lưu dữ liệu sản phẩm."
        )
      );

      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(PRODUCT_STORE_NAME)) {
        database.createObjectStore(PRODUCT_STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const database = request.result;

      database.onversionchange = () => {
        database.close();
      };

      resolve(database);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error("Không thể mở bộ nhớ IndexedDB của Flower Shop.")
      );
    };

    request.onblocked = () => {
      reject(
        new Error(
          "Bộ nhớ IndexedDB đang bị khóa bởi một phiên Flower Shop khác. Hãy đóng các tab Flower Shop đang mở rồi thử lại."
        )
      );
    };
  });

export const readProductsFromIndexedDB = async () => {
  const database = await openCatalogDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PRODUCT_STORE_NAME, "readonly");

    const store = transaction.objectStore(PRODUCT_STORE_NAME);

    const request = store.get(PRODUCT_RECORD_KEY);

    request.onsuccess = () => {
      resolve(Array.isArray(request.result) ? request.result : null);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error("Không thể đọc danh sách sản phẩm từ IndexedDB.")
      );
    };

    transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      database.close();
    };

    transaction.onabort = () => {
      database.close();
    };
  });
};

export const saveProductsToIndexedDB = async (products) => {
  const database = await openCatalogDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PRODUCT_STORE_NAME, "readwrite");

    const store = transaction.objectStore(PRODUCT_STORE_NAME);

    store.put(products, PRODUCT_RECORD_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve(products);
    };

    transaction.onerror = () => {
      const error =
        transaction.error ||
        new Error("Không thể lưu danh sách sản phẩm vào IndexedDB.");

      database.close();

      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ||
        new Error("Giao dịch lưu sản phẩm vào IndexedDB đã bị hủy.");

      database.close();

      reject(error);
    };
  });
};

export const deleteProductsFromIndexedDB = async () => {
  const database = await openCatalogDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PRODUCT_STORE_NAME, "readwrite");

    const store = transaction.objectStore(PRODUCT_STORE_NAME);

    store.delete(PRODUCT_RECORD_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve(true);
    };

    transaction.onerror = () => {
      const error =
        transaction.error ||
        new Error("Không thể xóa danh sách sản phẩm khỏi IndexedDB.");

      database.close();

      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ||
        new Error("Giao dịch xóa sản phẩm khỏi IndexedDB đã bị hủy.");

      database.close();

      reject(error);
    };
  });
};
