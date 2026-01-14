"use client";
import { useState, useEffect } from "react";
import { Steps, Button, message } from "antd";
import axios from "@/app/api/axios";
import { useParams } from "next/navigation";

const { Step } = Steps;

const ModuleView = () => {
  const [module, setModule] = useState(null);
  const [current, setCurrent] = useState(0);
  const params = useParams();
  const moduleId = params.id;

  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      // In a real app, you'd fetch a single module by its ID.
      // For simplicity, we'll filter from the list fetched for the student.
      const response = await axios.get("/api/student/course-modules");
      const currentModule = response.data.find((m) => m.id == moduleId);
      if (currentModule) {
        setModule(currentModule);
        const completedIds = new Set(
          currentModule.progress.map((p) => p.completed_course_id)
        );
        const firstUncompletedIndex = currentModule.courses.findIndex(
          (c) => !completedIds.has(c.id)
        );
        setCurrent(
          firstUncompletedIndex === -1
            ? currentModule.courses.length
            : firstUncompletedIndex
        );
      }
    } catch (error) {
      console.error("Failed to fetch module details", error);
    }
  };

  const handleMarkAsComplete = async () => {
    const courseId = module.courses[current].id;
    try {
      await axios.post("/api/student/course-modules/complete", {
        course_module_id: module.id,
        course_id: courseId,
      });
      message.success("Course marked as complete!");
      // Refetch to update progress and move to the next step
      fetchModule();
    } catch (error) {
      message.error("Failed to mark as complete");
    }
  };

  if (!module) {
    return <div>Loading module details...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{module.name}</h1>
      <Steps current={current} direction="vertical">
        {module.courses.map((course) => (
          <Step
            key={course.id}
            title={course.title}
            description={course.description}
          />
        ))}
      </Steps>
      <div
        style={{
          marginTop: "20px",
          border: "1px solid #d9d9d9",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        {current < module.courses.length ? (
          <div>
            <h2>Current Course: {module.courses[current]?.title}</h2>
            <p>
              Here you would display the actual content of the course "
              {module?.courses[current]?.title}". This could be videos, text,
              quizzes, etc.
            </p>
            <Button type="primary" onClick={handleMarkAsComplete}>
              Mark as Complete & Continue
            </Button>
          </div>
        ) : (
          <h2>
            Congratulations! You have completed all courses in this module.
          </h2>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
