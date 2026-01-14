"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Tag,
  Input,
  Space,
  Tooltip,
  List,
  Card,
  Grid,
  Spin,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "@/app/api/axios";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const ProductOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Call the new backend endpoint
        const response = await axios.get("/api/product-orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch product orders:", error);
        // You might want to use a notification service here like in other components
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Function to parse cartItems safely and return a list of product names
  const renderProductsList = (cartItemsString) => {
    try {
      const items = JSON.parse(cartItemsString);
      if (!Array.isArray(items) || items.length === 0) {
        return <Text type="secondary">No product info</Text>;
      }

      return (
        <List
          size="small"
          dataSource={items}
          renderItem={(item) => (
            <List.Item style={{ padding: "2px 0", border: "none" }}>
              <Tooltip title={`ID: ${item.id}`}>
                {item.name || `Product ID: ${item.id}`} (Qty:{" "}
                {item.quantity || 1})
              </Tooltip>
            </List.Item>
          )}
        />
      );
    } catch (e) {
      return <Text type="secondary">Invalid cart data</Text>;
    }
  };

  // --- Payment Status Renderer ---
  const renderPaymentStatus = (status) => {
    const color =
      status === "completed"
        ? "green"
        : status === "pending"
        ? "orange"
        : "red";
    return <Tag color={color}>{status?.toUpperCase()}</Tag>;
  };

  // --- Table Columns Definition (Desktop) ---
  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Customer",
      dataIndex: ["student", "fullName"],
      key: "customer",
      render: (fullName, record) => fullName || record.student?.email || "N/A",
      sorter: (a, b) =>
        (a.student?.fullName || "").localeCompare(b.student?.fullName || ""),
    },
    {
      title: "Products Purchased",
      dataIndex: "cartItems",
      key: "products",
      render: renderProductsList,
      width: 300,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${Number(amount).toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Payment Status",
      dataIndex: "receiveStatus",
      key: "status",
      render: renderPaymentStatus,
      filters: [
        { text: "Completed", value: "completed" },
        { text: "Pending", value: "pending" },
        { text: "Failed", value: "failed" },
      ],
      onFilter: (value, record) => record.receiveStatus.indexOf(value) === 0,
    },
  ];

  // --- Card Render Function (Mobile) ---
  const renderOrderCard = (order) => (
    <List.Item>
      <Card
        title={`Order #${order.id}`}
        extra={renderPaymentStatus(order.receiveStatus)}
        className="w-full shadow-sm"
      >
        <div className="mb-2">
          <Text strong>Customer: </Text>
          <Text>
            {order.student?.fullName || order.student?.email || "N/A"}
          </Text>
        </div>
        <div className="mb-2">
          <Text strong>Amount: </Text>
          <Text type="success" strong>
            ${Number(order.amount).toFixed(2)}
          </Text>
        </div>
        <div className="mb-3">
          <Text strong>Date: </Text>
          <Text>{moment(order.createdAt).format("YYYY-MM-DD HH:mm")}</Text>
        </div>
        <div className="mb-2">
          <Text strong>Products:</Text>
          {renderProductsList(order.cartItems)}
        </div>
      </Card>
    </List.Item>
  );

  const filteredOrders = orders.filter(
    (order) =>
      (order.student?.fullName?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      ) ||
      (order.student?.email?.toLowerCase() || "").includes(
        searchText.toLowerCase()
      ) ||
      String(order.id).includes(searchText)
  );

  return (
    <div className="p-0 sm:p-6 bg-gray-50 min-h-screen">
      <Title level={isMobile ? 4 : 2}>Product Orders</Title>
      <Text type="secondary">View and manage all product sales.</Text>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by Order ID or Customer"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ margin: "16px 0", width: isMobile ? "100%" : 300 }}
      />

      {loading ? (
        <div className="text-center p-10">
          <Spin size="large" />
        </div>
      ) : isMobile ? (
        <List
          dataSource={filteredOrders}
          renderItem={renderOrderCard}
          pagination={{ pageSize: 5, align: "center" }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      )}
    </div>
  );
};

export default ProductOrdersPage;
