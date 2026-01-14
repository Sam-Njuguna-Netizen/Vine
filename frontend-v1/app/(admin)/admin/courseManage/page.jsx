"use client";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Button, Input, Table, Space, Modal, Select, Popconfirm } from "antd";
import Highlighter from "react-highlight-words";
import { MyAllCourse } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";
import CourseAddEditModel from "@/app/(public)/components/CourseAddEditModel";
import { checkObjectFields, deleteFile } from "@/app/utils/common";
import axios from "@/app/api/axios";

export default function CourseManage() {
  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [openCourseModal, setOpenCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const addEditCourse = useRef(null);

  const openAddCourseModel = (data = null) => {
    if (addEditCourse.current) {
      const res = addEditCourse.current.openModal(data);
    }
  };

  const responseFromAddEditCourse = (message) => {
    getAllCourses();
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  const getAllCourses = async () => {
    const response = await MyAllCourse();
    if (response?.success) {
      const formattedCourses = response.courses.map((course, index) => ({
        key: index.toString(),
        id: course.id,
        title: course.title,
        description: course.description,
        difficultyLevel: course.difficultyLevel,
        pricingModel: course.pricingModel,
        regularPrice: course.regularPrice,
        salePrice: course.salePrice,
        courseVisibility: course.courseVisibility,
        featuredImage: course.featuredImage,
        introVideo: course.introVideo,
        tags: course.tags,
        instructor: course.instructor.profile.name,
        enroles: course.enroles.length,
      }));
      setCourses(formattedCourses);
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
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
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
        text
      ),
  });

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
    },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    //   ...getColumnSearchProps("description"),
    // },
    {
      title: "Difficulty Level",
      dataIndex: "difficultyLevel",
      key: "difficultyLevel",
      ...getColumnSearchProps("difficultyLevel"),
    },
    {
      title: "Pricing Model",
      dataIndex: "pricingModel",
      key: "pricingModel",
      ...getColumnSearchProps("pricingModel"),
    },
    {
      title: "Regular Price",
      dataIndex: "regularPrice",
      key: "regularPrice",
      ...getColumnSearchProps("regularPrice"),
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
      ...getColumnSearchProps("salePrice"),
    },
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      ...getColumnSearchProps("instructor"),
    },
    {
      title: "Enrolled",
      dataIndex: "enroles",
      key: "enroles",
      ...getColumnSearchProps("enroles"),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          {/* <Button type="primary" icon={<EditOutlined />} onClick={() => openAddCourseModel(record)}>
            Edit
          </Button> */}
          <Popconfirm
            title="Are you sure you want to delete this course?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Beginner");
  const [pricingModel, setPricingModel] = useState("Paid");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("Visible");

  const handleEdit = (course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setDifficultyLevel(course.difficultyLevel);
    setPricingModel(course.pricingModel);
    setRegularPrice(course.regularPrice);
    setSalePrice(course.salePrice);
    setCourseVisibility(course.courseVisibility);
    setOpenCourseModal(true);
  };

  const resetModal = () => {
    setOpenCourseModal(false);
    setEditingCourse(null);
    setTitle("");
    setDescription("");
    setDifficultyLevel("Beginner");
    setPricingModel("Paid");
    setRegularPrice("");
    setSalePrice("");
    setCourseVisibility("Visible");
  };

  const handleDelete = async (doc) => {
    try {
      // Fetch the new video
      const videoResponse = await axios.post("/api/deleteCourse", doc);
      if (videoResponse.status === 200 && !videoResponse.data.success) {
        N("Error", videoResponse.data.message, "error");
      } else if (videoResponse.status === 200) {
        N("Success", videoResponse.data.message, "success");
        deleteFile(doc.featuredImage);
        deleteFile(doc.introVideo);
        getAllCourses();
      } else {
        N("Error", "videoResponse.data.message", "error");
      }
    } catch (error) {
      console.error("Error streaming video:", error);
    }
  };

  const handleSaveCourse = async () => {
    if (
      !title ||
      !description ||
      !difficultyLevel ||
      !pricingModel ||
      !regularPrice ||
      !salePrice ||
      !courseVisibility
    ) {
      N("Error", "All fields are required!", "error");
      return;
    }

    if (editingCourse) {
      const updatedCourse = {
        id: editingCourse.id,
        title,
        description,
        difficultyLevel,
        pricingModel,
        regularPrice,
        salePrice,
        courseVisibility,
      };
      // Implement update course logic here
      // const response = await updateCourse(updatedCourse);
      // if (response.success) {
      //   getAllCourses();
      //   N("Success", "Course updated successfully!", "success");
      // } else {
      //   N("Error", "Failed to update course!", "error");
      // }
    } else {
      const newCourse = {
        title,
        description,
        difficultyLevel,
        pricingModel,
        regularPrice,
        salePrice,
        courseVisibility,
      };
      // Implement add course logic here
      // const response = await addCourse(newCourse);
      // if (response.success) {
      //   getAllCourses();
      //   N("Success", "Course added successfully!", "success");
      // } else {
      //   N("Error", "Failed to add course!", "error");
      // }
    }

    resetModal();
  };

  return (
    <div className="rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <p className="text-2xl font-semibold">Course Management</p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => openAddCourseModel()}
        >
          Add Course
        </Button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={courses}
          loading={courses.length === 0}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <CourseAddEditModel
        ref={addEditCourse}
        sendMessage={responseFromAddEditCourse}
      />
    </div>
  );
}
