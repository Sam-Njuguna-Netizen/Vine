// 'use client';
// import { useState, useEffect } from 'react';
// import {
//     Dropdown, Modal, Button, Input, Select, Table, Radio, List, Tag, message, Typography, Divider,
//     TimePicker, Popover, ConfigProvider, DatePicker, Space, Popconfirm, Form, Avatar
// } from 'antd';
// import { MoreOutlined, PlusOutlined, UploadOutlined, CloseSquareOutlined, MinusCircleOutlined } from "@ant-design/icons";
// import { N } from "@/app/utils/notificationService";
// import axios from '@/app/api/axios';
// import moment from 'moment';
// import { MyAllCourse } from "@/app/utils/courseService";
// import { useSelector } from "react-redux";
// import { useTheme } from "@/context/ThemeContext";
// import CollapsibleLongText from '@/app/Components/CollapsibleLongText';

// const CourseDiscussion = () => {
//     const isMobile = useSelector((state) => state.commonGLobal.isMobile);
//     const { darkMode } = useTheme();
//     const authUser = useSelector((state) => state.auth?.user);
//     const [courses, setCourses] = useState([]);
//     const [selectedCourseId, setSelectedCourseId] = useState(null);
//     const [selectedCourse, setSelectedCourse] = useState(null);
//     const [courseComments, setCourseComments] = useState([]);
//     const [comment, setComment] = useState('');
//     const [isModalOpen, setModalOpen] = useState(false);
//     const [selectedComment, setSelectedComment] = useState(null);
//     const [replyText, setReplyText] = useState('');

//     // Fetch all courses on mount
//     useEffect(() => {
//         getAllCourses();
//     }, []);

//     // Fetch comments when course changes
//     useEffect(() => {
//         if (selectedCourseId) {
//             getCourseComments(selectedCourseId);
//         }
//     }, [selectedCourseId]);

//     const getAllCourses = async () => {
//         try {
//             const response = await MyAllCourse();
//             if (response?.courses) {
//                 setCourses(response.courses);
//             }
//         } catch (error) {
//             N("Error", "Failed to fetch courses", "error");
//         }
//     };

//     const getCourseComments = async (courseId) => {
//         try {
//             const response = await axios.get(`/api/getCourseComments/${courseId}`);
//             if (response.status === 200) {
//                 setCourseComments(response.data || []);
//             }
//         } catch (error) {
//             N("Error", "Failed to fetch comments", "error");
//         }
//     };

//     const handleCommentSubmit = async () => {
//         if (!comment.trim()) {
//             N("Warning", "Comment cannot be empty", "warning");
//             return;
//         }

//         try {
//             const response = await axios.post('/api/addCourseComment', {
//                 courseId: selectedCourseId,
//                 comment,
//             });

//             if (response.status === 200) {
//                 N("Success", "Comment added successfully", "success");
//                 setComment('');
//                 getCourseComments(selectedCourseId);
//             }
//         } catch (error) {
//             N("Error", "Failed to add comment", "error");
//         }
//     };

//     const handleDelete = async (doc) => {
//         try {
//             const response = await axios.post('/api/deleteQuiz', doc);
//             if (response.status === 200) {
//                 N('Success', response.data.message, 'success');
//                 getCourseComments(selectedCourseId);
//             }
//         } catch (error) {
//             N('Error', 'Failed to delete comment', 'error');
//         }
//     };

//     const handleCourseChange = (value) => {
//         setSelectedCourseId(value);
//         const selected = courses.find((c) => c.id === value);
//         setSelectedCourse(selected || null);
//     };

//     const showRepliesModal = (comment) => {
//         setSelectedComment(comment);
//         setModalOpen(true);
//     };

//     const handleReplySubmit = async () => {
//         if (!replyText.trim()) {
//             N("Warning", "Reply cannot be empty", "warning");
//             return;
//         }

//         try {
//             const response = await axios.post('/api/addCommentReply', {
//                 courseCommentId: selectedComment.id,
//                 comment: replyText,
//             });

//             if (response.status === 200) {
//                 N("Success", "Reply added successfully", "success");
//                 setReplyText('');
//                 // Refresh the comments to show the new reply
//                 getCourseComments(selectedCourseId);
//                 // Also update the selected comment in the modal
//                 setSelectedComment({
//                     ...selectedComment,
//                     replis: [response.data, ...(selectedComment.replis || [])]
//                 });
//             }
//         } catch (error) {
//             N("Error", "Failed to add reply", "error");
//         }
//     };

//     const mobileColumns = [
//         {
//             key: 'mobileView',
//             render: (record) => (
//                 <div
//                     className={`p-3 mb-2 rounded-lg cursor-pointer`}
//                 >
//                     <div className="flex items-start gap-3">
//                         <Avatar src={record?.user?.profile?.pPic} size="large" />
//                         <div className="flex-1">
//                             <div className={`text-base font-medium`}>
//                                 {record?.user?.profile?.name || "Unknown"}
//                             </div>
//                             <div className={`text-sm my-1`}>
//                                 <CollapsibleLongText text={record.comment} limit={50} />
//                             </div>
//                             <div className={`text-xs`}>
//                                 {moment(record.createdAt).format("YYYY-MM-DD HH:mm")}
//                             </div>
//                             <Button type='primary' onClick={() => showRepliesModal(record)}>Show</Button>
//                             {record.replis?.length > 0 && (
//                                 <div className={`text-xs mt-1`}>
//                                     {record.replis.length} {record.replis.length === 1 ? 'reply' : 'replies'}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             ),
//         },
//     ];

