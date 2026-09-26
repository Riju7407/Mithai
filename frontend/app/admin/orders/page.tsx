'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';
import { generateOrderInvoicePDF } from '../../../lib/invoiceGenerator';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/orders?page=${page}&limit=12`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedStatus) query += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await api.get(query);
      if (res.success) {
        const orderList = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
        setOrders(orderList);
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await api.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
        note: `Status updated to ${newStatus} via Admin Operations Console.`,
      });

      if (res.success) {
        // Update local list
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            Instant Orders Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Monitor real-time customer kitchen orders, prepare dispatches, and update fulfillment statuses.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading order records...
          </div>
        ) : (!orders || orders.length === 0) ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No orders matched</h3>
            <p className="text-stone-500 text-xs mt-1">Try modifying your search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Kitchen Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900 block">{order.orderNumber}</span>
                      <span className="text-[11px] text-stone-400">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-800 block">{order.customerName}</span>
                      <span className="text-[11px] text-stone-500">{order.customerPhone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-700 block">
                        {order.items?.length} confection{order.items?.length === 1 ? '' : 's'}
                      </span>
                      <span className="text-[11px] text-stone-400 truncate max-w-[160px] block">
                        {order.items?.map((it: any) => it.productName).join(', ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      {formatPrice(order.grandTotal)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'Failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            order.paymentMethod === 'COD'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border focus:outline-none transition-all ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-900 border-rose-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-amber-800 transition-colors"
                        title="View Full Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Order Overview
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => generateOrderInvoicePDF(selectedOrder, true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full gold-gradient text-royal-950 font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all"
                  title="Download Customer Tax Invoice (PDF)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Invoice (PDF)</span>
                </button>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.paymentMethod === 'COD'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}
                >
                  {selectedOrder.paymentMethod === 'COD' ? 'Cash Home Delivery' : 'Online Payment'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 mb-6 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  {selectedOrder.customerName}
                </span>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  {selectedOrder.customerPhone}
                </p>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {selectedOrder.customerEmail}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-stone-200 sm:pl-4">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  Delivery Destination
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city} -{' '}
                  {selectedOrder.shippingAddress?.pincode}
                </p>
                {selectedOrder.shippingAddress?.landmark && (
                  <p className="text-[11px] text-stone-400">
                    Landmark: {selectedOrder.shippingAddress.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3 mb-6">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Confectionery Items</h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((it: any, i: number) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <span className="font-semibold text-stone-900 block">{it.productName}</span>
                      <span className="text-[11px] text-stone-500">
                        {it.quantity} × {it.unit} @ {formatPrice(it.unitPrice)}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5 text-xs mb-6">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span>{formatPrice(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax (GST)</span>
                <span>{formatPrice(selectedOrder.tax)}</span>
              </div>
              <div className="border-t border-amber-200/80 pt-2 flex justify-between font-bold text-stone-900 text-sm">
                <span>Grand Total</span>
                <span className="text-amber-900">{formatPrice(selectedOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Status Update Control */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-700">Update Status:</span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-800"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
