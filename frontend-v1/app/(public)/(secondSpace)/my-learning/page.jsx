import MyLearningClient from "./MyLearningClient";
import { fetchServerData } from "@/app/utils/server-utils";

export default async function MyLearningPage() {
    // 1. Fetch Auth User to ensure session exists
    const authResponse = await fetchServerData("/api/authUser");
    const user = authResponse?.user;

    let initialCourses = [];

    // 2. Fetch User's Course Progress if authenticated
    if (user) {
        const progressRes = await fetchServerData("/api/student/analytics/course-progress");
        if (progressRes) {
            initialCourses = progressRes;
        }
    }

    return (
        <MyLearningClient initialCourses={initialCourses} />
    );
}
