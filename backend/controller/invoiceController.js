import Invoice from "../model/invoice.js";
import InvoiceLine from "../model/invoiceLine.js";
import Payment from "../model/payment.js";
import ErrorResponse from "../exceptions/errorResponse.js";
import { calculateInvoiceTotals, isInvoiceOverdue } from "../utils/totals.js";
import { generateInvoicePdfBuffer } from "../utils/invoicePdf.js";

const supportedCurrencies = ["USD", "EUR", "GBP", "INR", "JPY", "AED"];

const getPaymentStatus = (invoice) => {
  if (invoice.balanceDue === 0) return "FULLY_PAID";
  if (invoice.amountPaid > 0) return "PARTIALLY_PAID";
  return "UNPAID";
};

const buildInvoiceResponse = (invoice, lineItems, payments) => {
  const computed = calculateInvoiceTotals({
    lineItems: lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    taxRate: invoice.taxRate,
    amountPaid: invoice.amountPaid,
  });

  return {
    invoice,
    lineItems,
    payments,
    total: computed.total,
    amountPaid: computed.amountPaid,
    balanceDue: computed.balanceDue,
    computed: {
      subTotal: computed.subTotal,
      taxAmount: computed.taxAmount,
      total: computed.total,
      amountPaid: computed.amountPaid,
      balanceDue: computed.balanceDue,
      isOverdue: isInvoiceOverdue({ dueDate: invoice.dueDate, status: invoice.status }),
    },
  };
};

class InvoiceController {
  listInvoicesByUser = async (req, res) => {
    const userId = req.user.id;

    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 }).lean();

    const invoiceIds = invoices.map((invoice) => invoice._id);
    const paymentAgg = await Payment.aggregate([
      { $match: { invoiceId: { $in: invoiceIds } } },
      {
        $group: {
          _id: "$invoiceId",
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: "$paymentDate" },
        },
      },
    ]);

    const paymentsMap = new Map(paymentAgg.map((row) => [row._id.toString(), row]));

    const history = invoices.map((invoice) => {
      const paymentMeta = paymentsMap.get(invoice._id.toString());
      return {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        status: invoice.status,
        paymentStatus: getPaymentStatus(invoice),
        total: invoice.total,
        amountPaid: invoice.amountPaid,
        balanceDue: invoice.balanceDue,
        paymentCount: paymentMeta?.paymentCount || 0,
        lastPaymentDate: paymentMeta?.lastPaymentDate || null,
        isArchived: invoice.isArchived,
      };
    });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  };

  createInvoice = async (req, res) => {
    const {
      invoiceNumber,
      customerName,
      issueDate,
      dueDate,
      taxRate = 0,
      amountPaid = 0,
      currency = "USD",
      lineItems = [],
    } = req.body;

    if (!invoiceNumber || !customerName || !issueDate || !dueDate) {
      throw new ErrorResponse("invoiceNumber, customerName, issueDate and dueDate are required", 400);
    }

    if (!supportedCurrencies.includes(currency)) {
      throw new ErrorResponse(`currency must be one of: ${supportedCurrencies.join(", ")}`, 400);
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new ErrorResponse("At least one line item is required", 400);
    }

    const invalidLine = lineItems.find(
      (item) =>
        !item.description ||
        Number(item.quantity) < 1 ||
        Number(item.unitPrice) < 0 ||
        Number.isNaN(Number(item.quantity)) ||
        Number.isNaN(Number(item.unitPrice)),
    );

    if (invalidLine) {
      throw new ErrorResponse("Each line item needs description, quantity >= 1 and unitPrice >= 0", 400);
    }

    const totals = calculateInvoiceTotals({ lineItems, taxRate, amountPaid });

    const invoice = await Invoice.create({
      userId: req.user.id,
      invoiceNumber,
      customerName,
      issueDate,
      dueDate,
      status: totals.status,
      currency,
      subTotal: totals.subTotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      amountPaid: totals.amountPaid,
      balanceDue: totals.balanceDue,
      isArchived: false,
    });

    const createdLines = await InvoiceLine.insertMany(
      totals.lineItems.map((item) => ({
        invoiceId: invoice._id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    );

    res.status(201).json({
      success: true,
      data: buildInvoiceResponse(invoice, createdLines, []),
    });
  };

  getInvoiceById = async (req, res) => {
    const { id } = req.params;

    const invoice = await Invoice.findOne({ _id: id, userId: req.user.id });
    if (!invoice) {
      throw new ErrorResponse("Invoice not found", 404);
    }

    const [lineItems, payments] = await Promise.all([
      InvoiceLine.find({ invoiceId: id }).sort({ createdAt: 1 }),
      Payment.find({ invoiceId: id }).sort({ paymentDate: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: buildInvoiceResponse(invoice, lineItems, payments),
    });
  };

  archiveInvoice = async (req, res) => {
    const { invoiceId } = req.body;
    if (!invoiceId) {
      throw new ErrorResponse("invoiceId is required", 400);
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, userId: req.user.id },
      { isArchived: true },
      { new: true },
    );

    if (!invoice) {
      throw new ErrorResponse("Invoice not found", 404);
    }

    res.status(200).json({ success: true, data: invoice });
  };

  restoreInvoice = async (req, res) => {
    const { invoiceId } = req.body;
    if (!invoiceId) {
      throw new ErrorResponse("invoiceId is required", 400);
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, userId: req.user.id },
      { isArchived: false },
      { new: true },
    );

    if (!invoice) {
      throw new ErrorResponse("Invoice not found", 404);
    }

    res.status(200).json({ success: true, data: invoice });
  };

  downloadInvoicePdf = async (req, res) => {
    const { id } = req.params;

    const invoice = await Invoice.findOne({ _id: id, userId: req.user.id });
    if (!invoice) {
      throw new ErrorResponse("Invoice not found", 404);
    }

    const [lineItems, payments] = await Promise.all([
      InvoiceLine.find({ invoiceId: id }).sort({ createdAt: 1 }),
      Payment.find({ invoiceId: id }).sort({ paymentDate: -1 }),
    ]);

    const pdfBuffer = await generateInvoicePdfBuffer({
      invoice,
      lineItems,
      payments,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    return res.send(pdfBuffer);
  };
}

export default new InvoiceController();
