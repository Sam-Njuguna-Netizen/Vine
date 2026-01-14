// // frontend/app/(public)/(secondSpace)/courseDoc/page.jsx (or similar instructor/admin page)
// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { Select, Button, Modal, Input, Table, Space, Popconfirm, Tag } from 'antd'; // Added Tag for better topic display
// import { PlusOutlined, DeleteOutlined, FolderAddOutlined } from "@ant-design/icons"; // Added FolderAddOutlined
// import { N } from "@/app/utils/notificationService";
// import axios from '@/app/api/axios';
// import { MyAllCourse } from "@/app/utils/courseService"; // To fetch general courses

// const CourseDocumentsPage = () => {
//   const [courses, setCourses] = useState([]);
//   const [documentTopics, setDocumentTopics] = useState([]); // State for course-specific document topics
//   const [selectedCourseId, setSelectedCourseId] = useState(null);
//   const [selectedDocumentTopicId, setSelectedDocumentTopicId] = useState(null); // State for filtering by topic
//   const [courseDocuments, setCourseDocuments] = useState([]);

//   // States for Document Upload Modal
//   const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
//   const [serialNo, setSerialNo] = useState('');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [documentPath, setDocumentPath] = useState(''); // File path from upload response
//   const [documentTopicId, setDocumentTopicId] = useState(null); // State for topic selected in upload modal
//   const documentFileInputRef = useRef(null);

//   // States for Topic Management Modal
//   const [isTopicManagementModalOpen, setIsTopicManagementModalOpen] = useState(false);
//   const [newTopicName, setNewTopicName] = useState('');


//   useEffect(() => {
//     getAllCourses();
//   }, []);

//   useEffect(() => {
//     if (selectedCourseId) {
//       fetchDocumentTopics(selectedCourseId); // Fetch topics when a course is selected
//       getCourseDocuments(selectedCourseId, selectedDocumentTopicId); // Fetch documents for selected course and topic
//     } else {
//       // Clear states if no course is selected
//       setDocumentTopics([]);
//       setCourseDocuments([]);
//       setSelectedDocumentTopicId(null);
//       setDocumentTopicId(null);
//     }
//   }, [selectedCourseId, selectedDocumentTopicId]);


//   const getAllCourses = async () => {
//     try {
//       const response = await MyAllCourse();
//       if (response?.courses) {
//         setCourses(response.courses);
//       }
//     } catch (error) {
//       N("Error", "Failed to fetch courses", "error");
//     }
//   };

//   const fetchDocumentTopics = async (courseId) => {
//     try {
//       const response = await axios.get(`/api/courses/${courseId}/topics`);
//       if (response.status === 200 && response.data.success) {
//         setDocumentTopics(response.data.topics);
//       }
//     } catch (error) {
//       N("Error", "Failed to fetch document topics", "error");
//     }
//   };

//   const getCourseDocuments = async (courseId, topicToFilter = null) => {
//     try {
//       const params = topicToFilter ? { documentTopicId: topicToFilter } : {};
//       const response = await axios.get(`/api/getCourseDocuments/${courseId}`, { params });
//       if (response.status === 200) {
//         setCourseDocuments(response.data);
//       }
//     } catch (error) {
//       N("Error", "Failed to fetch documents", "error");
//     }
//   };

//   const handleCourseChange = (value) => {
//     setSelectedCourseId(value);
//     // Reset topic filters and selections when course changes
//     setSelectedDocumentTopicId(null);
//     setDocumentTopicId(null);
//   };

//   const handleTopicFilterChange = (value) => {
//     setSelectedDocumentTopicId(value); // Update the topic filter state
//   };

//   const handleDocumentUploadFile = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('folder', selectedCourseId); 

//     try {
//       // This assumes a separate API endpoint for just uploading the file
//       // and returning its path. The path is then used in storeDocumentInfo.
//       const response = await axios.post('/api/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           // You can add a progress bar here if desired
//           // const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           // console.log(`Upload progress: ${percentCompleted}%`);
//         },
//       });
//       if (response.status === 200 && response.data.publicUrl  ) {
//         N("Success", "Document file uploaded successfully", "success");
//         setDocumentPath(response.data.publicUrl); // Store the returned file path
//       } else {
//          N("Error", "File upload failed: No file path returned.", "error");
//       }
//     } catch (error) {
//       N("Error", error.response?.data?.message || "Document file upload failed", "error");
//       setDocumentPath(''); // Clear path on failure
//     }
//   };

//   const handleSaveDocument = async () => {
//     if (!selectedCourseId || !serialNo || !title || !documentPath || documentTopicId === null) {
//       N("Warning", "Please fill all required fields, select a topic, and ensure a document file is uploaded.", "warning");
//       return;
//     }

