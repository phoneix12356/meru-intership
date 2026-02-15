import { ReceiptText, Calendar } from "lucide-react";
import { formatCurrency } from "../utils/currency";

const PaymentsList = ({ payments, currency }) => {
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
          <ReceiptText className="text-slate-300 w-6 h-6" />
        </div>
        <p className="text-slate-400 font-medium">No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
        <h2 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Payment History</h2>
      </div>
      <div className="divide-y divide-slate-50">
        {payments.map((payment, index) => (
          <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Payment Received</p>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-emerald-600">+{formatCurrency(payment.amount, currency)}</p>
              <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest mt-0.5">Verified</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsList;
