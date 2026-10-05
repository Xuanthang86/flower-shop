const pad2 = (value) => String(value).padStart(2, "0");

const formatDateParts = (date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return result;
};

export const formatVietnamDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const raw = String(value).trim();

  if (!raw) {
    return "—";
  }

  /*
   * ========================================================
   * DD/MM/YYYY
   * ========================================================
   *
   * Nếu dữ liệu đã ở định dạng Việt Nam,
   * chuẩn hóa lại padding.
   */
  const vietnameseDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/);

  if (vietnameseDate) {
    const [, day, month, year, rest] = vietnameseDate;

    return `${pad2(day)}/${pad2(month)}/${year}${rest || ""}`;
  }

  /*
   * ========================================================
   * YYYY-MM-DD
   * ========================================================
   *
   * Không dùng new Date() cho date-only.
   */
  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](.*))?$/);

  if (isoDate) {
    const [, year, month, day, timePart] = isoDate;

    if (!timePart) {
      return `${day}/${month}/${year}`;
    }

    /*
     * Dữ liệu datetime không có timezone:
     * lấy phần giờ/phút trực tiếp.
     */
    const timeMatch = timePart.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);

    if (timeMatch) {
      const [, hour, minute, second] = timeMatch;

      return `${day}/${month}/${year} ${hour}:${minute}${
        second ? `:${second}` : ""
      }`;
    }

    return `${day}/${month}/${year}`;
  }

  /*
   * ========================================================
   * ISO DATETIME / Date / TIMESTAMP
   * ========================================================
   *
   * Không dùng toLocaleString().
   *
   * Luôn format bằng Intl.DateTimeFormat + timezone
   * Asia/Ho_Chi_Minh rồi tự ghép DD/MM/YYYY.
   *
   * Vì vậy Chrome / Edge / Firefox đều nhận cùng một
   * chuỗi đầu ra.
   */
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const parts = formatDateParts(date);

  const day = parts.day;
  const month = parts.month;
  const year = parts.year;

  const hour = parts.hour;
  const minute = parts.minute;
  const second = parts.second;

  if (!day || !month || !year) {
    return "—";
  }

  if (!hour || !minute) {
    return `${day}/${month}/${year}`;
  }

  return `${day}/${month}/${year} ${hour}:${minute}${
    second ? `:${second}` : ""
  }`;
};

export const formatVietnamDate = (value) =>
  formatVietnamDateTime(value).split(" ")[0];
