import { formatCurrency } from "../utils/currency";

const TotalsCard = ({ computed, onAddPayment, invoiceStatus, currency }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <h2 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-6 px-1">Amount Summary</h2>

      <div className="space-y-4 grow">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span className="font-medium text-slate-700">{formatCurrency(computed.subTotal, currency)}</span>
        </div>

        <div className="flex justify-between text-slate-500">
          <span>Tax Amount</span>
          <span className="font-medium text-slate-700">{formatCurrency(computed.taxAmount, currency)}</span>
        </div>

        <div className="h-px bg-slate-100 my-2"></div>

        <div className="flex justify-between text-lg font-bold">
          <span className="text-slate-900">Total Amount</span>
          <span className="text-indigo-600">{formatCurrency(computed.total, currency)}</span>
        </div>

        <div className="flex justify-between text-slate-500 pt-2">
          <span>Amount Paid</span>
          <span className="font-medium text-emerald-600">-{formatCurrency(computed.amountPaid, currency)}</span>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-indigo-900 font-bold uppercase text-xs tracking-tight">Balance Due</span>
            <span className="text-indigo-600 text-2xl font-black">{formatCurrency(computed.balanceDue, currency)}</span>
          </div>
        </div>
      </div>

      {invoiceStatus !== "PAID" && (
        <button
          onClick={onAddPayment}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
        >
          Add Payment
        </button>
      )}
    </div>
  );
};

export default TotalsCard;
