"use client";
import { useState, useRef, useEffect } from "react";
import {
  PlusOutlined,
  UploadOutlined,
  CloseSquareOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Dropdown,
  Button,
  Popconfirm,
  Space,
  Modal,
  Input,
  Upload,
  Popover,
  Select,
  Table,
} from "antd";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { checkObjectFields } from "@/app/utils/common";
import { MyAllCourse } from "@/app/utils/courseService";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

const CourseVideos = () => {
  const [courses, setCourses] = useState([]); // State to store all courses
  const [selectedCourseId, setSelectedCourseId] = useState(null); // State to store the selected course ID
  const [courseVideos, setCourseVideos] = useState([]); // State to store videos for the selected course

  const [serialNo, setSerialNo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [path, setVideo] = useState("");
  const [open, setModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoModelTitle, setVideoModelTitle] = useState("");
  const [videoModelOpen, setVideoModelOpen] = useState(false);

  // Fetch all courses on component mount
  useEffect(() => {
    getAllCourses();
  }, []);

  // Fetch videos for the selected course
  useEffect(() => {
    if (selectedCourseId) {
      getCourseVideos(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Fetch all courses
  const getAllCourses = async () => {
    try {
      const response = await MyAllCourse();

      setCourses(response.courses);
    } catch (error) {
      N("Error", "Failed to fetch courses", "error");
    }
  };

  // Fetch videos for a specific course
  const getCourseVideos = async (courseId) => {
    try {
      const response = await axios.get(`/api/getCourseVideos/${courseId}`);
      if (response.status === 200) {
        setCourseVideos(response.data);
      }
    } catch (error) {
      N("Error", "Failed to fetch videos", "error");
    }
  };

  // Handle course selection
  const handleCourseChange = (value) => {
    setSelectedCourseId(value);
  };

  // Handle video upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post("/api/upload-video", formData);
      if (response && response.status === 201) {
        N("Success", response.data.message, "success");
        setVideo(response.data.publicUrl);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  // Handle video deletion
  const handleDelete = async (video) => {
    try {
      const response = await axios.post("/api/deleteVideo", video);
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getCourseVideos(selectedCourseId);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Handle video playback
  const handleVideoPlay = async (video) => {
    try {
      const response = await axios.get(`/api/playVideo/${video.id}`);

      setVideoModelTitle(video.title);
      setVideoUrl(response.data?.videoPath);
      setVideoModelOpen(true);
    } catch (error) {
      console.error("Error streaming video:", error);
    }
  };

  // Close video modal
  const videoModelOnClose = () => {
    setVideoModelOpen(false);
    setVideoModelTitle("");
    if (videoUrl) {
      setVideoUrl(null);
    }
  };

  const handleSave = async () => {
    const videoInfo = {
      title,
      description,
      serialNo,
      path,
      courseId: selectedCourseId,
    };
    console.log(videoInfo);
    // const ch = checkObjectFields(videoInfo)
    const ch = { success: true, message: "" };
    if (
      !videoInfo.title &&
      !videoInfo.description &&
      !videoInfo.serialNo &&
      !videoInfo.path
    ) {
      N("Error", "Please add title, description, serialNo and path", "error");
      return;
    }
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    try {
      const response = await axios.post("/api/storeVideoInfo", videoInfo);
      if (response && response.status === 201) {
        N("Success", response.data.message, "success");
        getCourseVideos(selectedCourseId);
        onClose();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      //   N("Error", error?.response?.data?.message, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    }
  };

  const onClose = () => {
    setModalOpen(false);

    setTitle("");
    setDescription("");
    setSerialNo("");
    handleRemoveVideo();
  };

  // Table columns
  const columns = [
    {
      title: "Serial No",
      dataIndex: "serialNo",
      key: "serialNo",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Popover content={text} title="Description">
          {text?.length > 50 ? `${text.slice(0, 50)}...` : text}
        </Popover>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleVideoPlay(record)}>
            Play
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this video?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <span className="cursor-pointer text-red-500">Delete</span>
          </Popconfirm>
          {/* <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'delete',
                                    label: (
                                        <Popconfirm
                                            title="Are you sure you want to delete this video?"
                                            onConfirm={() => handleDelete(record)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <span className="cursor-pointer text-red-500">Delete</span>
                                        </Popconfirm>
                                    ),
                                },
                            ],
                        }}
                        trigger={['click']}
                    >
                        <MoreOutlined />
                    </Dropdown> */}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="text-center sm:text-left mb-4">
        <Select
          placeholder="Select a course"
          style={{ width: 300 }}
          onChange={handleCourseChange}
          className="text-left" // Add this class to align left on larger screens
        >
          {courses.map((course) => (
            <Select.Option key={course.id} value={course.id}>
              {course.title}
            </Select.Option>
          ))}
        </Select>
      </div>

      {selectedCourseId && (
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            className="mb-4"
          >
            Add Video
          </Button>

          <Table
            columns={columns}
            dataSource={courseVideos}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {/* Video Upload Modal */}
      <Modal
        title="Upload Video"
        centered
        open={open}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            Upload
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Serial No*</label>
            <Input
              type="number"
              placeholder="Enter Serial No"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title*</label>
            <Input
              placeholder="Enter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Video*</label>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-full">
                <DragDropFileUpload
                  onFileSelect={(file) => handleVideoUpload({ target: { files: [file] } })}
                  selectedFile={videoPreview ? { name: "Video Selected", previewUrl: videoPreview } : null}
                  label="Click to upload or drag and drop (MP4, AVI, MOV)"
                  accept="video/*"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Video Play Modal */}
      <Modal
        title={videoModelTitle}
        centered
        open={videoModelOpen}
        onCancel={videoModelOnClose}
        footer={[
          <Button key="cancel" onClick={videoModelOnClose}>
            Back
          </Button>,
        ]}
        width={1000}
        zIndex={99999999999}
      >
        {videoUrl && (
          <video
            key={videoUrl}
            id="video-player"
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </Modal>
    </div>
  );
};

export default CourseVideos;
