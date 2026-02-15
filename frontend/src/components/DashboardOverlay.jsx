import { useEffect, useState } from "react";
import { Plus, LayoutDashboard, Receipt, Loader2, LogOut, Send, HandCoins } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CreateInvoiceModal from "./CreateInvoiceModal";
import api from "../api/api";
import { formatCurrency } from "../utils/currency";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";

const badgeByPaymentStatus = {
  UNPAID: "bg-red-50 text-red-600 border border-red-100",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700 border border-amber-100",
  FULLY_PAID: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

const DashboardOverlay = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sentInvoicesCount = invoices.length;
  const totalReceivedAmount = invoices.reduce((sum, invoice) => sum + (Number(invoice.amountPaid) || 0), 0);
  const paidInvoicesCount = invoices.filter((invoice) => (Number(invoice.amountPaid) || 0) > 0).length;
  const uniqueCurrencies = [...new Set(invoices.map((invoice) => invoice.currency).filter(Boolean))];
  const hasSingleCurrency = uniqueCurrencies.length <= 1;
  const displayCurrency = uniqueCurrencies[0] || "USD";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
              <LayoutDashboard className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Your Invoice History</h1>
              <p className="text-slate-500 text-sm">All previous invoices and payment status for your account</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sent Invoices</p>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{sentInvoicesCount}</p>
            <p className="text-sm text-slate-500 mt-1">Total invoices created</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Received Payments</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HandCoins className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {hasSingleCurrency ? formatCurrency(totalReceivedAmount, displayCurrency) : `${paidInvoicesCount} invoices paid`}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {hasSingleCurrency ? "Amount collected so far" : "Multiple currencies detected"}
            </p>
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Previous Invoices</h2>
          </div>

          {loading ? (
            <div className="p-10 flex items-center justify-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading invoices...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No invoices found for this user.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Due</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Payment Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{invoice.customerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatCurrency(invoice.total, invoice.currency)}</td>
                      <td className="px-6 py-4 text-sm text-emerald-700">{formatCurrency(invoice.amountPaid, invoice.currency)}</td>
                      <td className="px-6 py-4 text-sm text-red-700">{formatCurrency(invoice.balanceDue, invoice.currency)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeByPaymentStatus[invoice.paymentStatus] || "bg-slate-100 text-slate-700"}`}>
                          {invoice.paymentStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DashboardOverlay;
