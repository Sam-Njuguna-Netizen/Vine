"use client";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Table,
  Space,
  Modal,
  Select,
  Popconfirm,
  Switch,
  Grid,
  Tag,
} from "antd";
import Highlighter from "react-highlight-words";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";

export default function PlanManagement() {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const [plans, setPlans] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    getAllPlans();
  }, []);

  const getAllPlans = async () => {
    try {
      const res = await axios.get("/api/institutePlan");
      if (res.data) setPlans(res.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  // Searchable columns
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
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => close()}
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

  const mobileColumns = [
    {
      key: "mobileView",
      render: (record) => (
        <div className="p-2">
          <div style={{ fontSize: "18px", fontWeight: "500" }}>
            {record.name}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <span className="text-gray-500">Regular:</span>
              <span className="ml-1 font-medium">${record.regularPrice}</span>
            </div>
            <div>
              <span className="text-gray-500">Sale:</span>
              <span className="ml-1 font-medium text-green-600">
                ${record.salePrice}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <Tag color="blue" className="ml-1">
                {record.per}
              </Tag>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size={isMobile ? "middle" : "small"}
              style={{ fontSize: "14px" }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this plan?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size={isMobile ? "middle" : "small"}
                style={{ fontSize: "14px" }}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      ),
    },
  ];

  const desktopColumns = [
    {
      title: <span style={{ fontSize: "16px" }}>Plan Name</span>,
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: <span style={{ fontSize: "16px" }}>Description</span>,
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description"),
    },
    {
      title: <span style={{ fontSize: "16px" }}>Regular Price</span>,
      dataIndex: "regularPrice",
      key: "regularPrice",
      render: (price) => <span>${price}</span>,
      sorter: (a, b) => parseFloat(a.regularPrice) - parseFloat(b.regularPrice),
    },
    {
      title: <span style={{ fontSize: "16px" }}>Sale Price</span>,
      dataIndex: "salePrice",
      key: "salePrice",
      render: (price) => <span className="text-green-600">${price}</span>,
      sorter: (a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice),
    },
    {
      title: <span style={{ fontSize: "16px" }}>Duration</span>,
      dataIndex: "per",
      key: "per",
      render: (per) => <Tag color="blue">{per}</Tag>,
      filters: [
        { text: "Monthly", value: "month" },
        { text: "6 Months", value: "6 months" },
        { text: "Yearly", value: "year" },
      ],
      onFilter: (value, record) => record.per === value,
    },
    {
      title: <span style={{ fontSize: "16px" }}>Action</span>,
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ fontSize: "14px" }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this plan?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              style={{ fontSize: "14px" }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [per, setPer] = useState("month");

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setRegularPrice(plan.regularPrice);
    setSalePrice(plan.salePrice);
    setPer(plan.per);
    setOpenPlanModal(true);
  };

  const resetModal = () => {
    setOpenPlanModal(false);
    setEditingPlan(null);
    setName("");
    setDescription("");
    setRegularPrice("");
    setSalePrice("");
    setPer("month");
  };

  const handleDelete = async (planId) => {
    try {
      const response = await axios.delete(`/api/institutePlan/${planId}`);
      if (response.data.success) {
        getAllPlans();
        N("Success", "Plan deleted successfully!", "success");
      }
    } catch (error) {
      N("Error", "Failed to delete plan!", "error");
    }
  };

  const handleSavePlan = async () => {
    if (!name || !regularPrice || !salePrice || !per) {
      N("Error", "Required fields are missing!", "error");
      return;
    }

    const planData = {
      name,
      description,
      regularPrice,
      salePrice,
      per,
    };

    try {
      let response;
      if (editingPlan) {
        response = await axios.put(
          `/api/institutePlan/${editingPlan.id}`,
          planData
        );
      } else {
        response = await axios.post("/api/institutePlan", planData);
      }

      if (response.data.success) {
        getAllPlans();
        N(
          "Success",
          `Plan ${editingPlan ? "updated" : "added"} successfully!`,
          "success"
        );
        resetModal();
      }
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || `Failed to ${editingPlan ? "update" : "add"} plan!`;
      N("Error", msg, "error");
    }
  };

  return (
    <div className="rounded-lg shadow-md sm:p-4 p-0">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <p
          className="text-2xl font-semibold"
          style={{ fontSize: isMobile ? "20px" : "24px" }}
        >
          Plan Management
        </p>
        {(user?.institution?.expiryDate === null ||
          new Date(user?.institution?.expiryDate) < new Date()) && (
            <p className="text-2xl  text-red-600">
              Please subscribe first to get all the features
            </p>
          )}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size={isMobile ? "middle" : "large"}
          onClick={() => {
            setEditingPlan(null);
            setOpenPlanModal(true);
          }}
          style={{ fontSize: isMobile ? "14px" : "16px" }}
        >
          Add Plan
        </Button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <Table
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={plans}
          rowKey="id"
          loading={!plans}
          pagination={{ pageSize: 10 }}
          scroll={isMobile ? undefined : { x: true }}
          size={isMobile ? "large" : "middle"}
          className="plan-management-table"
        />
      </div>

      {/* Plan Modal */}
      <Modal
        title={
          <span style={{ fontSize: isMobile ? "18px" : "20px" }}>
            {editingPlan ? "Edit Plan" : "Add Plan"}
          </span>
        }
        open={openPlanModal}
        onOk={handleSavePlan}
        onCancel={resetModal}
        footer={[
          <Button
            key="cancel"
            onClick={resetModal}
            style={{ fontSize: isMobile ? "14px" : "16px" }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSavePlan}
            style={{ fontSize: isMobile ? "14px" : "16px" }}
          >
            {editingPlan ? "Update" : "Add"} Plan
          </Button>,
        ]}
        width={isMobile ? "90%" : "50%"}
      >
        <div className="grid grid-cols-1 gap-4">
          <Input
            placeholder="Plan Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Regular Price"
              type="number"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              style={{ fontSize: isMobile ? "16px" : "14px" }}
              prefix="$"
            />
            <Input
              placeholder="Sale Price"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              style={{ fontSize: isMobile ? "16px" : "14px" }}
              prefix="$"
            />
          </div>
          <Select
            value={per}
            onChange={setPer}
            options={[
              { label: "Monthly", value: "month" },
              { label: "6 Months", value: "6 months" },
              { label: "Yearly", value: "year" },
            ]}
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
        </div>
      </Modal>
    </div>
  );
}
