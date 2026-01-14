// "use client";
// import { useState, useRef, useEffect } from "react";
// import {
//   PlusOutlined,
//   UploadOutlined,
//   CloseSquareOutlined,
//   MoreOutlined,
// } from "@ant-design/icons";
// import {
//   Dropdown,
//   Button,
//   Popconfirm,
//   Space,
//   Modal,
//   Input,
//   Upload,
//   Popover,
//   Select,
//   Table,
// } from "antd";
// import { N } from "@/app/utils/notificationService";
// import axios from "@/app/api/axios";
// import { checkObjectFields } from "@/app/utils/common";
// import { MyAllCourse } from "@/app/utils/courseService";
// import { useSelector } from "react-redux";

// const CourseVideos = () => {
//   const isMobile = useSelector((state) => state.commonGLobal.isMobile);
//   const apiUrl = useSelector((state) => state.commonGLobal.apiUrl);
//   const authUser = useSelector((state) => state.auth.user);
//   const [courses, setCourses] = useState([]); // State to store all courses
//   const [selectedCourseId, setSelectedCourseId] = useState(null); // State to store the selected course ID
//   const [courseVideos, setCourseVideos] = useState([]); // State to store videos for the selected course

//   const [serialNo, setSerialNo] = useState("");
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [path, setVideo] = useState("");
//   const [open, setModalOpen] = useState(false);
//   const fileInputRef = useRef(null);

//   const [videoFile, setVideoFile] = useState(null);
//   const [videoPreview, setVideoPreview] = useState(null);

//   const [videoUrl, setVideoUrl] = useState(null);
//   const [videoModelTitle, setVideoModelTitle] = useState("");
//   const [videoModelOpen, setVideoModelOpen] = useState(false);

//   // Fetch all courses on component mount
//   useEffect(() => {
//     getAllCourses();
//   }, []);

//   // Fetch videos for the selected course
//   useEffect(() => {
//     if (selectedCourseId) {
//       getCourseVideos(selectedCourseId);
//     }
//   }, [selectedCourseId]);

//   // Fetch all courses
//   const getAllCourses = async () => {
//     try {
//       const response = await MyAllCourse();

//       setCourses(response.courses);
//     } catch (error) {
//       N("Error", "Failed to fetch courses", "error");
//     }
//   };

//   // Fetch videos for a specific course
//   const getCourseVideos = async (courseId) => {
//     try {
//       const response = await axios.get(`/api/getCourseVideos/${courseId}`);
//       if (response.status === 200) {
//         setCourseVideos(response.data);
//       }
//     } catch (error) {
//       N("Error", "Failed to fetch videos", "error");
//     }
//   };

//   // Handle course selection
//   const handleCourseChange = (value) => {
//     setSelectedCourseId(value);
//   };

//   // Handle video upload
//   const handleVideoUpload = async (event) => {
//     const file = event.target.files[0];
//     setVideoFile(file);
//     setVideoPreview(URL.createObjectURL(file));

//     const formData = new FormData();
//     formData.append("video", file);

//     try {
//       const response = await axios.post("/api/upload-video", formData);
//       if (response && response.status === 201) {
//         N("Success", response.data.message, "success");
//         setVideo(response.data.path);
//       }
//     } catch (error) {
//       console.error("Error uploading video:", error);
//     }
//   };

//   // Handle video deletion
//   const handleDelete = async (video) => {
//     try {
//       const response = await axios.post("/api/deleteVideo", video);
//       if (response.status === 200) {
//         N("Success", response.data.message, "success");
//         getCourseVideos(selectedCourseId);
//       }
//     } catch (error) {
//       console.error("Error deleting video:", error);
//     }
//   };

//   // Handle video playback
//   const handleVideoPlay = async (video) => {
//     setVideoUrl(apiUrl + "/uploads" + video.path);
//     setVideoModelOpen(true);
//   };
//   // const handleVideoPlay = async (video) => {
//   //     try {
//   //         const response = await axios.get(`/api/playVideo/${video.id}`, {
//   //             responseType: 'blob',
//   //         });

//   //         if (response.data instanceof Blob) {
//   //             const newVideoUrl = URL.createObjectURL(response.data);
//   //             setVideoModelTitle(video.title);
//   //             setVideoUrl(newVideoUrl);
//   //             setVideoModelOpen(true);
//   //         }
//   //     } catch (error) {
//   //         console.error('Error streaming video:', error);
//   //     }
//   // };