//     try {
//       await axios.post('/api/storeDocumentInfo', {
//         serialNo: parseInt(serialNo),
//         courseId: selectedCourseId,
//         title,
//         description,
//         path: documentPath, // Use the path obtained from file upload
//         documentTopicId, // Send the selected document topic ID
//       });
//       N("Success", "Document information stored successfully", "success");
//       setIsDocumentModalOpen(false);
//       getCourseDocuments(selectedCourseId, selectedDocumentTopicId); // Refresh documents list
//       // Reset document upload form fields
//       setSerialNo('');
//       setTitle('');
//       setDescription('');
//       setDocumentPath('');
//       setDocumentTopicId(null);
//       if (documentFileInputRef.current) {
//         documentFileInputRef.current.value = '';
//       }
//     } catch (error) {
//       N("Error", error.response?.data?.message || "Failed to store document information", "error");
//     }
//   };

//   const handleAddTopic = async () => {
//     if (!newTopicName || !selectedCourseId) {
//       N("Warning", "Topic name and course selection are required.", "warning");
//       return;
//     }
//     try {
//       const response = await axios.post('/api/topics', {
//         name: newTopicName,
//         courseId: selectedCourseId,
//       });
//       if (response.status === 201 && response.data.success) {
//         N("Success", "Topic added successfully", "success");
//         setNewTopicName('');
//         fetchDocumentTopics(selectedCourseId); // Refresh topics list
//       }
//     } catch (error) {
//       N("Error", error.response?.data?.message || "Failed to add topic", "error");
//     }
//   };

//   const handleDeleteTopic = async (topicId) => {
//     try {
//       const response = await axios.delete(`/api/topics/${topicId}`);
//       if (response.status === 200 && response.data.success) {
//         N("Success", "Topic deleted successfully", "success");
//         fetchDocumentTopics(selectedCourseId); // Refresh topics list
//         // If the deleted topic was currently selected for filtering, reset the filter
//         if (selectedDocumentTopicId === topicId) {
//           setSelectedDocumentTopicId(null);
//         }
//         // Re-fetch documents to reflect changes (documents with deleted topic might now be 'N/A')
//         getCourseDocuments(selectedCourseId, selectedDocumentTopicId);
//       }
//     } catch (error) {
//       N("Error", error.response?.data?.message || "Failed to delete topic", "error");
//     }
//   };

//   // Table columns for displaying documents
//   const documentColumns = [
//     { title: 'Serial No', dataIndex: 'serialNo', key: 'serialNo' },
//     { title: 'Title', dataIndex: 'title', key: 'title' },
//     { title: 'Description', dataIndex: 'description', key: 'description' },
//     {
//       title: 'Topic',
//       dataIndex: ['topic', 'name'], // Access the 'name' property of the nested 'topic' object
//       key: 'topicName',
//       render: (text) => text ? <Tag color="blue">{text}</Tag> : 'N/A' // Display "N/A" if no topic
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <Space size="middle">
//           {/* Add actions for viewing, editing, deleting documents here */}
//           {/* Example: */}
//           {/* <Button type="link" onClick={() => handleViewDocument(record.path)}>View</Button> */}
//           {/* <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteDocument(record.id)}>
//             <Button type="link" danger>Delete</Button>
//           </Popconfirm> */}
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Course Documents</h1>

//       <div className="mb-6">
//         <label className="block text-md font-medium text-gray-700 mb-2">Select Course:</label>
//         <Select
//           placeholder="Select a course"
//           style={{ width: '100%', maxWidth: 400 }}
//           onChange={handleCourseChange}
//           value={selectedCourseId}
//           className="rounded-md"
//         >
//           {courses.map((course) => (
//             <Select.Option key={course.id} value={course.id}>
//               {course.title}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       {selectedCourseId && (
//         <>
//           {/* Topic Management Section (for instructors/admins) */}
//           <div className="mb-6 flex items-center justify-between">
//             <h2 className="text-xl font-semibold text-gray-800">Document Topics</h2>
//             <Button
//               type="default"
//               icon={<FolderAddOutlined />}
//               onClick={() => setIsTopicManagementModalOpen(true)}
//               className="rounded-md"
//             >
//               Manage Topics
//             </Button>
//           </div>

//           {/* Filter by Topic Navbar */}
//           <div className="mb-6">
//             <label className="block text-md font-medium text-gray-700 mb-2">Filter by Topic:</label>
//             <Select
//               placeholder="Filter documents by topic"
//               style={{ width: '100%', maxWidth: 400 }}
//               onChange={handleTopicFilterChange}
//               value={selectedDocumentTopicId}
//               allowClear // Allows clearing the filter
//               className="rounded-md"
//             >
//               {documentTopics.map((topic) => (
//                 <Select.Option key={topic.id} value={topic.id}>
//                   {topic.name}
//                 </Select.Option>
//               ))}
//             </Select>
//           </div>

//           {/* Add Document Button */}
//           <div className="mb-6 text-right">
//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               onClick={() => setIsDocumentModalOpen(true)}
//               className="px-6 py-3 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300"
//             >
//               Add New Document
//             </Button>
//           </div>

