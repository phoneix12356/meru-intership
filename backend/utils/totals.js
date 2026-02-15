const roundToTwo = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const calculateLineTotals = (lineItems = []) => {
  return lineItems.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    return {
      ...item,
      quantity,
      unitPrice,
      lineTotal: roundToTwo(quantity * unitPrice),
    };
  });
};

export const calculateInvoiceTotals = ({ lineItems = [], taxRate = 0, amountPaid = 0 }) => {
  const normalizedTaxRate = Number(taxRate) || 0;
  const normalizedAmountPaid = Number(amountPaid) || 0;

  const computedLines = calculateLineTotals(lineItems);
  const subTotal = roundToTwo(computedLines.reduce((sum, item) => sum + item.lineTotal, 0));
  const taxAmount = roundToTwo(subTotal * (normalizedTaxRate / 100));
  const total = roundToTwo(subTotal + taxAmount);
  const balanceDue = roundToTwo(Math.max(total - normalizedAmountPaid, 0));
  const status = balanceDue === 0 ? "PAID" : "DRAFT";

  return {
    lineItems: computedLines,
    subTotal,
    taxRate: normalizedTaxRate,
    taxAmount,
    total,
    amountPaid: roundToTwo(normalizedAmountPaid),
    balanceDue,
    status,
  };
};

export const isInvoiceOverdue = ({ dueDate, status }) => {
  if (!dueDate || status === "PAID") {
    return false;
  }

  return new Date(dueDate).getTime() < Date.now();
};