//   // Close video modal
//   const videoModelOnClose = () => {
//     setVideoModelOpen(false);
//     setVideoModelTitle("");
//     if (videoUrl) {
//       URL.revokeObjectURL(videoUrl);
//       setVideoUrl(null);
//     }
//   };

//   const handleSave = async () => {
//     const videoInfo = {
//       title,
//       description,
//       serialNo,
//       path,
//       courseId: selectedCourseId,
//     };
   
//     const ch = checkObjectFields(videoInfo,['description'])
//     // const ch = { success: true, message: "" };
//     if (
//       !videoInfo.title &&
//       !videoInfo.description &&
//       !videoInfo.serialNo &&
//       !videoInfo.path
//     ) {
//       N("Error", "Please add title, description, serialNo and path", "error");
//       return;
//     }

//     if (!ch.success) {
//       N("Error", ch.message, "error");
//       return;
//     }

//     try {
//       const response = await axios.post("/api/storeVideoInfo", videoInfo);
//       if (response && response.status === 201) {
//         N("Success", response.data.message, "success");
//         getCourseVideos(selectedCourseId);
//         onClose();
//         if (fileInputRef.current) {
//           fileInputRef.current.value = "";
//         }
//       }
//     } catch (error) {
//       //   N("Error", error?.response?.data?.message, "error");
//       if (error?.response?.data?.errors?.length) {
//         N("Error", error.response.data.errors[0].message, "error");
//       }
//     }
//   };

//   const onClose = () => {
//     setModalOpen(false);

//     setTitle("");
//     setDescription("");
//     setSerialNo("");
//     handleRemoveVideo();
//   };

//   // Table columns
//   // const columns = [
//   //     {
//   //         title: 'Serial No',
//   //         dataIndex: 'serialNo',
//   //         key: 'serialNo',
//   //     },
//   //     {
//   //         title: 'Title',
//   //         dataIndex: 'title',
//   //         key: 'title',
//   //     },
//   //     {
//   //         title: 'Description',
//   //         dataIndex: 'description',
//   //         key: 'description',
//   //         render: (text) => (
//   //             <Popover content={text} title="Description">
//   //                 {text?.length > 50 ? `${text.slice(0, 50)}...` : text}
//   //             </Popover>
//   //         ),
//   //     },
//   //     {
//   //         title: 'Actions',
//   //         key: 'actions',
//   //         render: (_, record) => (
//   //             <Space>
//   //                 <Button type="link" onClick={() => handleVideoPlay(record)}>
//   //                     Play
//   //                 </Button>
//   //                 {
//   //     authUser?.roleId === 2 &&
//   //                 <Popconfirm
//   //                     title="Are you sure you want to delete this video?"
//   //                     onConfirm={() => handleDelete(record)}
//   //                     okText="Yes"
//   //                     cancelText="No"
//   //                 >
//   //                     <span className="cursor-pointer text-red-500">Delete</span>
//   //                 </Popconfirm>
//   //     }

//   //             </Space>
//   //         ),
//   //     },
//   // ];

//   const mobileColumns = [
//     {
//       key: "mobileView",
//       render: (record) => (
//         <div>
//           <div style={{ fontSize: "16px", fontWeight: "500" }}>
//             {record.serialNo}. {record.title}
//           </div>
//           <div style={{ fontSize: "14px", margin: "4px 0" }}>
//             <Popover content={record.description} title="Description">
//               {record.description?.length > 50
//                 ? `${record.description.slice(0, 50)}...`
//                 : record.description}
//             </Popover>
//           </div>
//           <div>
//             <Button
//               type="link"
//               onClick={() => handleVideoPlay(record)}
//               style={{ padding: 0 }}
//             >
//               Play
//             </Button>
//             {authUser?.roleId === 2 && (
//               <Popconfirm
//                 title="Are you sure you want to delete this video?"
//                 onConfirm={() => handleDelete(record)}
//                 okText="Yes"
//                 cancelText="No"
//               >
//                 <span
//                   className="cursor-pointer text-red-500"
//                   style={{ marginLeft: 12 }}
//                 >
//                   Delete
//                 </span>
//               </Popconfirm>
//             )}
//           </div>
//         </div>
//       ),
//     },
//   ];
//   const desktopColumns = [
//     {
//       title: "Serial No",
//       dataIndex: "serialNo",
//       key: "serialNo",
//     },
//     {
//       title: "Title",
//       dataIndex: "title",
//       key: "title",
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//       render: (text) => (
//         <Popover content={text} title="Description">
//           {text?.length > 50 ? `${text.slice(0, 50)}...` : text}
//         </Popover>
//       ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           <Button type="link" onClick={() => handleVideoPlay(record)}>
//             Play
//           </Button>
//           {authUser?.roleId === 2 && (
//             <Popconfirm
//               title="Are you sure you want to delete this video?"
//               onConfirm={() => handleDelete(record)}
//               okText="Yes"
//               cancelText="No"
//             >
//               <span className="cursor-pointer text-red-500">Delete</span>
//             </Popconfirm>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   const columns = isMobile ? mobileColumns : desktopColumns;

