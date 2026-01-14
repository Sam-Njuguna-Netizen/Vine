"use client";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Table,
  Space,
  Tag,
  Image,
  message,
  Popconfirm,
  Grid,
} from "antd";
import Highlighter from "react-highlight-words";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import dayjs from "dayjs";

const { useBreakpoint } = Grid;

export default function JoinRequest() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [requests, setRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/allMyInstitutionGroupRequest");
      if (response.status === 200) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      N("Error", "Failed to fetch join requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await axios.post("/api/approveGroupRequest", {
        id: requestId,
      });
      if (response.status === 200) {
        N("Success", "Request approved successfully", "success");
        fetchJoinRequests();
      }
    } catch (error) {
      N(
        "Error",
        error.response?.data?.message || "Failed to approve request",
        "error"
      );
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await axios.post(
        `/api/group/reject-request/${requestId}`
      );
      if (response.status === 200) {
        message.success("Request rejected successfully");
        fetchJoinRequests();
      }
    } catch (error) {
      N(
        "Error",
        error.response?.data?.message || "Failed to reject request",
        "error"
      );
    }
  };

  // Search functionality
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 w-full"
          style={{ fontSize: isMobile ? "16px" : "14px" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ fontSize: isMobile ? "14px" : "12px" }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ fontSize: isMobile ? "14px" : "12px" }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => close()}
            style={{ fontSize: isMobile ? "14px" : "12px" }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const keys = dataIndex.split(".");
      let valueToCheck = record;
      for (const key of keys) {
        if (valueToCheck) {
          valueToCheck = valueToCheck[key];
        }
      }
      return (
        valueToCheck?.toString().toLowerCase().includes(value.toLowerCase()) ||
        false
      );
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        <span style={{ fontSize: isMobile ? "16px" : "14px" }}>{text}</span>
      ),
  });

  const desktopColumns = [
    {
      title: "Group",
      dataIndex: "group.name",
      key: "groupName",
      ...getColumnSearchProps("group.name"),
      render: (_, record) => (
        <div className="flex items-center">
          <img
            src={record.group?.coverImage}
            width={50}
            height={50}
            className="rounded-lg object-cover mr-3"
            preview={false}
            fallback="/default-group.jpg"
          />
          <span style={{ fontSize: isMobile ? "16px" : "14px" }}>
            {record.group?.name}
          </span>
        </div>
      ),
    },
    {
      title: "User",
      dataIndex: "user.email",
      key: "userEmail",
      ...getColumnSearchProps("user.email"),
      render: (_, record) => (
        <span style={{ fontSize: isMobile ? "16px" : "14px" }}>
          {record.user?.email}
          <br />
          {record.user?.profile.name}
        </span>
      ),
    },
    {
      title: "Request Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span style={{ fontSize: isMobile ? "16px" : "14px" }}>
          {dayjs(date).format("MMM D, YYYY h:mm A")}
        </span>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          pending: { color: "orange", text: "Pending" },
          approved: { color: "green", text: "Approved" },
          rejected: { color: "red", text: "Rejected" },
        };
        return (
          <Tag
            color={statusMap[status]?.color || "default"}
            style={{ fontSize: isMobile ? "14px" : "12px" }}
          >
            {statusMap[status]?.text || status}
          </Tag>
        );
      },
      // filters: [
      //   { text: 'Pending', value: 'pending' },
      //   { text: 'Approved', value: 'approved' },
      //   { text: 'Rejected', value: 'rejected' },
      // ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{
                  backgroundColor: "#52c41a",
                  fontSize: isMobile ? "14px" : "12px",
                }}
              >
                Approve
              </Button>
              {/* <Popconfirm
                title="Are you sure you want to reject this request?"
                onConfirm={() => handleReject(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<CloseOutlined />}
                  style={{ fontSize: isMobile ? '14px' : '12px' }}
                >
                  {isMobile ? 'Reject' : <CloseOutlined />}
                </Button>
              </Popconfirm> */}
            </>
          )}
          {record.status !== "pending" && (
            <Tag
              color={record.status === "approved" ? "green" : "red"}
              style={{ fontSize: isMobile ? "14px" : "12px" }}
            >
              {record.status === "approved" ? "Approved" : "Rejected"}
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  const mobileColumns = [
    {
      key: "mobileView",
      render: (record) => (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <img
              src={record.group?.coverImage}
              width={80}
              height={80}
              className="rounded-lg object-cover"
              preview={false}
              fallback="/default-group.jpg"
            />
            <div className="flex-1">
              <div className="font-semibold text-lg">{record.group?.name}</div>
              <div className="text-gray-600 mb-2">
                {record.user?.email}
                <br />
                {record.user?.profile.name}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {dayjs(record.createdAt).format("MMM D, YYYY h:mm A")}
              </div>
              <Tag
                color={
                  record.status === "pending"
                    ? "orange"
                    : record.status === "approved"
                    ? "green"
                    : "red"
                }
                className="mb-2"
              >
                {record.status === "pending"
                  ? "Pending"
                  : record.status === "approved"
                  ? "Approved"
                  : "Rejected"}
              </Tag>
            </div>
          </div>

          {record.status === "pending" && (
            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ backgroundColor: "#52c41a" }}
                size="middle"
              >
                Approve
              </Button>
              {/* <Popconfirm
                title="Are you sure you want to reject this request?"
                onConfirm={() => handleReject(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="middle"
                >
                  Reject
                </Button>
              </Popconfirm> */}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg shadow-md sm:p-4 p-0">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <p
          className="text-2xl font-semibold"
          style={{ fontSize: isMobile ? "20px" : "24px" }}
        >
          Group Join Requests
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={isMobile ? undefined : { x: true }}
          size={isMobile ? "large" : "middle"}
          className="join-requests-table"
        />
      </div>
    </div>
  );
}
