"use client";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import {
  SearchOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  EyeFilled,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Table,
  Space,
  Tag,
  Typography,
  Badge,
  Divider,
  Modal,
} from "antd";
import Highlighter from "react-highlight-words";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import Image from "next/image";
import Link from "next/link";
import { addToCart, removeFromCart } from "@/app/store";
import StripeCheckout from "@/app/Components/StripeCheckout";

const { Text } = Typography;

export default function CartManagement() {
  const dispatch = useDispatch();
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const apiUrl = useSelector((state) => state.commonGLobal.apiUrl);
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);
  const [checkoutAll, setCheckoutAll] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/cart");
      if (res.data) setCarts(res.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      N("Error", "Failed to load cart items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutClick = (cartItem) => {
    if (cartItem.style === "Printed Copy" && !cartItem.shippingAddress) {
      N(
        "Error",
        "Please enter a valid ZIP code and verify your address",
        "error"
      );
      return;
    }
    setSelectedCart(cartItem);
    fetchBook(cartItem);
  };

  const handleCheckoutAll = () => {
    // Check if any printed copy doesn't have shipping address
    const invalidItems = carts.filter(
      (item) => item.style === "Printed Copy" && !item.shippingAddress
    );

    if (invalidItems.length > 0) {
      N("Error", "Some printed copies don't have shipping addresses", "error");
      return;
    }

    setCheckoutAll(true);
    setShowCheckoutModal(true);
  };

  const fetchBook = async (cartItem) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/book/${cartItem.book.id}`);
      if (res.status === 200) {
        setBookInfo(res.data || {});
        setShowCheckoutModal(true);
      }
    } catch (err) {
      N(
        "Error",
        err?.response?.data?.message || "Failed to load materials",
        "error"
      );
    } finally {
      setLoading(false);
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
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record.book[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    render: (_, record) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={
            record.book[dataIndex] ? record.book[dataIndex].toString() : ""
          }
        />
      ) : (
        <span>{record.book[dataIndex]}</span>
      ),
  });

  const handleDelete = async (cartItem) => {
    console.log({ bookId: cartItem.book.id, style: cartItem.style });
    try {
      const response = await axios.delete(`/api/cart/${cartItem.id}`);
      if (response.data.success) {
        fetchCartItems();
        N("Success", "Item removed from cart", "success");
        dispatch(
          removeFromCart({ bookId: cartItem.book.id, style: cartItem.style })
        );
      }
    } catch (error) {
      N("Error", "Failed to remove item from cart", "error");
    }
  };

  const calculateTotal = () => {
    return carts.reduce((total, item) => {
      const itemPrice = parseFloat(item.book.salePrice) * item.quantity;
      const shipping =
        item.style === "Printed Copy" ? parseFloat(item.book.shippingFee) : 0;
      return total + itemPrice + shipping;
    }, 0);
  };

  const mobileColumns = [
    {
      key: "mobileView",
      render: (record) => (
        <div className="p-3 border rounded-lg mb-3">
          <div className="flex gap-3">
            <div className="relative w-20 h-24 rounded overflow-hidden">
              <img
                src={`${record.book.featuredImage}`}
                alt={record.book.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-1">
              <Text strong className="block">
                {record.book.title}
              </Text>
              <div className="flex justify-between mt-1">
                <Text>${record.book.salePrice}</Text>
                <Text>x {record.quantity}</Text>
              </div>
              <Tag
                color={record.style === "Digital Copy" ? "blue" : "green"}
                className="mt-1"
              >
                {record.style}
              </Tag>
              {record.style === "Printed Copy" && (
                <Text type="secondary" className="block mt-1">
                  + ${record.book.shippingFee} shipping
                </Text>
              )}
              <div className="flex justify-end mt-2">
                <>
                  <Button
                    className="mr-2"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleCheckoutClick(record)}
                  >
                    {" "}
                    Buy Now{" "}
                  </Button>
                  <Link href={"bookOrder/" + record.book.id}>
                    <Button className="mr-2" icon={<EyeFilled />} />
                  </Link>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                  />
                </>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const desktopColumns = [
    {
      title: "Product",
      dataIndex: "book",
      key: "product",
      width: "40%",
      render: (book) => (
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-20 rounded overflow-hidden">
            <img
              src={`${book.featuredImage}`}
              alt={book.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div>
            <Text strong>{book.title}</Text>
            <div className="flex gap-2 mt-1">
              <Text delete>${book.regularPrice}</Text>
              <Text strong className="text-green-600">
                ${book.salePrice}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "style",
      key: "style",
      render: (style) => (
        <Tag color={style === "Digital Copy" ? "blue" : "green"}>{style}</Tag>
      ),
      filters: [
        { text: "Digital Copy", value: "Digital Copy" },
        { text: "Printed Copy", value: "Printed Copy" },
      ],
      onFilter: (value, record) => record.style === value,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Shipping",
      key: "shipping",
      render: (_, record) =>
        record.style === "Printed Copy" ? `$${record.book.shippingFee}` : "—",
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => {
        const subtotal = parseFloat(record.book.salePrice) * record.quantity;
        const shipping =
          record.style === "Printed Copy"
            ? parseFloat(record.book.shippingFee)
            : 0;
        return `$${(subtotal + shipping).toFixed(2)}`;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            className="mr-2"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleCheckoutClick(record)}
          >
            {" "}
            Buy Now{" "}
          </Button>
          <Link href={"bookOrder/" + record.book.id}>
            <Button className="mr-2" icon={<EyeFilled />} />
          </Link>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </>
      ),
    },
  ];

  return (
    <div className="rounded-lg shadow-md sm:p-4 p-0">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-2xl" />
          <Text strong className="text-2xl">
            Your Cart
          </Text>
          <Badge count={carts.length} showZero color="#1677ff" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={carts}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={isMobile ? undefined : { x: true }}
          size={isMobile ? "large" : "middle"}
          className="cart-management-table"
        />
      </div>

      {carts.length > 0 && (
        <div className="mt-6 p-4 rounded-lg">
          <div className="flex justify-end">
            <div className="text-right">
              <Text strong className="text-lg">
                Total: ${calculateTotal().toFixed(2)}
              </Text>
              <div className="mt-4">
                <Button type="primary" size="large" onClick={handleCheckoutAll}>
                  Proceed to Checkout All Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        title={
          checkoutAll ? "Checkout All Items" : `Checkout: ${bookInfo?.title}`
        }
        open={showCheckoutModal}
        onCancel={() => {
          setShowCheckoutModal(false);
          setCheckoutAll(false);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {checkoutAll ? (
          <StripeCheckout
            cartItems={carts}
            onSuccess={() => {
              setShowCheckoutModal(false);
              setCheckoutAll(false);
              N(
                "Success",
                "Payment successful! Thank you for your purchase.",
                "success"
              );
              fetchCartItems(); // Refresh cart after successful payment
            }}
            onError={(error) => {
              N("Error", error || "Payment failed. Please try again.", "error");
            }}
          />
        ) : (
          <StripeCheckout
            bookId={selectedCart?.book.id}
            quantity={selectedCart?.quantity}
            style={selectedCart?.style}
            shippingAddress={
              selectedCart?.style === "Printed Copy"
                ? selectedCart?.shippingAddress
                : null
            }
            bookInfo={bookInfo}
            onSuccess={() => {
              setShowCheckoutModal(false);
              N(
                "Success",
                "Payment successful! Thank you for your purchase.",
                "success"
              );
              fetchCartItems(); // Refresh cart after successful payment
            }}
            onError={(error) => {
              N("Error", error || "Payment failed. Please try again.", "error");
            }}
          />
        )}
      </Modal>

      {carts.length === 0 && !loading && (
        <div className="text-center py-8">
          <ShoppingCartOutlined className="text-4xl text-gray-300 mb-4" />
          <Text className="text-gray-500 block">Your cart is empty</Text>
          <Link href={"/book"}>
            <Button type="primary" className="mt-4">
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
