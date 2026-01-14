"use client";

import React, { useEffect, useState } from "react";
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
import {
  Users,
  BookOpen,
  ShoppingBag,
  DollarSign,
  Building2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "@/app/api/axios";

// --- Components ---

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

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalInstitutions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/super-admin/analytics/overview");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch overview stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        colorClass="text-blue-600"
        bgClass="bg-blue-100"
        darkBgClass="dark:bg-blue-900/20"
        darkTextClass="dark:text-blue-400"
      />
      <StatCard
        title="Total Courses"
        value={stats.totalCourses}
        icon={BookOpen}
        colorClass="text-green-600"
        bgClass="bg-green-100"
        darkBgClass="dark:bg-green-900/20"
        darkTextClass="dark:text-green-400"
      />
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon={ShoppingBag}
        colorClass="text-purple-600"
        bgClass="bg-purple-100"
        darkBgClass="dark:bg-purple-900/20"
        darkTextClass="dark:text-purple-400"
      />
      <StatCard
        title="Total Revenue"
        value={`$${Number(stats.totalRevenue).toFixed(2)}`}
        icon={DollarSign}
        colorClass="text-red-600"
        bgClass="bg-red-100"
        darkBgClass="dark:bg-red-900/20"
        darkTextClass="dark:text-red-400"
      />
      <StatCard
        title="Total Institutions"
        value={stats.totalInstitutions}
        icon={Building2}
        colorClass="text-yellow-600"
        bgClass="bg-yellow-100"
        darkBgClass="dark:bg-yellow-900/20"
        darkTextClass="dark:text-yellow-400"
      />
    </div>
  );
};

const RevenueAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenueOverTime: [],
    revenueByInstitution: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "/api/super-admin/analytics/revenue-analytics"
        );
        setData(data);
      } catch (error) {
        console.error("Failed to fetch revenue data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-semibold mb-4">Revenue Over Time</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">Revenue by Institution</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.revenueByInstitution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
                nameKey="institutionName"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.revenueByInstitution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const UserStats = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    userSignupsOverTime: [],
    usersByRole: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "/api/super-admin/analytics/user-stats"
        );
        setData(data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-semibold mb-4">
          User Sign-ups (Last 30 Days)
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.userSignupsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">
          User Distribution by Role
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.usersByRole}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="roleName" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const TopCourses = () => {
  const [loading, setLoading] = useState(true);
  const [topCourses, setTopCourses] = useState([]);

  useEffect(() => {
    const fetchTopCourses = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "/api/super-admin/analytics/top-courses"
        );
        setTopCourses(data);
      } catch (error) {
        console.error("Failed to fetch top courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopCourses();
  }, []);

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader>
        <CardTitle>Top 10 Courses by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCourses.map((course) => (
              <TableRow key={course.title}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell className="text-right">
                  ${Number(course.totalRevenue).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const TopInstitutions = () => {
  const [loading, setLoading] = useState(true);
  const [topInstitutions, setTopInstitutions] = useState([]);

  useEffect(() => {
    const fetchTopInstitutions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "/api/super-admin/analytics/top-institutions"
        );
        setTopInstitutions(data);
      } catch (error) {
        console.error("Failed to fetch top institutions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopInstitutions();
  }, []);

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader>
        <CardTitle>Top 10 Institutions by User Count</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution Name</TableHead>
              <TableHead className="text-right">User Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topInstitutions.map((inst) => (
              <TableRow key={inst.name}>
                <TableCell className="font-medium">{inst.name}</TableCell>
                <TableCell className="text-right">{inst.userCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function SuperAdminDashboard() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide analytics and overview
        </p>
      </div>

      <Overview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueAnalytics />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <UserStats />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCourses />
        <TopInstitutions />
      </div>
    </div>
  );
}
