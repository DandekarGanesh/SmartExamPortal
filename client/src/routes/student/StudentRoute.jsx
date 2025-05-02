import { Route, Routes } from "react-router-dom";
import StudentLayout from "../../layouts/StudentLayout";
import SignUp from "../../pages/student/SignUp";
import Login from "../../pages/student/Login";
import ForgotPassword from "../../pages/student/ForgotPassword.jsx";
import ResetPassword from '../../pages/student/ResetPassword';
import LandingPage from './../../home/Landingpage';
import Aboutus from './../../home/Aboutus';
import contactus from './../../home/contactus';
import StartTest from '../../student/Exam/StartTest';
import StudentProtection from './../../layouts/StudentProtection';
import StudentDashboard from "../../student/dashboardComponents/StudentDashboard";
import AllExams from "../../student/dashboardComponents/AllExams";
import StudentProfile from "../../student/dashboardComponents/StudentProfile";
import ExamHistory from "../../student/dashboardComponents/ExamHistory";
import Settings from "../../student/dashboardComponents/Settings";
import McqExam from "../../student/Exam/McqExam";
import CodingExam from "../../student/Exam/CodingExam";


const StudentRouter = () => {
    return (
        <Routes > 
            <Route path="/" element={<StudentLayout />}>


                <Route path="/student/SignUp" element={<SignUp />} />
                <Route path="/student/Login" element={<Login />} />
                <Route path="/forgotPassword" element={<ForgotPassword />} />
                <Route path="/ResetPassword" element={<ResetPassword />} />

                {/* Secured Routes Goes Here  */}

                <Route path='/' element={<LandingPage />}/>
                <Route path='/aboutUs' element={<Aboutus />}/>
                <Route path='/contactUs' element={<contactus />}/>



                <Route path='/student/dashboard' element={<StudentDashboard />}/>
                <Route path='/student/myExams' element={<AllExams />}/>
                <Route path='/student/exam-history' element={<ExamHistory />}/>
                <Route path='/student/profile' element={<StudentProfile />}/>
                <Route path='/student/Settings' element={<Settings />}/>


                
            </Route>


            
            <Route path="/" element={<StudentProtection />}>
                {/* Student Test Routes Exams Here */}
                <Route path='/exam/start/:id' element={<StartTest />}/>
                <Route path='/exam/view/mcq/:id' element={<McqExam />}/>
                <Route path='/exam/view/coding/:id' element={<CodingExam />}/>
            </Route>
            
        </Routes>
    )
}
export default StudentRouter;