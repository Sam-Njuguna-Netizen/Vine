'use client'
import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    ClipboardList,
    ShoppingBag,
    UserPlus,
    ChevronDown,
    Filter,
    Trophy,
    XCircle,
    CheckCircle2,
    CreditCard,
    DollarSign
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
import { N } from "@/app/utils/notificationService"
import axios from '@/app/api/axios'
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// --- Components ---

const StatCard = ({ title, value, sub, icon: Icon, colorClass, iconBg }) => (
    <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-[#2F2F2F] flex flex-col justify-between min-h-[140px]">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
            <Icon size={20} className={colorClass} />
        </div>
        <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className={`text-xs mt-1 ${sub.includes('+') ? 'text-green-500' : 'text-red-500'}`}>{sub}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    // Normalize status to lowercase for comparison if needed, or keep as is
    const s = status?.toLowerCase() || '';
    if (s === 'pending') {
        return <span className="flex items-center gap-1 text-orange-600 font-medium text-sm"><Trophy size={14} className="fill-orange-600" /> Pending</span>;
    }
    if (s === 'failed') {
        return <span className="flex items-center gap-1 text-red-600 font-medium text-sm"><XCircle size={14} className="fill-red-600 text-white" /> Failed</span>;
    }
    return <span className="flex items-center gap-1 text-green-600 font-medium text-sm"><CheckCircle2 size={14} className="fill-green-600 text-white" /> Paid</span>;
};

const AdminRevenuePage = () => {
    const [timeRange, setTimeRange] = useState('this_month')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        coursesSold: 0,
        newCustomers: 0
    })
    const [salesData, setSalesData] = useState([])
    const [topCourses, setTopCourses] = useState([])
    const [payouts, setPayouts] = useState([])
    const [stripeStatus, setStripeStatus] = useState({
        connected: false,
        charges_enabled: false,
        details_submitted: false,
        payout_frequency: 'monthly' // Default
    })

    useEffect(() => {
        fetchData()
        checkStripeStatus()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const [overviewRes, salesRes, topCoursesRes, payoutsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/revenue/overview`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/revenue/sales-chart`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/revenue/top-courses`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/revenue/payouts`, { headers })
            ])

            setStats(overviewRes.data)
            setSalesData(salesRes.data)
            setTopCourses(topCoursesRes.data)
            setPayouts(payoutsRes.data)
        } catch (error) {
            console.error('Error fetching revenue data:', error)
            N("Error", "Failed to load revenue data.", "error")
        } finally {
            setLoading(false)
        }
    }

    const checkStripeStatus = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/checkAdmin`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStripeStatus(response.data)
        } catch (error) {
            console.error('Error checking Stripe status:', error)
        }
    }

    const handleConnectStripe = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/institutionConnect`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (response.data.connectUrl) {
                window.location.href = response.data.connectUrl
            }
        } catch (error) {
            console.error('Error connecting Stripe:', error)
            N("Connection Failed", "Could not initiate Stripe connection.", "error")
        }
    }

    const handlePayoutScheduleChange = async (value) => {
        try {
            const token = localStorage.getItem('token')
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stripe/payout-schedule`,
                { frequency: value },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setStripeStatus(prev => ({ ...prev, payout_frequency: value }))
            N("Success", "Payout schedule updated.", "success")
        } catch (error) {
            console.error('Error updating payout schedule:', error)
            N("Error", "Failed to update payout schedule.", "error")
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    // Helper to assign colors to top courses dynamically
    const getCourseColor = (index) => {
        const colors = [
            { bg: 'bg-orange-400', text: 'text-orange-600', bgLight: 'bg-orange-50' },
            { bg: 'bg-teal-400', text: 'text-teal-600', bgLight: 'bg-teal-50' },
            { bg: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-50' },
            { bg: 'bg-pink-400', text: 'text-pink-600', bgLight: 'bg-pink-50' },
            { bg: 'bg-purple-400', text: 'text-purple-600', bgLight: 'bg-purple-50' },
        ]
        return colors[index % colors.length]
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 md:p-8 font-sans text-slate-900 dark:text-white bg-gray-50/50 dark:bg-[#0A0A0A]">
            <div className="mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overview</p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue & Analytics</h1>
                    </div>
                    {/* Optional: Add date range picker here if needed, matching analytics page style if it had one */}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        sub="+20.1% from last month" // Mock growth for now, or calculate if data available
                        icon={DollarSign}
                        colorClass="text-orange-500"
                        iconBg="bg-orange-50"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        sub="+12% from last month"
                        icon={ClipboardList}
                        colorClass="text-teal-500"
                        iconBg="bg-teal-50"
                    />
                    <StatCard
                        title="Courses Sold"
                        value={stats.coursesSold}
                        sub="+5% from last month"
                        icon={ShoppingBag}
                        colorClass="text-pink-500"
                        iconBg="bg-pink-50"
                    />
                    <StatCard
                        title="New Students"
                        value={stats.newCustomers}
                        sub="+8% from last month"
                        icon={UserPlus}
                        colorClass="text-blue-500"
                        iconBg="bg-blue-50"
                    />
                </div>

                {/* Middle Section: Top Courses & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Top Courses */}
                    <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-2xl border border-slate-100 dark:border-[#2F2F2F] shadow-sm">
                        <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Top Courses</h3>
                        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 mb-4 text-sm font-semibold text-slate-900 dark:text-slate-200">
                            <span className="w-6 text-slate-500 dark:text-slate-500">#</span>
                            <span>Name</span>
                            <span>Sales Count</span>
                            <span className="text-right">Revenue</span>
                        </div>
                        <div className="space-y-6">
                            {topCourses.map((course, index) => {
                                const color = getCourseColor(index);
                                // Calculate width percentage based on max sales or just mock for visual if not critical
                                const maxSales = Math.max(...topCourses.map(c => c.totalSales), 1);
                                const width = `${Math.min((course.totalSales / maxSales) * 100, 100)}%`;

                                return (
                                    <div key={course.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center text-sm">
                                        <span className="w-6 font-medium text-slate-900 dark:text-slate-300">{index + 1}</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={course.title}>{course.title}</span>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${color.bg} rounded-full`} style={{ width }}></div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded bg-opacity-10 dark:bg-opacity-20 ${color.text} ${color.bgLight} dark:bg-transparent`}>
                                            {formatCurrency(course.totalSales)}
                                        </span>
                                    </div>
                                );
                            })}
                            {topCourses.length === 0 && (
                                <div className="text-center text-slate-500 py-8">No courses sold yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-[#1A0B2E] p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
                        {/* Background gradient effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2a1245] to-[#1A0B2E] z-0"></div>

                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Revenue Overview</h3>
                                {/* Legend */}
                                <div className="flex gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span>
                                        <span className="text-slate-300">Revenue</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#331D4A', borderColor: '#4c2f6d', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#d946ef"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            dot={{ stroke: '#d946ef', strokeWidth: 2, r: 4, fill: '#1A0B2E' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payout Settings */}
                <div className="bg-white dark:bg-[#1F1F1F] p-8 rounded-2xl border border-slate-100 dark:border-[#2F2F2F] shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Payout Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-2xl">
                        Manage how and when you receive payments from your earned revenue. Set your payout frequency and connect your Stripe account.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stripe Connection Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Stripe Connection</label>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${stripeStatus.charges_enabled ? 'bg-green-500' : stripeStatus.details_submitted ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {stripeStatus.charges_enabled
                                                ? 'Active & Ready'
                                                : stripeStatus.details_submitted
                                                    ? 'Verification in Progress'
                                                    : 'Pending Setup'}
                                        </span>
                                    </div>
                                    {stripeStatus.charges_enabled && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none dark:bg-green-900/30 dark:text-green-400">Connected</Badge>
                                    )}
                                </div>

                                {!stripeStatus.charges_enabled ? (
                                    <Button onClick={handleConnectStripe} className="w-full bg-[#635BFF] hover:bg-[#534bd9] text-white">
                                        Connect with Stripe
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Account ID</span>
                                            <span className="font-mono text-slate-700 dark:text-slate-300">{stripeStatus.stripe_account_id || '****'}</span>
                                        </div>
                                        <Button variant="outline" onClick={handleConnectStripe} className="w-full text-sm h-8 dark:bg-transparent dark:text-white dark:border-slate-600 dark:hover:bg-slate-800">
                                            Update Stripe Settings
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payout Frequency */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payout Frequency</label>
                            <Select
                                value={stripeStatus.payout_frequency}
                                onValueChange={handlePayoutScheduleChange}
                                disabled={!stripeStatus.charges_enabled}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-[#2B2B2B] border-slate-200 dark:border-slate-700 dark:text-white">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-[#2B2B2B] dark:border-slate-700">
                                    <SelectItem value="weekly" className="dark:text-white dark:focus:bg-slate-800">Weekly (Every Monday)</SelectItem>
                                    <SelectItem value="monthly" className="dark:text-white dark:focus:bg-slate-800">Monthly (1st of month)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                Choose how often you want your available balance to be transferred.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payout History */}
                <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-slate-100 dark:border-[#2F2F2F] shadow-sm overflow-hidden">
                    <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-[#2F2F2F]">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payout History</h2>
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                            Filter <Filter size={14} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-[#2B2B2B] text-slate-900 dark:text-slate-200 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Payout ID</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {payouts.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{formatCurrency(item.amount)}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status="Paid" /> {/* Assuming paid for now as we filter for transfers */}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Stripe</td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-500">
                                            No payout history available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminRevenuePage;
