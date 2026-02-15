import PDFDocument from "pdfkit";

const formatMoney = (value, currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDate = (dateValue) => new Date(dateValue).toLocaleDateString("en-US");

export const generateInvoicePdfBuffer = ({ invoice, lineItems = [], payments = [] }) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text(`Invoice ${invoice.invoiceNumber}`, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666").text(`Customer: ${invoice.customerName}`);
    doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`);
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`);
    doc.text(`Status: ${invoice.status}`);
    doc.text(`Currency: ${invoice.currency}`);
    doc.moveDown();

    doc.fillColor("#111").fontSize(12).text("Line Items", { underline: true });
    doc.moveDown(0.5);

    lineItems.forEach((item, index) => {
      doc
        .fontSize(10)
        .text(
          `${index + 1}. ${item.description} | Qty: ${item.quantity} | Unit: ${formatMoney(item.unitPrice, invoice.currency)} | Line Total: ${formatMoney(item.lineTotal, invoice.currency)}`,
        );
    });

    doc.moveDown();
    doc.fontSize(12).text("Totals", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Subtotal: ${formatMoney(invoice.subTotal, invoice.currency)}`);
    doc.text(`Tax (${invoice.taxRate}%): ${formatMoney(invoice.taxAmount, invoice.currency)}`);
    doc.text(`Total: ${formatMoney(invoice.total, invoice.currency)}`);
    doc.text(`Amount Paid: ${formatMoney(invoice.amountPaid, invoice.currency)}`);
    doc.text(`Balance Due: ${formatMoney(invoice.balanceDue, invoice.currency)}`);

    doc.moveDown();
    doc.fontSize(12).text("Payments", { underline: true });
    doc.moveDown(0.5);

    if (!payments.length) {
      doc.fontSize(10).text("No payments recorded.");
    } else {
      payments.forEach((payment, index) => {
        doc
          .fontSize(10)
          .text(`${index + 1}. ${formatDate(payment.paymentDate)} - ${formatMoney(payment.amount, invoice.currency)}`);
      });
    }

    doc.end();
  });
};
