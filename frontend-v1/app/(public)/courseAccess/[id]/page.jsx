"use client";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { Segmented, Tabs, Dropdown, Space, Button, Flex } from "antd";
import CourseVideos from "../../components/CourseVideos";
import CourseDocuments from "../../components/CourseDocuments";
import CourseDiscussion from "../../components/CourseDiscussion";
import CourseFeedbacks from "../../components/CourseFeedbacks";
import CourseQuiz from "../../components/CourseQuiz";
import CourseAssignments from "../../components/CourseAssignments";
import LiveClassSchedules from "../../components/LiveClassSchedules";
import { createStripeAccount } from "@/app/utils/stripe";
import { N } from "@/app/utils/notificationService";
import ButtonSuccess from "@/app/Components/ButtonSuccess";
import { useRouter, useSearchParams } from "next/navigation";

import CourseOverview from "../../components/CourseOverview";
import { useParams } from "next/navigation";
import axios from "@/app/api/axios";

export default function CourseAccess() {
  const authUser = useSelector((state) => state.auth.user);
  const router = useRouter();

  const { id } = useParams();
  const [course, setCourse] = useState(null);

  // Fetch course details from API
  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  async function fetchCourse() {
    try {
      const res = await axios.get(`/api/courseInAccessPage/${id}`);
      if (res.data) {
        setCourse(res.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      router.push("/profile");
    }
  }

  const [alignValue, setAlignValue] = React.useState("center");

  const callCreateStripeAccount = () => {
    N("Information", "Please wait...", "info");
    const res = createStripeAccount();
    if (!res.success) {
      // N('Error', res.message, 'error')
    }
  };

  const hzondalProfItem = [
    {
      key: "1",
      label: "Overview",
      children: <CourseOverview course={course} enrollButton={false} />,
    },
    {
      key: "2",
      label: "Videos",
      children: <CourseVideos course={course} />,
    },
    {
      key: "3",
      label: "Documents",
      children: <CourseDocuments course={course} />,
    },
    {
      key: "4",
      label: "Live Class Schedules",
      children: <LiveClassSchedules course={course} />,
    },
    {
      key: "5",
      label: "Discussions",
      children: <CourseDiscussion course={course} />,
    },
    {
      key: "6",
      label: "Assignments",
      children: <CourseAssignments course={course} />,
    },
    {
      key: "7",
      label: "Quiz",
      children: <CourseQuiz course={course} />,
    },
    {
      key: "8",
      label: "Feedback",
      children: <CourseFeedbacks course={course} />,
    },
  ];
  useEffect(() => {}, []);

  return (
    <div
      id="kt_content_container"
      className="d-flex flex-column-fluid align-items-start container-xxl"
    >
      {/*begin::Post*/}
      <div className="content flex-row-fluid" id="kt_content">
        {/*begin::Navbar*/}
        <div className="card mb-5 mb-xxl-8">
          <div className="card-body pt-9 pb-0">
            {/*begin::Details*/}
            <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
              {/*begin: Pic*/}
              <div className="me-7 mb-4">
                <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                  <img
                    src={
                      authUser?.profile?.pPic?.startsWith("http")
                        ? authUser.profile.pPic
                        : "/default.jpg"
                    }
                    alt="image"
                  />
                  <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border-4 border-white h-20px w-20px" />
                </div>
              </div>
              {/*end::Pic*/}
              {/*begin::Info*/}
              <div className="flex-grow-1">
                {/*begin::Title*/}
                <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                  {/*begin::User*/}
                  <div className="d-flex flex-column">
                    {/*begin::Name*/}
                    <div className="d-flex align-items-center mb-2">
                      <a
                        href="#"
                        className="text-gray-900 text-hover-primary fs-2 fw-bolder me-1"
                      >
                        {" "}
                        {authUser?.profile?.name}{" "}
                      </a>
                      <a href="#">
                        {/*begin::Svg Icon | path: icons/duotune/general/gen026.svg*/}
                        <span className="svg-icon svg-icon-1 svg-icon-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M10.0813 3.7242C10.8849 2.16438 13.1151 2.16438 13.9187 3.7242V3.7242C14.4016 4.66147 15.4909 5.1127 16.4951 4.79139V4.79139C18.1663 4.25668 19.7433 5.83365 19.2086 7.50485V7.50485C18.8873 8.50905 19.3385 9.59842 20.2758 10.0813V10.0813C21.8356 10.8849 21.8356 13.1151 20.2758 13.9187V13.9187C19.3385 14.4016 18.8873 15.491 19.2086 16.4951V16.4951C19.7433 18.1663 18.1663 19.7433 16.4951 19.2086V19.2086C15.491 18.8873 14.4016 19.3385 13.9187 20.2758V20.2758C13.1151 21.8356 10.8849 21.8356 10.0813 20.2758V20.2758C9.59842 19.3385 8.50905 18.8873 7.50485 19.2086V19.2086C5.83365 19.7433 4.25668 18.1663 4.79139 16.4951V16.4951C5.1127 15.491 4.66147 14.4016 3.7242 13.9187V13.9187C2.16438 13.1151 2.16438 10.8849 3.7242 10.0813V10.0813C4.66147 9.59842 5.1127 8.50905 4.79139 7.50485V7.50485C4.25668 5.83365 5.83365 4.25668 7.50485 4.79139V4.79139C8.50905 5.1127 9.59842 4.66147 10.0813 3.7242V3.7242Z"
                              fill="#00A3FF"
                            />
                            <path
                              className="permanent"
                              d="M14.8563 9.1903C15.0606 8.94984 15.3771 8.9385 15.6175 9.14289C15.858 9.34728 15.8229 9.66433 15.6185 9.9048L11.863 14.6558C11.6554 14.9001 11.2876 14.9258 11.048 14.7128L8.47656 12.4271C8.24068 12.2174 8.21944 11.8563 8.42911 11.6204C8.63877 11.3845 8.99996 11.3633 9.23583 11.5729L11.3706 13.4705L14.8563 9.1903Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                        {/*end::Svg Icon*/}
                      </a>
                    </div>
                    {/*end::Name*/}
                    {/*begin::Info*/}
                    <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                      <a
                        href="#"
                        className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2"
                      >
                        {/*begin::Svg Icon | path: icons/duotune/communication/com006.svg*/}
                        <span className="svg-icon svg-icon-4 me-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              opacity="0.3"
                              d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z"
                              fill="black"
                            />
                            <path
                              d="M12 22C14.6 22 17 21 18.7 19.4C17.9 16.9 15.2 15 12 15C8.8 15 6.09999 16.9 5.29999 19.4C6.99999 21 9.4 22 12 22Z"
                              fill="black"
                            />
                          </svg>
                        </span>
                        {/*end::Svg Icon*/}
                        {authUser?.userRole?.roleName}
                      </a>
                      <a
                        href="#"
                        className="d-flex align-items-center text-gray-400 text-hover-primary mb-2"
                      >
                        {/*begin::Svg Icon | path: icons/duotune/communication/com011.svg*/}
                        <span className="svg-icon svg-icon-4 me-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              opacity="0.3"
                              d="M21 19H3C2.4 19 2 18.6 2 18V6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6V18C22 18.6 21.6 19 21 19Z"
                              fill="black"
                            />
                            <path
                              d="M21 5H2.99999C2.69999 5 2.49999 5.10005 2.29999 5.30005L11.2 13.3C11.7 13.7 12.4 13.7 12.8 13.3L21.7 5.30005C21.5 5.10005 21.3 5 21 5Z"
                              fill="black"
                            />
                          </svg>
                        </span>
                        {/*end::Svg Icon*/}
                        {authUser?.email}
                      </a>
                    </div>
                    {/*end::Info*/}
                  </div>
                  {/*end::User*/}
                  {/*begin::Actions*/}
                  <div className="d-flex my-4"></div>
                  {/*end::Actions*/}
                </div>
                {/*end::Title*/}
                {/*begin::Stats*/}
                <div className="d-flex flex-wrap flex-stack">
                  {/*begin::Wrapper*/}
                  <div className="d-flex flex-column flex-grow-1 pe-8">
                    {/*begin::Stats*/}
                    <div className="d-flex flex-wrap">
                      {/*begin::Stat*/}
                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        {/*begin::Number*/}
                        <div className="d-flex align-items-center">
                          {/*begin::Svg Icon | path: icons/duotune/arrows/arr066.svg*/}
                          <span className="svg-icon svg-icon-3 svg-icon-success me-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                opacity="0.5"
                                x={13}
                                y={6}
                                width={13}
                                height={2}
                                rx={1}
                                transform="rotate(90 13 6)"
                                fill="black"
                              />
                              <path
                                d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z"
                                fill="black"
                              />
                            </svg>
                          </span>
                          {/*end::Svg Icon*/}
                          <div
                            className="fs-2 fw-bolder"
                            data-kt-countup="true"
                            data-kt-countup-value={4500}
                            data-kt-countup-prefix="$"
                          >
                            0
                          </div>
                        </div>
                        {/*end::Number*/}
                        {/*begin::Label*/}
                        <div className="fw-bold fs-6 text-gray-400">
                          Earnings
                        </div>
                        {/*end::Label*/}
                      </div>
                      {/*end::Stat*/}
                      {/*begin::Stat*/}
                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        {/*begin::Number*/}
                        <div className="d-flex align-items-center">
                          {/*begin::Svg Icon | path: icons/duotune/arrows/arr065.svg*/}
                          <span className="svg-icon svg-icon-3 svg-icon-danger me-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                opacity="0.5"
                                x={11}
                                y={18}
                                width={13}
                                height={2}
                                rx={1}
                                transform="rotate(-90 11 18)"
                                fill="black"
                              />
                              <path
                                d="M11.4343 15.4343L7.25 11.25C6.83579 10.8358 6.16421 10.8358 5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75L11.2929 18.2929C11.6834 18.6834 12.3166 18.6834 12.7071 18.2929L18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25C17.8358 10.8358 17.1642 10.8358 16.75 11.25L12.5657 15.4343C12.2533 15.7467 11.7467 15.7467 11.4343 15.4343Z"
                                fill="black"
                              />
                            </svg>
                          </span>
                          {/*end::Svg Icon*/}
                          <div
                            className="fs-2 fw-bolder"
                            data-kt-countup="true"
                            data-kt-countup-value={80}
                          >
                            0
                          </div>
                        </div>
                        {/*end::Number*/}
                        {/*begin::Label*/}
                        <div className="fw-bold fs-6 text-gray-400">
                          Projects
                        </div>
                        {/*end::Label*/}
                      </div>
                      {/*end::Stat*/}
                      {/*begin::Stat*/}
                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        {/*begin::Number*/}
                        <div className="d-flex align-items-center">
                          {/*begin::Svg Icon | path: icons/duotune/arrows/arr066.svg*/}
                          <span className="svg-icon svg-icon-3 svg-icon-success me-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                opacity="0.5"
                                x={13}
                                y={6}
                                width={13}
                                height={2}
                                rx={1}
                                transform="rotate(90 13 6)"
                                fill="black"
                              />
                              <path
                                d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z"
                                fill="black"
                              />
                            </svg>
                          </span>
                          {/*end::Svg Icon*/}
                          <div
                            className="fs-2 fw-bolder"
                            data-kt-countup="true"
                            data-kt-countup-value={60}
                            data-kt-countup-prefix="%"
                          >
                            0
                          </div>
                        </div>
                        {/*end::Number*/}
                        {/*begin::Label*/}
                        <div className="fw-bold fs-6 text-gray-400">
                          Success Rate
                        </div>
                        {/*end::Label*/}
                      </div>
                      {/*end::Stat*/}
                    </div>
                    {/*end::Stats*/}
                  </div>
                  {/*end::Wrapper*/}
                </div>
                {/*end::Stats*/}
              </div>
              {/*end::Info*/}
            </div>
          </div>
        </div>
        {/*end::Navbar*/}

        <Tabs
          defaultActiveKey="1"
          items={hzondalProfItem}
          // onChange={onChange}
          indicator={{
            size: (origin) => origin - 20,
            align: alignValue,
          }}
        />

        {/*end::Row*/}
      </div>
      {/*end::Post*/}
    </div>
  );
}
