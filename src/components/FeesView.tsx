import React, { useState, useEffect } from 'react';
import { apiRequest, formatCurrency, formatDate } from '../api';
import { School, FeeRecord, SchoolClass, Student, FeePayment } from '../types';
import {
  Wallet,
  Receipt,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  X,
  CreditCard,
  Building
} from 'lucide-react';

interface FeesViewProps {
  school: School;
  initialTab?: string;
  initialStudentId?: number;
}

export const FeesView: React.FC<FeesViewProps> = ({ school, initialTab = 'ledger', initialStudentId }) => {
  const [subTab, setSubTab] = useState<'ledger' | 'collect' | 'pending' | 'history'>(
    (initialTab as any) || 'ledger'
  );

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [month, setMonth] = useState<string>(months[new Date().getMonth()]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [ledger, setLedger] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fee Collect Form State
  const [collectForm, setCollectForm] = useState({
    student_id: initialStudentId || '',
    month: months[new Date().getMonth()],
    year: new Date().getFullYear(),
    monthly_fee: 2000,
    previous_balance: 0,
    discount: 0,
    paid_amount: 2000,
    payment_method: 'Cash',
    notes: 'Paid at reception'
  });

  const [receiptToPrint, setReceiptToPrint] = useState<any | null>(null);

  // Load classes and students
  useEffect(() => {
    apiRequest<SchoolClass[]>('/api/classes').then(res => {
      setClasses(res);
      if (res.length > 0 && !selectedClass) setSelectedClass(res[0].name);
    });
    apiRequest<Student[]>('/api/students').then(res => {
      setStudents(res);
      if (initialStudentId) {
        const found = res.find(s => s.id === initialStudentId);
        if (found) {
          setCollectForm(prev => ({
            ...prev,
            student_id: String(found.id),
            monthly_fee: found.monthly_fee,
            paid_amount: found.monthly_fee
          }));
        }
      }
    });
  }, [initialStudentId]);

  // Load ledger data
  const fetchLedger = () => {
    setLoading(true);
    apiRequest<FeeRecord[]>(`/api/fees?month=${month}&year=${year}&class=${encodeURIComponent(selectedClass)}`)
      .then(res => {
        setLedger(res);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedClass) {
      fetchLedger();
    }
  }, [month, year, selectedClass]);

  const handleStudentSelect = (studIdStr: string) => {
    const sId = Number(studIdStr);
    const stud = students.find(s => s.id === sId);
    if (stud) {
      setCollectForm(prev => ({
        ...prev,
        student_id: studIdStr,
        monthly_fee: stud.monthly_fee,
        paid_amount: stud.monthly_fee
      }));
    } else {
      setCollectForm(prev => ({ ...prev, student_id: studIdStr }));
    }
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectForm.student_id || Number(collectForm.paid_amount) <= 0) {
      alert('Please select a student and enter a valid paid amount.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiRequest('/api/fees/collect', {
        method: 'POST',
        body: JSON.stringify(collectForm)
      });

      const stud = students.find(s => s.id === Number(collectForm.student_id));
      const payable = (Number(collectForm.monthly_fee) + Number(collectForm.previous_balance)) - Number(collectForm.discount);
      const rem = Math.max(0, payable - Number(collectForm.paid_amount));

      setReceiptToPrint({
        receipt_no: res.receipt_no,
        date: new Date().toISOString().split('T')[0],
        student_name: stud ? stud.student_name : 'Student',
        father_name: stud ? stud.father_name : 'Father',
        admission_number: stud ? stud.admission_number : 'ADM',
        class_name: stud ? `${stud.class_name} (${stud.section})` : '',
        roll_number: stud ? stud.roll_number : '',
        month: collectForm.month,
        year: collectForm.year,
        monthly_fee: collectForm.monthly_fee,
        previous_balance: collectForm.previous_balance,
        discount: collectForm.discount,
        paid_amount: collectForm.paid_amount,
        remaining_amount: rem,
        payment_method: collectForm.payment_method,
        notes: collectForm.notes
      });

      fetchLedger();
    } catch (err: any) {
      alert(err.message || 'Error collecting fee');
    } finally {
      setLoading(false);
    }
  };

  const netPayable = (Number(collectForm.monthly_fee) + Number(collectForm.previous_balance)) - Number(collectForm.discount);
  const remainingPreview = Math.max(0, netPayable - Number(collectForm.paid_amount));

  // Pending fees
  const pendingRecords = ledger.filter(r => r.status === 'PENDING' || r.status === 'PARTIAL' || r.remaining_amount > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tuition Fee Management & Ledger</h2>
          <p className="text-xs text-slate-500">
            Class-wise accounting, automated receipt printing, discount concessions, and defaulter tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('collect')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors print:hidden"
          >
            <Wallet className="w-4 h-4" />
            <span>+ Receive Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setSubTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'ledger' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Class-wise Fee Ledger
        </button>
        <button
          onClick={() => setSubTab('collect')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'collect' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Collect Fee Payment
        </button>
        <button
          onClick={() => setSubTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'pending' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Defaulters List
        </button>
      </div>

      {/* 1. CLASS-WISE LEDGER */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 print:hidden">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Billing Month</label>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Year</label>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {[year - 1, year, year + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ledger</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                {selectedClass} Ledger — {month} {year}
              </span>
              <span className="text-[11px] text-slate-500">{ledger.length} Students</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Roll</th>
                    <th className="px-4 py-3">Student & Father</th>
                    <th className="px-4 py-3">Monthly Fee</th>
                    <th className="px-4 py-3">Previous</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3 text-emerald-700">Paid Amount</th>
                    <th className="px-4 py-3 text-rose-700">Remaining</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-slate-400">Loading ledger...</td></tr>
                  ) : ledger.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-slate-400">No students enrolled in {selectedClass}.</td></tr>
                  ) : (
                    ledger.map(row => (
                      <tr key={row.student_id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-blue-700">{row.roll_number}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{row.student_name}</div>
                          <div className="text-[11px] text-slate-400">Father: {row.father_name}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(row.monthly_fee)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatCurrency(row.previous_balance)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatCurrency(row.discount)}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(row.paid_amount)}</td>
                        <td className="px-4 py-3 font-bold text-rose-700">{formatCurrency(row.remaining_amount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.status === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right print:hidden">
                          <button
                            onClick={() => {
                              handleStudentSelect(String(row.student_id));
                              setSubTab('collect');
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                          >
                            Receive
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
      )}

      {/* 2. RECEIVE FEE PAYMENT FORM */}
      {subTab === 'collect' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Receive Student Tuition Fee
            </h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              Instant Printable Slip
            </span>
          </div>

          <form onSubmit={handleCollectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
              <select
                required
                value={collectForm.student_id}
                onChange={e => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
              >
                <option value="">-- Choose Student by Name / Class / Roll --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.student_name} (Roll #{s.roll_number}, {s.class_name}) - Father: {s.father_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Month</label>
                <select
                  value={collectForm.month}
                  onChange={e => setCollectForm({ ...collectForm, month: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                <input
                  type="number"
                  value={collectForm.year}
                  onChange={e => setCollectForm({ ...collectForm, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tuition Fee (Rs.)</label>
                <input
                  type="number"
                  value={collectForm.monthly_fee}
                  onChange={e => setCollectForm({ ...collectForm, monthly_fee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Arrears</label>
                <input
                  type="number"
                  value={collectForm.previous_balance}
                  onChange={e => setCollectForm({ ...collectForm, previous_balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-rose-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Concession</label>
                <input
                  type="number"
                  value={collectForm.discount}
                  onChange={e => setCollectForm({ ...collectForm, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-emerald-700 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">Amount Receiving (Rs.) *</label>
                <input
                  type="number"
                  required
                  value={collectForm.paid_amount}
                  onChange={e => setCollectForm({ ...collectForm, paid_amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-extrabold border-2 border-emerald-500 rounded-lg text-emerald-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={collectForm.payment_method}
                  onChange={e => setCollectForm({ ...collectForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank Transfer">Bank Transfer / Deposit</option>
                  <option value="EasyPaisa / JazzCash">EasyPaisa / JazzCash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Remaining Balance After Payment:</span>
                <div className={`font-bold text-sm ${remainingPreview > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatCurrency(remainingPreview)}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${remainingPreview <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {remainingPreview <= 0 ? 'Full Payment' : 'Partial Payment'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={collectForm.notes}
                onChange={e => setCollectForm({ ...collectForm, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Receive Payment & Generate Receipt</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. DEFAULTERS LIST */}
      {subTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Outstanding Dues & Defaulters List</h3>
              <p className="text-xs text-slate-500">Students with unpaid balance dues in current ledger.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Defaulters</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Roll</th>
                  <th className="px-4 py-3">Student Name & Father</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Tuition Fee</th>
                  <th className="px-4 py-3">Paid Amount</th>
                  <th className="px-4 py-3 text-rose-700">Remaining Due</th>
                  <th className="px-4 py-3 text-right">Collect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-emerald-600 font-bold">
                      <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                      All accounts are fully paid! No outstanding dues.
                    </td>
                  </tr>
                ) : (
                  pendingRecords.map(r => (
                    <tr key={r.student_id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{r.roll_number}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{r.student_name}</td>
                      <td className="px-4 py-3">{r.class_name} ({r.section})</td>
                      <td className="px-4 py-3">{formatCurrency(r.monthly_fee)}</td>
                      <td className="px-4 py-3 text-emerald-700">{formatCurrency(r.paid_amount)}</td>
                      <td className="px-4 py-3 font-bold text-rose-700">{formatCurrency(r.remaining_amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            handleStudentSelect(String(r.student_id));
                            setSubTab('collect');
                          }}
                          className="px-2 py-1 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. OFFICIAL PRINTABLE FEE RECEIPT MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setReceiptToPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Printable Layout */}
            <div className="border-2 border-slate-800 p-5 rounded-2xl relative">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm border-2 border-amber-400">
                    SCH
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 uppercase text-sm leading-tight">{school.name}</h3>
                    <p className="text-[10px] text-slate-500">{school.address || 'Campus Head Office'}</p>
                    <p className="text-[10px] text-slate-500">Phone: {school.phone || '0300-1234567'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-md">
                    FEE RECEIPT
                  </span>
                  <div className="font-mono font-bold text-xs text-slate-900 mt-1">{receiptToPrint.receipt_no}</div>
                  <div className="text-[10px] text-slate-500">Date: {formatDate(receiptToPrint.date)}</div>
                </div>
              </div>

              {/* Urdu Slogan */}
              <div className="font-serif text-center text-blue-800 font-bold text-xs mb-3" dir="rtl">
                "{school.urdu_slogan}"
              </div>

              {/* Student Metadata */}
              <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs grid grid-cols-2 gap-2 border border-slate-200">
                <div><span className="text-slate-500">Student:</span> <strong className="text-slate-900">{receiptToPrint.student_name}</strong></div>
                <div><span className="text-slate-500">Adm No:</span> <strong className="font-mono text-slate-900">{receiptToPrint.admission_number}</strong></div>
                <div><span className="text-slate-500">Father:</span> <strong className="text-slate-900">{receiptToPrint.father_name}</strong></div>
                <div><span className="text-slate-500">Class & Roll:</span> <strong className="text-slate-900">{receiptToPrint.class_name} (Roll #{receiptToPrint.roll_number})</strong></div>
                <div><span className="text-slate-500">Fee Period:</span> <strong className="text-blue-700">{receiptToPrint.month} {receiptToPrint.year}</strong></div>
                <div><span className="text-slate-500">Payment Mode:</span> <strong className="text-slate-900">{receiptToPrint.payment_method}</strong></div>
              </div>

              {/* Accounting Table */}
              <table className="w-full text-xs mb-4 border border-slate-200">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2">Tuition Fee ({receiptToPrint.month} {receiptToPrint.year})</td>
                    <td className="p-2 text-right font-semibold">{formatCurrency(receiptToPrint.monthly_fee)}</td>
                  </tr>
                  <tr>
                    <td className="p-2">Previous Arrears</td>
                    <td className="p-2 text-right">{formatCurrency(receiptToPrint.previous_balance)}</td>
                  </tr>
                  {Number(receiptToPrint.discount) > 0 && (
                    <tr>
                      <td className="p-2 text-emerald-700">Concession / Discount</td>
                      <td className="p-2 text-right text-emerald-700">- {formatCurrency(receiptToPrint.discount)}</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50 font-bold text-emerald-800">
                    <td className="p-2">AMOUNT RECEIVED (PAID)</td>
                    <td className="p-2 text-right text-emerald-700 font-extrabold">{formatCurrency(receiptToPrint.paid_amount)}</td>
                  </tr>
                  <tr className="font-bold text-rose-700">
                    <td className="p-2">Remaining Outstanding Dues</td>
                    <td className="p-2 text-right">{formatCurrency(receiptToPrint.remaining_amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-4 border-t border-slate-200">
                <div>
                  <div className="h-8 flex items-center justify-center font-cursive text-slate-500 text-[10px]">Verified</div>
                  <div className="border-t border-slate-400 font-bold text-[10px] uppercase">Cashier / Staff</div>
                </div>
                <div>
                  <div className="h-8 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border border-emerald-600 text-emerald-700 flex items-center justify-center text-[8px] font-bold rotate-[-12deg]">
                      SEAL
                    </div>
                  </div>
                  <div className="border-t border-slate-400 font-bold text-[10px] uppercase">School Stamp</div>
                </div>
                <div>
                  <div className="h-8 flex items-center justify-center text-slate-900 font-bold text-[11px]">{school.head_name}</div>
                  <div className="border-t border-slate-400 font-bold text-[10px] uppercase">Principal</div>
                </div>
              </div>

            </div>

            {/* Print button */}
            <div className="mt-5 flex items-center justify-end gap-2 print:hidden">
              <button
                onClick={() => setReceiptToPrint(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
