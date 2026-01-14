// "use client";
// import { useState, useEffect } from "react";
// import { Rate, Select, Table } from "antd";
// import { N } from "@/app/utils/notificationService";
// import axios from "@/app/api/axios";
// import moment from "moment";
// import { MyAllCourse } from "@/app/utils/courseService";
// import { useSelector } from "react-redux";
// import { useTheme } from "@/context/ThemeContext"; // Import useTheme
// import CollapsibleLongText from "@/app/Components/CollapsibleLongText";

// const CourseFeedbacks = () => {
//   const isMobile = useSelector((state) => state.commonGLobal.isMobile);
//   const { darkMode } = useTheme(); // Access darkMode state
//   const authUser = useSelector((state) => state.auth.user);
//   const [courses, setCourses] = useState([]);
//   const [selectedCourseId, setSelectedCourseId] = useState(null);
//   const [courseRatings, setCourseRatings] = useState([]);
//   const [rating, setRating] = useState(0);
//   const [averageRating, setAverageRating] = useState(0);
//   const [comment, setComment] = useState("");

//   useEffect(() => {
//     getAllCourses();
//   }, []);

//   useEffect(() => {
//     if (selectedCourseId) {
//       getCourseRatings(selectedCourseId);
//     }
//   }, [selectedCourseId]);

//   const getAllCourses = async () => {
//     try {
//       const response = await MyAllCourse();
//       if (response.courses) {
//         setCourses(response.courses);
//       }
//     } catch (error) {
//       N("Error", "Failed to fetch courses", "error");
//     }
//   };

//   const getCourseRatings = async (courseId) => {
//     try {
//       const response = await axios.get(`/api/getCourseRatings/${courseId}`);
//       if (response.status === 200) {
//         setCourseRatings(response.data);
//         const avgR =
//           response.data.length > 0
//             ? response.data.reduce(
//                 (sum, item) => sum + parseFloat(item.rating),
//                 0
//               ) / response.data.length
//             : 0;
//         setAverageRating(avgR);
//       }
//     } catch (error) {
//       N("Error", "Failed to fetch ratings", "error");
//     }
//   };

//   const handleRatingSubmit = async (value) => {
//     if (!selectedCourseId) {
//       N("Warning", "Please select a course first", "warning");
//       return;
//     }
//     if (value === 0) {
//       N("Warning", "Please provide a rating", "warning");
//       return;
//     }
//     try {
//       const response = await axios.post("/api/addEditCourseRating", {
//         courseId: selectedCourseId,
//         rating: value,
//         comment: comment.trim(),
//       });
//       if (response.status === 200) {
//         N("Success", "Rating added successfully", "success");
//         getCourseRatings(selectedCourseId);
//         setRating(0);
//         setComment("");
//       }
//     } catch (error) {
//       N("Error", "Failed to add rating", "error");
//     }
//   };

//   const handleCourseChange = (value) => {
//     setSelectedCourseId(value);
//   };

//   const columns = [
//     {
//       title: "Name",
//       dataIndex: ["user", "profile", "name"],
//       key: "user",
//       render: (name) => name || "Unknown",
//     },
//     {
//       title: "Feedback",
//       dataIndex: "rating",
//       key: "rating",
//       render: (rating) => (
//         <Rate allowHalf value={Number(rating)} disabled className="text-sm" />
//       ),
//     },
//     {
//       title: "Comment",
//       dataIndex: "comment",
//       key: "comment",
//       render: (text) =>
//         <CollapsibleLongText text={text} limit={50} /> || "No comment",
//     },
//   ];

//   return (
//     <div
//       className={`p-4 shadow-md rounded-md ${
//         darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
//       }`}
//     >
//       <div className="mb-4 text-center">
//         <Select
//           placeholder="Select a course"
//           style={{ width: 300 }}
//           onChange={handleCourseChange}
//           className={
//             darkMode ? "dark-select sm:w-full w-[80px]" : "sm:w-full w-[80px]"
//           }
//         >
//           {courses.map((course) => (
//             <Select.Option key={course.id} value={course.id}>
//               {course.title}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       {selectedCourseId && (
//         <div className="overflow-x-auto">
//           <div className="mb-4">
//             <h3
//               className={`text-lg font-medium ${
//                 darkMode ? "text-white" : "text-gray-900"
//               }`}
//             >
//               Average Rating
//             </h3>
//             <Rate
//               allowHalf
//               value={averageRating}
//               disabled
//               className={darkMode ? "dark-rate" : ""}
//             />
//             <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//               {averageRating.toFixed(1)} / 5 from {courseRatings.length} ratings
//             </p>
//           </div>
//           <div className="flex flex-col gap-2 mb-4">
//             <p className={darkMode ? "text-white" : "text-gray-900"}>
//               Add Rating & Comment:
//             </p>
//             <Rate
//               allowHalf
//               value={rating}
//               onChange={(value) => setRating(value)}
//               className={darkMode ? "dark-rate" : ""}
//             />
//             <textarea
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Write your feedback..."
//               className={`p-2 border rounded-md ${
//                 darkMode
//                   ? "bg-gray-700 text-white border-gray-600"
//                   : "bg-white text-black border-gray-300"
//               }`}
//               rows={3}
//             />
//             <button
//               onClick={() => handleRatingSubmit(rating)}
//               className={`px-4 py-2 rounded-md w-fit ${
//                 darkMode
//                   ? "bg-blue-600 text-white hover:bg-blue-700"
//                   : "bg-blue-500 text-white hover:bg-blue-600"
//               }`}
//             >
//               Submit Feedback
//             </button>
//           </div>

//           <Table
//             columns={columns}
//             dataSource={courseRatings}
//             rowKey="id"
//             pagination={{ pageSize: 10 }}
//             className={darkMode ? "dark-table" : ""}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CourseFeedbacks;
import CoursesSection from "../_components/courses";

export default CoursesSection;
