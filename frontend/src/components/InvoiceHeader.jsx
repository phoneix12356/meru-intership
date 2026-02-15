import { Calendar, Hash, User, Clock } from "lucide-react";
import { motion } from "framer-motion";


const InvoiceHeader = ({ invoice }) => {
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== "PAID";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Hash className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Invoice <span className="text-indigo-600">{invoice.invoiceNumber}</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mt-3">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{invoice.customerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Currency: {invoice.currency || "USD"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
              invoice.status === "PAID"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${invoice.status === "PAID" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            {invoice.status}
          </div>

          {isOverdue && (
            <div className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-sm font-bold animate-pulse">
              OVERDUE
            </div>
          )}

          <div className="px-4 py-1.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-full text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Due: {new Date(invoice.dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
