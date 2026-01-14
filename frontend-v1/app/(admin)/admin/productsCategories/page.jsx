"use client";
import { useEffect, useRef, useState } from "react";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Table, Space, Modal, Popconfirm } from "antd";
import Highlighter from "react-highlight-words";
import { addProductsCategory, allProductsCategories, updateProductsCategory, deleteProductsCategory } from "@/app/utils/products";
import { N } from "@/app/utils/notificationService";

export default function CourseCategories() {
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    const response = await allProductsCategories();
    if (response?.success) {
      const formattedCategories = response.categories.map((category, index) => ({
        key: index.toString(),
        id: category.id,
        name: category.name,
      }));
      setCategories(formattedCategories);
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
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 w-full"
        />
        <Space>
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
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Action",
      key: "action",
      width: 150, 
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Are you sure you want to delete this category?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setOpenCategoryModal(true);
  };

  const resetModal = () => {
    setOpenCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleDelete = async (categoryId) => {
    const response = await deleteProductsCategory(categoryId);
    if (response.success) {
      getAllCategories();
      N("Success", "Category deleted successfully!", "success");
    } else {
      N("Error", "Failed to delete category!", "error");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName) {
      N("Error", "Category name is required!", "error");
      return;
    }

    if (editingCategory) {
      const updatedCategory = { id: editingCategory.id, name: categoryName };
      const response = await updateProductsCategory(updatedCategory);
      if (response.success) {
        getAllCategories();
        N("Success", "Category updated successfully!", "success");
      } else {
        N("Error", "Failed to update category!", "error");
      }
    } else {
      const newCategory = { name: categoryName };
      const response = await addProductsCategory(newCategory);
      if (response.success) {
        getAllCategories();
        N("Success", "Category added successfully!", "success");
      } else {
        N("Error", response.message || "Failed to add category!", "error");
      }
    }

    resetModal();
  };

  return (
    <div className="p-6   rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl dark:text-white font-semibold">Product Categories</h1>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingCategory(null); setOpenCategoryModal(true); }}>
          Add Category
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={categories} loading={!categories} pagination={{ pageSize: 10 }} />
      </div>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={openCategoryModal}
        onOk={handleSaveCategory}
        onCancel={resetModal}
        zIndex={999999999}
        footer={[
          <Button key="cancel" onClick={resetModal}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSaveCategory}>{editingCategory ? "Update" : "Add"} Category</Button>,
        ]}
      >
        <Input placeholder="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
      </Modal>
    </div>
  );
}
