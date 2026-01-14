'use client';
import { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import { N } from "@/app/utils/notificationService";
import axios from '@/app/api/axios';
import moment from 'moment';

const CourseDiscussion = ({ course }) => {
    const [courseComments, setCourseComments] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        getCourseComments();
    }, [course.id]);

    // Fetch existing comments
    const getCourseComments = async () => {
        try {
            const response = await axios.get(`/api/getCourseComments/${course.id}`);
            if (response.status === 200) {
                setCourseComments(response.data);
            }
        } catch (error) {
            N("Error", "Failed to fetch comments", "error");
        }
    };

    // Submit a new comment
    const handleCommentSubmit = async () => {
        if (!comment.trim()) {
            N("Warning", "Comment cannot be empty", "warning");
            return;
        }

        try {
            const response = await axios.post('/api/addCourseComment', {
                courseId: course.id,
                comment,
            });

            if (response.status === 200) {
                N("Success", "Comment added successfully", "success");
                setComment('');
                getCourseComments(); // Refresh comments
            }
        } catch (error) {
            N("Error", "Failed to add comment", "error");
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-semibold mb-4">Course Discussion</h2>

            {/* Comment Input */}
            <div className="flex gap-2 mb-4">
                <Input
                    className="flex-1 p-2 border rounded"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <Button type="primary" onClick={handleCommentSubmit}>
                    Submit
                </Button>
            </div>

            <div className="mb-7 ps-10">
                {/*begin::Reply*/}
                {courseComments.length > 0 ? (
                    courseComments.map((cmt) => (
                <div className="d-flex mb-5" key={cmt.id}>
                    {/*begin::Avatar*/}
                    <div className="symbol symbol-45px me-5">
                        <img src={cmt.user.profile.pPic} />
                    </div>
                    {/*end::Avatar*/}
                    {/*begin::Info*/}
                    <div className="d-flex flex-column flex-row-fluid">
                        {/*begin::Info*/}
                        <div className="d-flex align-items-center flex-wrap mb-1">
                            <a href="#" className="text-gray-800 text-hover-primary fw-bolder me-2">{cmt.user.profile.name}</a>
                            <span className="text-gray-400 fw-bold fs-7">{moment(cmt.createdAt).startOf('second').fromNow()}</span>
                        </div>
                        {/*end::Info*/}
                        {/*begin::Post*/}
                        <span className="text-gray-800 fs-7 fw-normal pt-1">{cmt.comment}</span>
                        {/*end::Post*/}
                    </div>
                    {/*end::Info*/}
                </div>
                ))
            ) : (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
                {/*end::Reply*/}
            </div>
        </div>
    );
};

export default CourseDiscussion;
