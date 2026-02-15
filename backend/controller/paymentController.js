import Invoice from "../model/invoice.js";
import Payment from "../model/payment.js";
import ErrorResponse from "../exceptions/errorResponse.js";

class PaymentController {
  addPayment = async (req, res) => {
    const { id } = req.params;
    const { amount, paymentDate } = req.body;

    const normalizedAmount = Number(amount);

    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      throw new ErrorResponse("Amount must be greater than 0", 400);
    }

    const invoice = await Invoice.findOne({ _id: id, userId: req.user.id });
    if (!invoice) {
      throw new ErrorResponse("Invoice not found", 404);
    }

    if (invoice.isArchived) {
      throw new ErrorResponse("Cannot add payment to archived invoice", 400);
    }

    if (normalizedAmount > invoice.balanceDue) {
      throw new ErrorResponse("Payment amount cannot exceed balance due", 400);
    }

    const payment = await Payment.create({
      invoiceId: invoice._id,
      amount: normalizedAmount,
      paymentDate: paymentDate || new Date(),
    });

    invoice.amountPaid = Math.round((invoice.amountPaid + normalizedAmount + Number.EPSILON) * 100) / 100;
    invoice.balanceDue = Math.round((invoice.total - invoice.amountPaid + Number.EPSILON) * 100) / 100;
    invoice.status = invoice.balanceDue === 0 ? "PAID" : "DRAFT";

    await invoice.save();

    res.status(201).json({
      success: true,
      data: {
        payment,
        invoice,
      },
    });
  };
}

export default new PaymentController();