//           {/* Documents Table */}
//           <Table
//             columns={documentColumns}
//             dataSource={courseDocuments}
//             rowKey="id"
//             pagination={{ pageSize: 10 }}
//             className="rounded-lg overflow-hidden shadow-md"
//           />
//         </>
//       )}

//       {/* Document Upload Modal */}
//       <Modal
//         title="Upload New Document"
//         centered
//         open={isDocumentModalOpen}
//         onOk={handleSaveDocument}
//         onCancel={() => {
//           setIsDocumentModalOpen(false);
//           // Reset all fields when modal is closed without saving
//           setSerialNo('');
//           setTitle('');
//           setDescription('');
//           setDocumentPath('');
//           setDocumentTopicId(null);
//           if (documentFileInputRef.current) {
//             documentFileInputRef.current.value = '';
//           }
//         }}
//         footer={[
//           <Button key="cancel" onClick={() => {
//             setIsDocumentModalOpen(false);
//             setSerialNo(''); setTitle(''); setDescription(''); setDocumentPath(''); setDocumentTopicId(null);
//             if (documentFileInputRef.current) documentFileInputRef.current.value = '';
//           }} className="px-6 rounded-md">Cancel</Button>,
//           <Button key="submit" type="primary" onClick={handleSaveDocument} className="px-6 rounded-md">Upload Document</Button>,
//         ]}
//         width={650}
//       >
//         <div className="space-y-4 py-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Select Topic*</label>
//             <Select
//               placeholder="Choose a topic for this document"
//               className="w-full rounded-md"
//               value={documentTopicId}
//               onChange={setDocumentTopicId}
//               options={documentTopics.map((t) => ({ label: t.name, value: t.id }))}
//               disabled={!selectedCourseId || documentTopics.length === 0} // Disable if no course/topics
//             />
//             {documentTopics.length === 0 && selectedCourseId && (
//                 <p className="text-sm text-red-500 mt-1">Please add topics for this course first using "Manage Topics".</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Serial No*</label>
//             <Input
//               type="number"
//               placeholder="Enter Serial Number"
//               value={serialNo}
//               onChange={(e) => setSerialNo(e.target.value)}
//               className="rounded-md"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
//             <Input
//               placeholder="Enter Document Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="rounded-md"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <Input.TextArea
//               rows={3}
//               placeholder="Enter Document Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="rounded-md"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document File*</label>
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
//               onChange={handleDocumentUploadFile}
//               ref={documentFileInputRef}
//               className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
//             />
//             {documentPath && <p className="text-green-600 text-sm mt-2">File uploaded: {documentPath.split('/').pop()}</p>}
//           </div>
//         </div>
//       </Modal>

//       {/* Topic Management Modal */}
//       <Modal
//         title="Manage Course-Specific Document Topics"
//         centered
//         open={isTopicManagementModalOpen}
//         onCancel={() => setIsTopicManagementModalOpen(false)}
//         footer={null} // No default footer buttons
//         width={600}
//       >
//         <div className="space-y-4 py-4">
//             <div className="flex gap-3 mb-4 items-center">
//                 <Input
//                     placeholder="New Topic Name"
//                     value={newTopicName}
//                     onChange={(e) => setNewTopicName(e.target.value)}
//                     disabled={!selectedCourseId}
//                     className="rounded-md"
//                 />
//                 <Button
//                     type="primary"
//                     onClick={handleAddTopic}
//                     disabled={!selectedCourseId || !newTopicName.trim()}
//                     className="rounded-md"
//                 >
//                     Add Topic
//                 </Button>
//             </div>

//             {selectedCourseId ? (
//                 documentTopics.length > 0 ? (
//                     <Table
//                         dataSource={documentTopics}
//                         rowKey="id"
//                         pagination={false}
//                         columns={[
//                             { title: 'Topic Name', dataIndex: 'name', key: 'name' },
//                             {
//                                 title: 'Action',
//                                 key: 'action',
//                                 render: (_, record) => (
//                                     <Popconfirm
//                                         title="Are you sure to delete this topic? Documents linked to this topic will become unassigned."
//                                         onConfirm={() => handleDeleteTopic(record.id)}
//                                         okText="Yes"
//                                         cancelText="No"
//                                         placement="left"
//                                     >
//                                         <Button danger icon={<DeleteOutlined />} size="small" className="rounded-md" />
//                                     </Popconfirm>
//                                 ),
//                             },
//                         ]}
//                         className="rounded-lg overflow-hidden shadow-sm"
//                     />
//                 ) : (
//                     <p className="text-gray-600 text-center py-4">No topics added for this course yet. Add one above!</p>
//                 )
//             ) : (
//                 <p className="text-gray-600 text-center py-4">Select a course to manage its document topics.</p>
//             )}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default CourseDocumentsPage;

import CoursesSection from '../_components/courses'

export default CoursesSection
