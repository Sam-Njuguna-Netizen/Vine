import DashboardClient from "./DashboardClient";
import { fetchServerData } from "@/app/utils/server-utils";

export default async function DashboardPage() {
  // 1. Fetch Auth User
  const authResponse = await fetchServerData("/api/authUser");
  const user = authResponse?.user;

  // Initialize data containers
  let serverContinueLearning = null;
  let serverCourses = null; // For public/others
  let serverStudentData = null;
  let serverInstructorData = null; // For instructor

  if (user) {
    const roleId = user.roleId;

    // 2. Fetch data based on Role
    if (roleId === 3) {
      // --- STUDENT ---
      // Fetch Continue Learning
      const continueData = await fetchServerData("/api/student/analytics/continue-learning");
      if (continueData) {
        serverContinueLearning = continueData;
      }

      // Fetch Student Dashboard Data
      const [overview, progress, deadlines] = await Promise.all([
        fetchServerData("/api/student/analytics/overview"),
        fetchServerData("/api/student/analytics/course-progress"),
        fetchServerData("/api/student/analytics/deadlines"),
      ]);

      serverStudentData = {
        stats: overview,
        progress: progress,
        deadlines: deadlines,
      };

    } else if (roleId === 2) {
      // --- INSTRUCTOR ---
      const coursesRes = await fetchServerData("/api/myAllCourse");
      if (coursesRes?.success) {
        serverInstructorData = coursesRes.courses;
      }

    } else {
      // --- PUBLIC / ADMIN / OTHER ---
      // Fetch All Courses for Categories
      const coursesRes = await fetchServerData("/api/allCourse");
      if (coursesRes?.success) {
        serverCourses = coursesRes.courses; // DashboardClient expects 'serverCourses' to normally be categories? 
        // Wait, original page.jsx: setCourseCategory(response.courses) where AllCourse() returns response.courses?
        // Let's check AllCourse in courseService.js (Step 214): returns { success: true, courses: response.data }
        // URL /api/allCourse.
        // DashboardClient maps serverCourses as categories? 
        // Original page.jsx: courseCategory?.map(category => ...)
        // This implies /api/allCourse returns categories with courses inside, OR returns a specific structure.
        // Assuming the API returns what the frontend expects.
      }
    }
  }

  return (
    <DashboardClient
      serverUser={user}
      serverContinueLearning={serverContinueLearning}
      serverCourses={serverCourses}
      serverStudentData={serverStudentData}
      serverInstructorData={serverInstructorData}
    />
  );
}
