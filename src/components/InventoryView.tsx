import React, { useState, useEffect } from 'react';
import { apiRequest, formatCurrency } from '../api';
import { InventoryItem } from '../types';
import {
  Package,
  Search,
  PlusCircle,
  Trash2,
  Printer,
  MapPin
} from 'lucide-react';

interface InventoryViewProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [condFilter, setCondFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<InventoryItem[]>('/api/inventory');
      setItems(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Remove asset item '${name}' from school inventory?`)) {
      try {
        await apiRequest(`/api/inventory/${id}`, { method: 'DELETE' });
        setItems(prev => prev.filter(i => i.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting inventory item');
      }
    }
  };

  const totalValuation = items.reduce((acc, it) => acc + (Number(it.total_value) || 0), 0);
  const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

  const filtered = items.filter(it => {
    const q = search.toLowerCase();
    const matchSearch =
      it.item_name.toLowerCase().includes(q) ||
      it.item_code.toLowerCase().includes(q) ||
      (it.supplier && it.supplier.toLowerCase().includes(q)) ||
      it.location.toLowerCase().includes(q);

    const matchCat = catFilter ? it.item_category === catFilter : true;
    const matchCond = condFilter ? it.item_condition === condFilter : true;
    return matchSearch && matchCat && matchCond;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">School Inventory & Assets</h2>
          <p className="text-xs text-slate-500">
            Total Valuation: <strong className="text-emerald-700">{formatCurrency(totalValuation)}</strong> across {totalQuantity.toLocaleString()} physical items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('universal_add', { type: 'inventory' })}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Asset Item</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Inventory Report</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-2.5 print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item name, item code, supplier, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics / IT</option>
            <option value="Lab Equipment">Lab Equipment</option>
            <option value="Sports">Sports Equipment</option>
            <option value="Books / Library">Books / Library</option>
          </select>

          <select
            value={condFilter}
            onChange={e => setCondFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Damaged">Damaged</option>
            <option value="Repair Required">Repair Required</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Item Name & Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading assets...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filtered.map(it => (
                  <tr key={it.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-700">
                      {it.item_code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{it.item_name}</div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {it.item_category}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">{it.quantity}</span>{' '}
                      <span className="text-slate-400 text-[11px]">{it.unit}</span>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatCurrency(it.purchase_price)}
                    </td>

                    <td className="px-4 py-3 font-bold text-emerald-700">
                      {formatCurrency(it.total_value)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          it.item_condition === 'Good' || it.item_condition === 'New'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : it.item_condition === 'Damaged'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {it.item_condition}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{it.location}</span>
                    </td>

                    <td className="px-4 py-3 text-right print:hidden">
                      <button
                        onClick={() => handleDelete(it.id, it.item_name)}
                        title="Delete Asset"
                        className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