//   return (
//     <div>
//       <div className="text-center sm:text-left mb-4">
//         <Select
//           placeholder="Select a course"
//           style={{ width: 300 }}
//           onChange={handleCourseChange}
//           className="text-left " 
//         >
//           {courses?.map((course) => (
//             <Select.Option key={course.id} value={course.id}>
//               {course.title}
//             </Select.Option>
//           ))}
//         </Select>
//         {selectedCourseId && (
//           <div className="overflow-x-auto">
//             {authUser?.roleId === 2 && (
//               <Button
//                 type="primary"
//                 icon={<PlusOutlined />}
//                 onClick={() => setModalOpen(true)}
//                 className="m-4"
//               >
//                 Add Video
//               </Button>
//             )}

//             <Table
//               columns={columns}
//               dataSource={courseVideos}
//               rowKey="id"
//               pagination={{ pageSize: 10 }}
//             />
//           </div>
//         )}
//       </div>

//       {/* Video Upload Modal */}
//       <Modal
//         title="Upload Video"
//         centered
//         open={open}
//         onOk={handleSave}
//         onCancel={() => setModalOpen(false)}
//         footer={[
//           <Button key="cancel" onClick={() => setModalOpen(false)}>
//             Cancel
//           </Button>,
//           <Button key="submit" type="primary" onClick={handleSave}>
//             Upload
//           </Button>,
//         ]}
//         width={600}
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Serial No*</label>
//             <Input
//               type="number"
//               placeholder="Enter Serial No"
//               value={serialNo}
//               onChange={(e) => setSerialNo(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">Title*</label>
//             <Input
//               placeholder="Enter Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Description
//             </label>
//             <Input.TextArea
//               rows={3}
//               placeholder="Enter Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">Video*</label>
//             <div className="flex flex-col items-center justify-center w-full">
//               {!videoPreview ? (
//                 <label
//                   htmlFor="video-upload"
//                   className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300"
//                 >
//                   <div className="flex flex-col items-center">
//                     <UploadOutlined className="text-gray-500 text-2xl" />
//                     <p className="text-gray-600 mt-2 text-sm">
//                       Click to upload or drag and drop
//                     </p>
//                     <p className="text-xs text-gray-400">
//                       MP4, AVI, MOV (Max: 100MB)
//                     </p>
//                   </div>
//                   <input
//                     id="video-upload"
//                     type="file"
//                     accept="video/*"
//                     className="hidden"
//                     onChange={handleVideoUpload}
//                     ref={fileInputRef}
//                   />
//                 </label>
//               ) : (
//                 <div className="relative mt-4 w-full max-w-md">
//                   <video
//                     src={videoPreview}
//                     controls
//                     className="w-full rounded-lg shadow-md"
//                   />
//                   <button
//                     onClick={() => {
//                       setVideoFile(null);
//                       setVideoPreview(null);
//                     }}
//                     className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
//                   >
//                     <CloseSquareOutlined className="w-6 h-6" />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* Video Play Modal */}
//       <Modal
//         title={videoModelTitle}
//         centered
//         open={videoModelOpen}
//         onCancel={videoModelOnClose}
//         footer={[
//           <Button key="cancel" onClick={videoModelOnClose}>
//             Back
//           </Button>,
//         ]}
//         width={1000}
//         zIndex={99999999999}
//       >
//         {videoUrl && (
//           <video
//             key={videoUrl}
//             id="video-player"
//             controls
//             controlsList="nodownload"
//             onContextMenu={(e) => e.preventDefault()}
//           >
//             <source src={videoUrl} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default CourseVideos;

import CoursesSection from '../_components/courses'

export default CoursesSection
