import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Archive, RotateCcw, LogOut, Download } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/useAuth";

import InvoiceHeader from "../components/InvoiceHeader";
import LineItemsTable from "../components/LineItemsTable";
import TotalsCard from "../components/TotalsCard";
import PaymentsList from "../components/PaymentsList";
import AddPaymentModal from "../components/AddPaymentModal";
import { motion } from "framer-motion";

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const fetchInvoice = async () => {
    if (id === "new") {
      navigate("/");
      return;
    }

    try {
      const res = await api.get(`/invoices/${id}`);
      setData(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleArchiveToggle = async () => {
    setIsArchiving(true);
    try {
      if (data.invoice.isArchived) {
        await api.post("/invoices/restore", { invoiceId: id });
      } else {
        await api.post("/invoices/archive", { invoiceId: id });
      }
      await fetchInvoice();
    } catch (err) {
     
      console.error("Archive toggle error:", err);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${data.invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 bg-red-50 p-8 rounded-3xl border border-red-100 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { invoice, lineItems, payments, computed } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user?.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mt-1">Administrator</span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-1">
            <div>
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-[0.2em] mb-2 px-1">Invoice Management</p>
              <h1 className="text-4xl font-black text-slate-900">Manage Details</h1>
            </div>
            <div className="flex gap-3">
              <button
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                {isDownloadingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download PDF
              </button>

              <button
                disabled={isArchiving}
                onClick={handleArchiveToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border transition-all ${
                  invoice.isArchived
                    ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isArchiving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : invoice.isArchived ? (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    Restore Invoice
                  </>
                ) : (
                  <>
                    <Archive className="w-5 h-5" />
                    Archive Invoice
                  </>
                )}
              </button>
            </div>
          </div>

          <InvoiceHeader invoice={invoice} />

          {invoice.isArchived && (
            <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl mb-6 flex items-center gap-4 shadow-xl">
              <Archive className="w-6 h-6 text-slate-400" />
              <div>
                <p className="font-bold">This invoice is archived</p>
                <p className="text-slate-400 text-sm">You can view but cannot add new payments until restored.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LineItemsTable lineItems={lineItems} currency={invoice.currency} />
              <PaymentsList payments={payments} currency={invoice.currency} />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TotalsCard
                  computed={computed}
                  invoiceStatus={invoice.status}
                  currency={invoice.currency}
                  onAddPayment={() => setIsModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <AddPaymentModal
        invoiceId={id}
        balanceDue={computed.balanceDue}
        currency={invoice.currency}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInvoice}
      />
    </div>
  );
};

export default InvoiceDetailsPage;