//     const desktopColumns = [
//         {
//             title: 'Name',
//             dataIndex: 'user',
//             key: 'user',
//             render: (user) => (
//                 <div className="flex items-center gap-2">
//                     <Avatar src={user?.profile?.pPic} size="small" />
//                     <span>{user?.profile?.name || "Unknown"}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Comment',
//             dataIndex: 'comment',
//             key: 'comment',
//             render: (text, record) => (
//                     <CollapsibleLongText text={text} limit={50} />
//             ),
//         },
//         {
//             title: 'Date',
//             dataIndex: 'createdAt',
//             key: 'createdAt',
//             render: (date, record) => (
//                 <div className="flex flex-col">
//                     <span>{moment(date).format("YYYY-MM-DD HH:mm")}</span>
//                     {record.replis?.length > 0 && (
//                         <span className="text-xs text-purple-600">
//                             {record.replis.length} {record.replis.length === 1 ? 'reply' : 'replies'}
//                         </span>
//                     )}
//                 </div>
//             ),
//         },
//         {
//             title: 'Action',
//             dataIndex: 'reply',
//             key: 'reply',
//             render: (date, record) => (
//                 <div className="flex flex-col">
//                     <Button type='primary' onClick={() => showRepliesModal(record)}>Show</Button>
//                     {record.replis?.length > 0 && (
//                         <span className="text-xs text-purple-600">
//                             {record.replis.length} {record.replis.length === 1 ? 'reply' : 'replies'}
//                         </span>
//                     )}
//                 </div>
//             ),
//         },
//     ];

//     const columns = isMobile ? mobileColumns : desktopColumns;

//     return (
//         <div className={`p-4 shadow-md rounded-md `}>
//             <div className='text-center'>
//                 <div className="mb-4">
//                     <Select
//                         placeholder="Select a course"
//                         style={{ width: 300 }}
//                         onChange={handleCourseChange}
//                         value={selectedCourseId}
//                     >
//                         {courses.map((course) => (
//                             <Select.Option key={course.id} value={course.id}>
//                                 {course.title}
//                             </Select.Option>
//                         ))}
//                     </Select>
//                 </div>
//             </div>

//             {selectedCourseId && (
//                 <div className="overflow-x-auto">
//                     <div className="flex gap-2 mb-4">
//                         <Input
//                             className={`flex-1 p-2 border rounded `}
//                             placeholder="Write a comment..."
//                             value={comment}
//                             onChange={(e) => setComment(e.target.value)}
//                             onPressEnter={handleCommentSubmit}
//                         />
//                         <Button type="primary" onClick={handleCommentSubmit}>
//                             Submit
//                         </Button>
//                     </div>

//                     {isMobile ? (
//                         <List
//                             dataSource={courseComments}
//                             renderItem={(item) => mobileColumns[0].render(item)}
//                         />
//                     ) : (
//                         <Table
//                             columns={desktopColumns}
//                             dataSource={courseComments}
//                             rowKey="id"
//                             pagination={{ pageSize: 10 }}

//                         />
//                     )}
//                 </div>
//             )}

//             {/* Replies Modal */}
//             <Modal
//                 title={
//                     <div className="flex items-center gap-2">
//                         <Avatar src={selectedComment?.user?.profile?.pPic} />
//                         <span>{selectedComment?.user?.profile?.name}'s Comment</span>
//                     </div>
//                 }
//                 open={isModalOpen}
//                 onCancel={() => setModalOpen(false)}
//                 footer={null}
//                 width={isMobile ? '90%' : '60%'}
//             >
//                 <div className={`mb-4 p-4 rounded-lg `}>
//                     <p>{selectedComment?.comment}</p>
//                     <p className={`text-xs mt-2`}>
//                         Posted on {moment(selectedComment?.createdAt).format("MMMM Do YYYY, h:mm a")}
//                     </p>
//                 </div>

//                 {/* Reply Input */}
//                 <div className="mb-6">
//                     <Input.TextArea
//                         rows={3}
//                         placeholder="Write your reply..."
//                         value={replyText}
//                         onChange={(e) => setReplyText(e.target.value)}
//                         className={`mb-2`}
//                     />
//                     <Button type="primary" onClick={handleReplySubmit}>
//                         Post Reply
//                     </Button>
//                 </div>

//                 {/* Replies List */}
//                 <Divider orientation="left">
//                     Replies ({selectedComment?.replis?.length || 0})
//                 </Divider>

//                 <div className={`space-y-4 max-h-96 overflow-y-auto`}>
//                     {selectedComment?.replis?.length > 0 ? (
//                         selectedComment.replis.map((reply) => (
//                             <div
//                                 key={reply.id}
//                                 className={`p-3 rounded-lg`}
//                             >
//                                 <div className="flex items-start gap-3">
//                                     <Avatar src={reply?.user?.profile?.pPic} />
//                                     <div className="flex-1">
//                                         <div className="flex justify-between items-center">
//                                             <span className={`font-medium`}>
//                                                 {reply?.user?.profile?.name}
//                                             </span>
//                                             <span className={`text-xs`}>
//                                                 {moment(reply.createdAt).fromNow()}
//                                             </span>
//                                         </div>
//                                         <p className={`mt-1`}>
//                                             {reply.comment}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <p className={`text-center py-4`}>
//                             No replies yet. Be the first to reply!
//                         </p>
//                     )}
//                 </div>
//             </Modal>
//         </div>
//     );
// };

// export default CourseDiscussion;
import CoursesSection from "../_components/courses";

export default CoursesSection;
