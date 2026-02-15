import { formatCurrency } from "../utils/currency";
import { motion } from "framer-motion";


const LineItemsTable = ({ lineItems, currency }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
        <h2 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Line Items</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Quantity</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Unit Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {lineItems.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-700 font-medium">{item.description}</td>
                <td className="px-6 py-4 text-slate-600 text-center">{item.quantity}</td>
                <td className="px-6 py-4 text-slate-600 text-right">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="px-6 py-4 text-indigo-600 font-bold text-right">{formatCurrency(item.lineTotal, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineItemsTable;
