'use client'
import React from 'react';
import { 
  BarChart3, 
  ClipboardList, 
  ShoppingBag, 
  UserPlus, 
  ChevronDown, 
  Filter,
  Trophy,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Mock Data ---
const chartData = [
  { name: 'Jan', lastMonth: 400, thisMonth: 240 },
  { name: 'Feb', lastMonth: 300, thisMonth: 139 },
  { name: 'Mar', lastMonth: 200, thisMonth: 580 },
  { name: 'Apr', lastMonth: 278, thisMonth: 390 },
  { name: 'May', lastMonth: 189, thisMonth: 480 },
  { name: 'Jun', lastMonth: 239, thisMonth: 380 },
  { name: 'Jul', lastMonth: 349, thisMonth: 430 },
];

const topCourses = [
  { id: '01', name: 'Ethical Hacking', sales: '46%', color: 'bg-orange-400', width: '46%' },
  { id: '02', name: 'Web Development', sales: '17%', color: 'bg-teal-400', width: '17%' },
  { id: '03', name: 'App development', sales: '19%', color: 'bg-blue-500', width: '19%' },
  { id: '04', name: 'UI/UX Design', sales: '29%', color: 'bg-pink-400', width: '29%' },
];

const payoutHistory = [
  { date: 'Oct 18, 2025', id: 'TXN-987656', amount: '$21.00', status: 'Pending', method: 'PayPal', notes: 'Under Review' },
  { date: 'Oct 15, 2025', id: 'TXN-987655', amount: '$150.00', status: 'Failed', method: 'Bank', notes: 'Incorrect IBAN' },
  { date: 'Aug 01, 2025', id: 'TXN-987654', amount: '$150.00', status: 'Paid', method: 'PayPal', notes: 'On Time' },
  { date: 'July 01, 2025', id: 'TXN-987653', amount: '$150.00', status: 'Paid', method: 'Stripe', notes: 'On Time' },
  { date: 'June 01, 2025', id: 'TXN-987652', amount: '$150.00', status: 'Paid', method: 'Bank', notes: 'On Time' },
];

// --- Components ---

const StatCard = ({ title, value, sub, icon: Icon, colorClass, iconBg }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[140px]">
    <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
      <Icon size={20} className={colorClass} />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className={`text-xs mt-1 ${sub.includes('+') ? 'text-green-500' : 'text-red-500'}`}>{sub}</p>
    </div>
  </div>
);

const SelectInput = ({ label, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <div className="relative">
      <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
        <option>{placeholder}</option>
      </select>
      <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === 'Pending') {
    return <span className="flex items-center gap-1 text-orange-600 font-medium text-sm"><Trophy size={14} className="fill-orange-600" /> Pending</span>;
  }
  if (status === 'Failed') {
    return <span className="flex items-center gap-1 text-red-600 font-medium text-sm"><XCircle size={14} className="fill-red-600 text-white" /> Failed</span>;
  }
  return <span className="flex items-center gap-1 text-green-600 font-medium text-sm"><CheckCircle2 size={14} className="fill-green-600 text-white" /> Paid</span>;
};

const SalesDashboard = () => {
  return (
    <div className="min-h-screen  p-6 md:p-8 font-sans text-slate-900">
      <div className=" mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-slate-500">Today's Sales</p>
          <h1 className="text-2xl font-bold text-slate-900">Sales Summary</h1>
        </div>dark:bg-[#1D2026]

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Sales" value="$5k" sub="+10% from yesterday" icon={BarChart3} colorClass="text-orange-500" iconBg="bg-orange-50" />
          <StatCard title="Total Order" value="500" sub="+8% from yesterday" icon={ClipboardList} colorClass="text-teal-500" iconBg="bg-teal-50" />
          <StatCard title="Courses Sold" value="9" sub="+2% from yesterday" icon={ShoppingBag} colorClass="text-pink-500" iconBg="bg-pink-50" />
          <StatCard title="New Customer" value="12" sub="+3% from yesterday" icon={UserPlus} colorClass="text-blue-500" iconBg="bg-blue-50" />
        </div>

        {/* Middle Section: Top Courses & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Courses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Top Courses</h3>
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 mb-4 text-sm font-semibold text-slate-900">
              <span className="w-6 text-slate-500">#</span>
              <span>Name</span>
              <span>Popularity</span>
              <span className="text-right">Sales</span>
            </div>
            <div className="space-y-6">
              {topCourses.map((course) => (
                <div key={course.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center text-sm">
                  <span className="w-6 font-medium text-slate-900">{course.id}</span>
                  <span className="font-medium text-slate-700">{course.name}</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${course.color} rounded-full`} style={{ width: course.width }}></div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded bg-opacity-10 ${course.color.replace('bg-', 'text-').replace('500', '600').replace('400', '600')} ${course.color.replace('bg-', 'bg-').replace('500', '50').replace('400', '50')}`}>
                    {course.sales}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-[#1A0B2E] p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
             {/* Background gradient effect */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2a1245] to-[#1A0B2E] z-0"></div>
             
             <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   {/* Legend */}
                   <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                         <span className="text-slate-300">Last Month</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span>
                         <span className="text-slate-300">This Month</span>
                      </div>
                   </div>
                </div>

                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorThisMonth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLastMonth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#331D4A', borderColor: '#4c2f6d', color: '#fff' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lastMonth" 
                        stroke="#2dd4bf" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorLastMonth)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="thisMonth" 
                        stroke="#d946ef" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorThisMonth)" 
                        dot={{ stroke: '#d946ef', strokeWidth: 2, r: 4, fill: '#1A0B2E' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>

        {/* Payout Settings */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Payout Settings</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-2xl">
            Manage how and when you receive payments from your earned revenue, Set your payout frequency, preferred payment method, and account details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput label="Payout Frequency" placeholder="Select" />
            <SelectInput label="Currency" placeholder="USD" />
            <SelectInput label="Payment Method" placeholder="Select" />
            <SelectInput label="Minimum Payout" placeholder="$100" />
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Payout History</h2>
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                 Filter <Filter size={14} />
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-900 font-semibold">
                    <tr>
                       <th className="px-6 py-4">Date</th>
                       <th className="px-6 py-4">Payout ID</th>
                       <th className="px-6 py-4">Amount</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Method</th>
                       <th className="px-6 py-4">Notes</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {payoutHistory.map((item, index) => (
                       <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-600">{item.date}</td>
                          <td className="px-6 py-4 text-slate-600">{item.id}</td>
                          <td className="px-6 py-4 text-slate-900 font-medium">{item.amount}</td>
                          <td className="px-6 py-4">
                             <StatusBadge status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-slate-600">{item.method}</td>
                          <td className="px-6 py-4 text-slate-600">{item.notes}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SalesDashboard;