'use client';
import { useState, useEffect } from 'react';
import { Button, Rate } from 'antd';
import { N } from "@/app/utils/notificationService";
import axios from '@/app/api/axios';
import moment from 'moment';

const CourseFeedbacks = ({ course }) => {
    const [courseRatings, setCourseRatings] = useState([]);
    const [rating, setRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        getCourseRatings();
    }, [course.id]);

    // Fetch existing ratings
    const getCourseRatings = async () => {
        try {
            const response = await axios.get(`/api/getCourseRatings/${course.id}`);
            if (response.status === 200) {
                setCourseRatings(response.data);
                const avgR = response.data.length > 0 
    ? response.data.reduce((sum, item) => sum + parseFloat(item.rating), 0) / response.data.length 
    : 0;
    setAverageRating(avgR)
            }
        } catch (error) {
            N("Error", "Failed to fetch ratings", "error");
        }
    };

    // Submit a new rating
    const handleRatingSubmit = async (value) => {
        // setRating(value)
        try {
        if (value === 0) {
            N("Warning", "Please provide a rating", "warning");
            return;
        }
            const response = await axios.post('/api/addEditCourseRating', {
                courseId: course.id,
                rating: value,
            });

            if (response.status === 200) {
                N("Success", "Rating added successfully", "success");
                // setRating(0);
                getCourseRatings(); // Refresh ratings
            }
        } catch (error) {
            N("Error", "Failed to add rating", "error");
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-semibold mb-4">Course Ratings</h2>

            {/* Average Rating Display */}
            <div className="mb-4">
                <h3 className="text-lg font-medium">Average Rating</h3>
                <Rate allowHalf value={averageRating} disabled />
                <p className="text-gray-500">{averageRating.toFixed(1)} / 5 from {courseRatings.length} ratings</p>
            </div>

            {/* Rating Input */}
            <div className="flex flex-col gap-2 mb-4">
                <Rate
                    allowHalf
                    value={rating}
                    onChange={(value) => handleRatingSubmit(value)}
                />
            </div>

            {/* Display Individual Ratings */}
            <div className="mb-7">
                {courseRatings.length > 0 ? (
                    courseRatings.map((rt) => (
                        <div className="flex mb-5" key={rt.id}>
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                <img
                                    src={rt.user?.profile?.pPic}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Rating Info */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">
                                        {rt.user?.profile?.name || 'Unknown User'}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        {moment(rt.createdAt).fromNow()}
                                    </span>
                                </div>
                                <Rate
                                    allowHalf
                                    value={Number(rt.rating)}
                                    disabled
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No ratings yet. Be the first to rate this course!</p>
                )}
            </div>
        </div>
    );
};

export default CourseFeedbacks;
