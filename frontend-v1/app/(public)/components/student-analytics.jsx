"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Spin,
  Alert,
  List,
  Progress,
  Tag,
  Empty,
} from "antd";
import {
  BookOutlined,
  StarOutlined,
  CopyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const StudentAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, progressRes, deadlinesRes] = await Promise.all([
          axios.get("/api/student/analytics/overview"),
          axios.get("/api/student/analytics/course-progress"),
          axios.get("/api/student/analytics/deadlines"),
        ]);

        setStats(overviewRes.data);
        setProgress(progressRes.data);
        setDeadlines(deadlinesRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError(
          err.response?.data?.message ||
          "An error occurred while fetching data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading Your Analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="m-8"
      />
    );
  }

  return (
    <div className="w-full max-w-full p-0 sm:px-6 sm:py-6 lg:p-8 bg-gray-50 dark:bg-[#141414] min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="mb-6 sm:mb-8 dark:text-white text-center">
          My Learning Analytics
        </Title>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6 sm:mb-8">
          <Col xs={24} sm={12} lg={8} className="sm:px-2 px-0 m-0 ">
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Courses Enrolled"
                value={stats?.coursesEnrolled}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Average Quiz Score"
                value={stats?.averageScore}
                suffix="%"
                valueStyle={{ color: "#3f8600" }}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Assignments Submitted"
                value={stats?.assignmentsSubmitted}
                valueStyle={{ color: "#1890ff" }}
                prefix={<CopyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Course Progress and Deadlines */}
        <div className="w-full -mx-2">
          <Row gutter={[16, 24]} className="mx-0 full-width-cards">
            <Col xs={24} lg={12} className="">
              <Card
                title="My Course Progress"
                bordered={false}
                className="shadow-sm max-md:mx-0 h-full"
              >
                {progress.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={progress}
                    renderItem={(item, index) => (
                      <List.Item className="!px-0">
                        <List.Item.Meta
                          title={
                            <a href="#" className="break-words">
                              {item.title}
                            </a>
                          }
                          description={
                            <Progress
                              percent={item.progress}
                              status={
                                item.progress === 100 ? "success" : "active"
                              }
                              className="!mb-0"
                            />
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No courses to track." />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12} className=" ">
              <Card
                title="Upcoming Deadlines"
                bordered={false}
                className="shadow-sm h-full"
              >
                {deadlines.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={deadlines}
                    renderItem={(item) => {
                      // Determine the link based on type
                      let link = "#";
                      switch (item.type) {
                        case "Live Class":
                          link = `/courseLiveClass/${item.courseId}`;
                          break;
                        case "Assignment":
                          link = `/courseAssignment/${item.courseId}`;
                          break;
                        case "Quiz":
                          link = `/courseQuiz/${item.courseId}`;
                          break;
                        case "Appointment":
                          link = `/appoinment`;
                          break;
                        default:
                          link = "#";
                      }

                      return (
                        <List.Item className="!px-0">
                          <a
                            href={link}
                            className="w-full hover:opacity-55 rounded-md block p-2 min-w-0"
                          >
                            <List.Item.Meta
                              avatar={
                                <ClockCircleOutlined
                                  style={{ fontSize: "20px", color: "#faad14" }}
                                />
                              }
                              title={
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="break-words flex-1 min-w-0">
                                    {item.title}
                                  </span>
                                  <Tag
                                    color={
                                      item.type === "Quiz"
                                        ? "blue"
                                        : item.type === "Assignment"
                                          ? "gold"
                                          : "green" // Live Class or others
                                    }
                                    className="flex-shrink-0"
                                  >
                                    {item.type}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div className="break-words">
                                  <Text
                                    type="secondary"
                                    className="block sm:inline"
                                  >
                                    {item.course}
                                  </Text>
                                  <Text strong className="block sm:inline">
                                    {" "}
                                    -{" "}
                                    {item.type === "Live Class"
                                      ? "Starts"
                                      : "Due"}
                                    :{" "}
                                    {dayjs(item.deadline).format(
                                      "MMM D, YYYY h:mm A"
                                    )}
                                  </Text>
                                </div>
                              }
                            />
                          </a>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <Empty description="No upcoming deadlines." />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsDashboard;
