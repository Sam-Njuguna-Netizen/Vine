'use client';
import { useEffect, useRef, useState } from "react";
import { SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Button, Input, Table, Space, Popconfirm } from "antd";
import Highlighter from "react-highlight-words";
import { N } from "@/app/utils/notificationService";
import axiosInstance from "@/app/api/axios";

export default function TransferRequest() {
  const [transferRequests, setTransferRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    getAllTransferRequests();
  }, []);

  const getAllTransferRequests = async () => {
    const response = await axiosInstance.get("/api/allTransferRequests");
    if (response.data?.success) {
      const formatted = response.data.transferRequests.map((tr, index) => ({
        key: index.toString(),
        id: tr.id,
        course: tr.course.title,
        instructor: tr.course.instructor.email,
        student: tr.student.email,
        amount: tr.amount,
        receiveStatus: tr.receiveStatus,
        transferStatus: tr.transferStatus,
      }));
      setTransferRequests(formatted);
    }
  };

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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div className="p-2  shadow-md rounded-md">
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ""}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 block w-full border p-2 rounded-md"
        />
        <Space className="flex justify-between">
          <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small">
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small">
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />, 
    onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      width: "30%",
      ...getColumnSearchProps("course"),
      sorter: (a, b) => a.course.localeCompare(b.course),
      
    },
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      width: "20%",
      ...getColumnSearchProps("instructor"),
      sorter: (a, b) => a.instructor.localeCompare(b.instructor),
      
    },
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      width: "20%",
      ...getColumnSearchProps("student"),
      sorter: (a, b) => a.student.localeCompare(b.student),
      
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "20%",
      ...getColumnSearchProps("amount"),
      sorter: (a, b) => a.amount - b.amount,
      
    },
    {
      title: "Receive Status",
      dataIndex: "receiveStatus",
      key: "receiveStatus",
      width: "20%",
      ...getColumnSearchProps("receiveStatus"),
      sorter: (a, b) => a.receiveStatus.localeCompare(b.receiveStatus),
      
    },
    {
      title: "Transfer Status",
      dataIndex: "transferStatus",
      key: "transferStatus",
      width: "20%",
      ...getColumnSearchProps("transferStatus"),
      sorter: (a, b) => a.transferStatus.localeCompare(b.transferStatus),
      
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "30%",
      render: (_, record) => (
        <Space wrap>
          <Popconfirm title="Are you sure you want to Transfer?" onConfirm={() => handleTransferInstructorShare(record.id)} okText="Yes" cancelText="No">
            <Button type="primary" icon={<CheckCircleOutlined />} className="w-full sm:w-auto">
              Transfer Share
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTransferInstructorShare = async (paymentId) => {
    try {
      const response = await axiosInstance.post("/api/transferToInstructor", { 
        paymentId, 
        status: "complete" 
      });
  
      console.log("API Response:", response);
  
      if (response?.data?.success) {
        getAllTransferRequests();
        N("Success", response.data?.message, "success");
      } else {
        console.log("API Error Message:", response.data?.message);
        N("Error", response.data?.message || "Something went wrong", "error");
      }
    } catch (error) {
      console.error("API Error:", error);
      N("Error", error.response?.data?.message || "Something went wrong!", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6  rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">
          Transfer Share Requests To Instructor
        </h1>
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={transferRequests}
          loading={transferRequests.length === 0}
          scroll={{ x: "100%" }}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
