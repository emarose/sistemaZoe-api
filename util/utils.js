module.exports = function formatNumberToCurrency(num) {
  let strNum = num.toFixed(2).replace(".", ",");
  return `$ ${String(strNum).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
};

module.exports = function formatDateString(date) {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};
