"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, ShoppingBag, BookOpen, Users, ExternalLink, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

const RevenuePage = () => {
    const authUser = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        coursesSold: 0,
        newCustomers: 0
    });
    const [topCourses, setTopCourses] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [stripeStatus, setStripeStatus] = useState({
        connected: false,
        details_submitted: false,
        charges_enabled: false,
        payout_frequency: 'monthly' // Default
    });
    const [connectingStripe, setConnectingStripe] = useState(false);
    const [updatingSchedule, setUpdatingSchedule] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overviewRes, topCoursesRes, salesChartRes, payoutsRes, stripeRes] = await Promise.all([
                axios.get('/api/instructor/analytics/overview'),
                axios.get('/api/instructor/analytics/top-courses'),
                axios.get('/api/instructor/analytics/sales-chart'),
                axios.get('/api/instructor/analytics/payouts'),
                axios.post('/api/stripe/check') // Check stripe status
            ]);

            if (overviewRes.data) setOverview(overviewRes.data);
            if (topCoursesRes.data) setTopCourses(topCoursesRes.data);
            if (salesChartRes.data) setSalesData(salesChartRes.data);
            if (payoutsRes.data) setPayouts(payoutsRes.data);

            // Handle Stripe status
            // Note: The check endpoint might return success: false if not connected
            // We need to handle that gracefully
        } catch (error) {
            console.error("Error fetching data", error);
            // If stripe check fails, it might mean not connected
        } finally {
            // Separate stripe check to handle 400/404 gracefully
            checkStripeStatus();
            setLoading(false);
        }
    };

    const checkStripeStatus = async () => {
        try {
            const response = await axios.post('/api/stripe/check');
            if (response.data.success) {
                setStripeStatus({
                    connected: true,
                    details_submitted: response.data.details_submitted,
                    charges_enabled: response.data.charges_enabled,
                    payout_frequency: response.data.payout_frequency || 'monthly' // Assuming backend returns this now
                });
            }
        } catch (error) {
            // Not connected
            setStripeStatus(prev => ({ ...prev, connected: false }));
        }
    };

    const handleConnectStripe = async () => {
        setConnectingStripe(true);
        try {
            const response = await axios.post('/api/stripe/connect');
            if (response.data.connectUrl) {
                window.location.href = response.data.connectUrl;
            }
        } catch (error) {
            console.error("Stripe connect failed", error);
            N("Error", "Failed to initiate Stripe connection", "error");
        } finally {
            setConnectingStripe(false);
        }
    };

    const handlePayoutScheduleChange = async (value) => {
        setUpdatingSchedule(true);
        try {
            const response = await axios.post('/api/stripe/payout-schedule', { frequency: value });
            if (response.data.success) {
                setStripeStatus(prev => ({ ...prev, payout_frequency: value }));
                N("Success", "Payout schedule updated", "success");
            }
        } catch (error) {
            console.error("Update failed", error);
            N("Error", "Failed to update payout schedule", "error");
        } finally {
            setUpdatingSchedule(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Revenue & Payouts
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track your earnings, manage payouts, and view financial reports.
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${overview.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">
                                +180.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Courses Sold</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.coursesSold}</div>
                            <p className="text-xs text-muted-foreground">
                                +19% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.newCustomers}</div>
                            <p className="text-xs text-muted-foreground">
                                +201 since last hour
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Sales Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Courses */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Top Courses</CardTitle>
                            <CardDescription>
                                Your best performing courses this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {topCourses.map((course, index) => (
                                    <div key={course.id} className="flex items-center">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-medium dark:border-gray-800 dark:bg-gray-900">
                                            {index + 1}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{course.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {course.salesCount} sales
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            ${Number(course.totalSales).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                {topCourses.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        No sales data available yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payout Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payout Settings</CardTitle>
                        <CardDescription>
                            Manage how and when you receive payments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!stripeStatus.connected ? (
                            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
                                <div className="rounded-full bg-indigo-50 p-3 dark:bg-indigo-900/20">
                                    <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Connect with Stripe</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                        To receive payouts, you need to connect a Stripe account. It's fast, secure, and easy.
                                    </p>
                                </div>
                                <Button onClick={handleConnectStripe} disabled={connectingStripe}>
                                    {connectingStripe && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Connect Stripe Account
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Payout Frequency
                                    </label>
                                    <Select
                                        value={stripeStatus.payout_frequency}
                                        onValueChange={handlePayoutScheduleChange}
                                        disabled={updatingSchedule}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly (Every Monday)</SelectItem>
                                            <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Choose how often you want your earnings transferred to your bank account.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Account Status</label>
                                    <div className="flex items-center space-x-2 rounded-md border p-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${stripeStatus.charges_enabled ? 'bg-green-500' : stripeStatus.details_submitted ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                                        <span className="text-sm font-medium">
                                            {stripeStatus.charges_enabled
                                                ? 'Active & Ready'
                                                : stripeStatus.details_submitted
                                                    ? 'Verification in Progress'
                                                    : 'Pending Setup'}
                                        </span>
                                        {!stripeStatus.charges_enabled && !stripeStatus.details_submitted && (
                                            <Button variant="link" size="sm" className="ml-auto h-auto p-0" onClick={handleConnectStripe}>
                                                Complete Setup <ExternalLink className="ml-1 h-3 w-3" />
                                            </Button>
                                        )}
                                        {!stripeStatus.charges_enabled && stripeStatus.details_submitted && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                Stripe is reviewing your details.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payout History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payout History</CardTitle>
                        <CardDescription>
                            View your past payouts and their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Payout ID</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Method</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-mono text-xs">{payout.stripe_transfer_id || 'N/A'}</TableCell>
                                        <TableCell>${Number(payout.amount).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                                                {payout.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>Stripe Transfer</TableCell>
                                    </TableRow>
                                ))}
                                {payouts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                            No payout history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RevenuePage;
