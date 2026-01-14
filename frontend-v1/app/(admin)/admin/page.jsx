"use client";

import { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  ShoppingBag,
  DollarSign,
  ExternalLink,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, darkBgClass, darkTextClass }) => (
  <Card className="border-border shadow-sm">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">
          {value !== undefined ? value : "..."}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${bgClass} ${darkBgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass} ${darkTextClass}`} />
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, coursesRes, paymentsRes] = await Promise.all([
        axios.get("/analytics/overview"),
        axios.get("/analytics/users/overview?limit=5"),
        axios.get("/analytics/courses/overview?limit=5"),
        axios.get("/analytics/payments/overview?limit=5"),
      ]);

      setOverviewStats(overviewRes.data);
      setRecentUsers(usersRes.data.users || []);
      setRecentCourses(coursesRes.data.courses || []);
      setRecentPayments(paymentsRes.data.payments || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      N(
        "Error",
        error.response?.data?.message || "Failed to load dashboard data.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400";
      case "Instructor":
        return "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400";
      case "Student":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400";
      case "Institution Admin":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100/80 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400";
      case "failed":
        return "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your platform's performance
          </p>
        </div>

        {user?.institution && (
          <div className="flex items-center gap-4 bg-card p-2 pr-4 rounded-full border border-border shadow-sm">
            {user.institution.logo ? (
              <img
                src={`${user.institution.logo}`}
                alt="Logo"
                className="h-10 w-10 rounded-full object-contain bg-muted border border-border"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user.institution.name}
              </p>
              {user.institution.websiteLink && (
                <a
                  href={user.institution.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overviewStats?.totalUsers}
          icon={Users}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          darkBgClass="dark:bg-emerald-900/20"
          darkTextClass="dark:text-emerald-400"
        />
        <StatCard
          title="Total Courses"
          value={overviewStats?.totalCourses}
          icon={BookOpen}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
          darkBgClass="dark:bg-blue-900/20"
          darkTextClass="dark:text-blue-400"
        />
        <StatCard
          title="Total Products"
          value={overviewStats?.totalProducts}
          icon={ShoppingBag}
          colorClass="text-purple-600"
          bgClass="bg-purple-100"
          darkBgClass="dark:bg-purple-900/20"
          darkTextClass="dark:text-purple-400"
        />
        <StatCard
          title="Total Revenue"
          value={`$${overviewStats?.totalRevenue || "0.00"}`}
          icon={DollarSign}
          colorClass="text-amber-600"
          bgClass="bg-amber-100"
          darkBgClass="dark:bg-amber-900/20"
          darkTextClass="dark:text-amber-400"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newest members of the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.profile?.name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRoleBadgeColor(
                          user.userRole?.name
                        )} border-0`}
                      >
                        {user.userRole?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {moment(user.createdAt).format("MMM DD, YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Latest published courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {course.instructor?.profile?.name || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        ${course.salePrice}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {moment(course.createdAt).format("MMM DD, YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="border-border shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <p className="text-sm text-foreground">
                        {payment.user?.email || "N/A"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {payment.course?.title ||
                          payment.product?.name ||
                          "N/A"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        ${payment.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusBadgeColor(
                          payment.receiveStatus
                        )} border-0`}
                      >
                        {payment.receiveStatus?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {moment(payment.createdAt).format("MMM DD, YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
