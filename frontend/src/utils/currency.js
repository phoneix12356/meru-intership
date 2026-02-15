export const supportedCurrencies = ["USD", "EUR", "GBP", "INR", "JPY", "AED"];

export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};
