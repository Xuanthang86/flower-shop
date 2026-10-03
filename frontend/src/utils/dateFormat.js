export const formatVietnamDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const raw = String(value).trim();

  if (!raw) {
    return "—";
  }

  /*
   * DD/MM/YYYY hoặc D/M/YYYY
   */
  const vietnameseDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/);

  if (vietnameseDate) {
    const [, day, month, year, rest] = vietnameseDate;

    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}${rest || ""}`;
  }

  /*
   * YYYY-MM-DD
   *
   * Không dùng new Date() cho phần ngày này
   * để tránh lệch ngày do timezone.
   */
  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](.*))?$/);

  if (isoDate) {
    const [, year, month, day, timePart] = isoDate;

    if (!timePart) {
      return `${day}/${month}/${year}`;
    }

    const time = timePart.slice(0, 5);

    return `${day}/${month}/${year}${time ? ` ${time}` : ""}`;
  }

  /*
   * ISO datetime / Date object / timestamp.
   */
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("vi-VN");
};

export const formatVietnamDate = (value) =>
  formatVietnamDateTime(value).split(" ")[0];
