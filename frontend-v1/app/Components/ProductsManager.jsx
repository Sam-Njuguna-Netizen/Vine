"use client";
import { useEffect, useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Radio, InputNumber } from "antd"; // Make sure to import these

import {
  Button,
  Input,
  Table,
  Space,
  Modal,
  Popconfirm,
  Form,
  Select,
  Upload,
  Image,
} from "antd";
import axios from "@/app/api/axios";

import { Card, Spin, Typography, Tag, Grid, List } from "antd";

import { N } from "@/app/utils/notificationService";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// --- API and Image URL Configuration ---
// Get the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Construct the base path for displaying images
const BASE_IMAGE_URL = `${API_BASE_URL}/uploads`;

// A simplified notification utility

// --- Add/Edit Product Modal ---
const ProductAddEditModal = ({
  visible,
  onSave,
  onCancel,
  product,
  categories,
}) => {
  const [form] = Form.useForm();
  // State will hold the RELATIVE path of the image, e.g., /Product-Images/....
  const [imageUrl, setImageUrl] = useState("");
  const [pricingModel, setPricingModel] = useState("free");
  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
      setImageUrl(product.image || "");
      setPricingModel(product.pricingModel || "free");
    } else {
      form.resetFields();
      setImageUrl("");
      setPricingModel("free");
    }
  }, [product, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSave({
          ...values,
          id: product ? product.id : undefined,
          image: imageUrl, // Pass the relative image path to the save handler
        });
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "Product-Images");

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // The API returns the relative publicUrl
      const relativeUrl = response.data.publicUrl;
      onSuccess(relativeUrl);
      setImageUrl(relativeUrl); // Store the relative URL in state
      N.success("Image uploaded successfully!");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Upload failed";
      N.error(errorMessage);
      onError(new Error(errorMessage));
    }
  };
  return (
    <Modal
      title={product ? "Edit Product" : "Add New Product"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="product_form">
        {/* Other form items (name, category, etc.) remain the same */}
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., AdonisJS for Beginners" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select a category"
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Form.Item>

        {/* NEW: Form Item for Image Upload */}
        <Form.Item label="Product Image">
          <Upload
            name="image"
            listType="picture"
            showUploadList={false}
            customRequest={handleUpload}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
          {/* UPDATED: Construct the full URL for preview only */}
          {imageUrl && (
            <div style={{ marginTop: 16 }}>
              <img width={100} src={`${imageUrl}`} alt="Product preview" />
            </div>
          )}
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="A short description of the product" />
        </Form.Item>

        <Form.Item name="reviews" label="Reviews">
          <Input placeholder="e.g., 5 Stars" />
        </Form.Item>
        <Form.Item name="pricingModel" label="Pricing">
          <Radio.Group onChange={(e) => setPricingModel(e.target.value)}>
            <Radio value="free">Free</Radio>
            <Radio value="paid">Paid</Radio>
          </Radio.Group>
        </Form.Item>
        {pricingModel === "paid" && (
          <>
            <Form.Item
              label="Regular Price ($)"
              name="regularPrice"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Sale Price ($) (Optional)" name="salePrice">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

// --- Main Products Management Component ---
export default function ProductsManage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // --- 1. DATA FETCHING ---
  const getAllProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
    } catch (error) {
      N.error(error?.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/productsCategories");
      setCategories(response.data);
    } catch (error) {
      N.error(error?.response?.data?.message || "Failed to fetch categories");
    }
  };

  useEffect(() => {
    getAllProducts();
    fetchCategories();
  }, []);

  // --- 2. ADD / UPDATE PRODUCT ---
  const handleSaveProduct = async (productData) => {
    setLoading(true);
    const payload = {
      name: productData.name,
      category: productData.category,
      description: productData.description,
      reviews: productData.reviews,
      image: productData.image,
      pricingModel: productData.pricingModel,
      regularPrice: productData.regularPrice,
      salePrice: productData.salePrice,
    };
    try {
      if (productData.id) {
        await axios.put(`/api/products/${productData.id}`, payload);
        N.success("Product updated successfully");
      } else {
        await axios.post("/api/products", payload);
        N.success("Product added successfully");
      }
      getAllProducts(); // Refresh
    } catch (error) {
      N.error(error?.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setEditingProduct(null);
    }
  };

  // --- 3. DELETE PRODUCT ---
  const handleDeleteProduct = async (productId) => {
    setLoading(true);
    try {
      await axios.delete(`/api/products/${productId}`);
      N.success("Product deleted successfully");
      getAllProducts(); // Refresh
    } catch (error) {
      N.error(error?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Control ---
  const showAddModal = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const showEditModal = (product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  // --- Price Renderer ---
  const renderPrice = (record) => {
    if (record.pricingModel === "free") {
      return <Tag color="green">Free</Tag>;
    }
    const priceToShow = record.salePrice || record.regularPrice;
    return `$${Number(priceToShow).toFixed(2)}`;
  };

  // --- Table Columns Definition (Desktop) ---
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => renderPrice(record),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- Card Render Function (Mobile) ---
  const renderProductCard = (product) => (
    <List.Item>
      <Card
        title={<Text strong>{product.name}</Text>}
        extra={renderPrice(product)}
        className="w-full shadow-sm"
        actions={[
          <Button
            type="text"
            icon={<EditOutlined />}
            key="edit"
            onClick={() => showEditModal(product)}
          >
            {" "}
            Edit
          </Button>,
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDeleteProduct(product.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} key="delete">
              {" "}
              Delete
            </Button>
          </Popconfirm>,
        ]}
      >
        <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
          {product.description}
        </Paragraph>
        <Tag>{product.category}</Tag>
      </Card>
    </List.Item>
  );

  return (
    <div className="p-0 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level={isMobile ? 4 : 2}>Product Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size={isMobile ? "middle" : "large"}
          onClick={showAddModal}
        >
          Add Product
        </Button>
      </div>

      {loading && (
        <div className="text-center">
          <Spin size="large" />
        </div>
      )}

      {!loading &&
        (isMobile ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={products}
            renderItem={renderProductCard}
            pagination={{ pageSize: 5, align: "center" }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "auto" }}
          />
        ))}

      {/* The modal should be available but is not part of this snippet */}
      <ProductAddEditModal
        visible={isModalVisible}
        onSave={handleSaveProduct}
        onCancel={handleCancelModal}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}
