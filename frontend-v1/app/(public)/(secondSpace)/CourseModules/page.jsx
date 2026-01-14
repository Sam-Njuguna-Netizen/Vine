'use client'
import StudentCourseModule from "./_components/student"
import InstructorCourseModules from "./_components/instructor"
import { useSelector } from "react-redux"
const Page = ()=>{
  const userRole = useSelector((state) => state.auth?.user?.roleId)
  return (
    <div>
      {userRole === 3 ? <InstructorCourseModules /> : <StudentCourseModule />}
      {JSON.stringify(userRole)}
    </div>
  )
}
export default Page