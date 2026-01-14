"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

import CourseOverview from '../../components/CourseOverview'

export default function CourseDetail() {

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollNowButton, setEnrollNowButton] = useState(true);
  const authUser = useSelector((state) => state.auth.user);

  // Fetch course details from API
  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  async function fetchCourse() {
    try {
      const res = await axios.get(`/api/course/${id}`);
      if (res.data) {
        setCourse(res.data);
        enrollNowButtonSetup(res.data)
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }

  async function enrollNowButtonSetup(data) {
    if (data.payment.length) {
      N('Information', 'This course is in your purchase list.', 'info')
      setEnrollNowButton(false);
      return;
    }
    // Check for active subscription
    if (authUser?.expiryDate && new Date(authUser.expiryDate) > new Date()) {
      // User has subscription, so they "have access" (button will show "Included" handled in Overview)
      // Actually CourseOverview handles the UI for "Included". 
      // We just need to make sure we don't force it to false unless we want to hide it completely?
      // The requirement is "Hybrid Access".
      // If I set enrollNowButton to false here, the whole block in Overview might disappear?
      // In Overview: {enrollButton && authUser?.roleId === 3 && ...}
      // If I set it to true, my Overview change will show "Included with Subscription".
      // So I should keep it TRUE if they have subscription, but FALSE if they bought it individually?
      // If they bought it, payment.length > 0, so it sets to false.
      // If they haven't bought it but have subscription, it stays TRUE.
      // Then Overview logic checks expiry and shows "Included" instead of "Enroll".
      // So actually, no change needed here?
      // Wait, if I set it to false here, Overview hides the button entirely.
      // If I want to show "Included", I must ensure it stays true.
      // So... I don't need to change this function?
      // Let's verify.
      // Originally: sets to false if payment.length.
      // If no payment, it stays true.
      // So if I have subscription but NO payment record, it stays true.
      // Then Overview shows "Included". Correct.
      // But wait, if they have subscription, maybe we want to tell them?
      // N('Information', 'You have access via subscription', 'info')?
      // That might be annoying on every page load.
    }
  }

  return (
    // <CourseOverview course={course} enrollButton={enrollNowButton} />
    <CourseOverview course={course} enrollButton={false} />
  );
}
