import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Components
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Recharge_history from "./components/Recharge_history";
import { Recharge_form } from "./components/Recharge_form";
import Withdraw from "./components/Withdraw";
import Teams from "./components/Team";
import Invite from "./components/Invite";
import Support from "./components/Support";
import About from "./components/About";
import My_Plains from "./components/My_Plains";
import Register from "./components/Register";
import Login from "./components/Login";
import Account from "./components/Account";
import Approved from "./components/Approved";
import Notification from "./components/Notification";
import Withdrawl_history from "./components/Withdrawl_history";
// Admin Components
import Admin_DashBoard from "./components/admin/Dashboard";
import All_users from "./components/admin/All_users";
import Update_user from "./components/admin/Update_user";
import Add_user from "./components/admin/Add_User";
import All_Plains from "./components/admin/All_Plans";
import Add_Plan from "./components/admin/Add_Plan";
import Update_Plan from "./components/admin/Update_plan";
import About_detail from './components/admin/About_detail';
import Update_About from './components/admin/Update_About';
import Support_section from './components/admin/Support_section';
import Plan_Requests from './components/admin/Plan_Requests';
import Withdraw_Requeat from './components/admin/Withdraw_Requeat';
import Add_About_text from './components/admin/Add_About_text';
// Auth Context
import { useAuthContext } from "./authcontext/AuthContext";
import TotalPlan from "./components/TotalPlan";
import WithdrawRequest from "./components/WithdrawRequest";
import User_Detail from './components/admin/User_Detail';
import Withdrawl_action from "./components/admin/Withdrawl_action";
import SendEmailForm from "./components/admin/SendEmailForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AssignTask from "./components/admin/AssignTask"; // Adjust the path as needed
import Usertask from './components/User_task'
import { Toaster } from "react-hot-toast";  // Import Toaster component
import All_Task from "./components/admin/All_Task"
import TaskCount from './components/TaskCount'
import TaskRedirect from "./components/TaskRedirect";
const App = () => {
  
  const location = useLocation();
  const { authUser } = useAuthContext(); // Access auth state
  const [unreadCount, setUnreadCount] = useState(0);  // State to manage unread notifications

  useEffect(() => {
    AOS.init({ duration: 1500 });
  }, []);

  const hideNavbarRoutes = [
    "/admin/dashboard",
    "/admin/dashboard/allusers",
    "/admin/dashboard/updateuser",
    "/admin/dashboard/adduser",
    "/admin/dashboard/allplans",
    "/admin/dashboard/addplan",
    "/admin/dashboard/updateplan",
    "/admin/dashboard/aboutdetail",
    "/admin/dashboard/support",
    "/admin/dashboard/support",
    "/admin/dashboard/requests",
    "/admin/dashboard/withdraw",
    "/admin/dashboard/add_aboutdetail",
    "/admin/dashboard/userdetail/:id",
    "/admin/dashboard/withdrawl_aciton/:id",
    "/admin/dashboard/sendmail",
    "/admin/dashboard/alltask/:planId"
  ];

  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div>
      {/* Conditionally render Navbar */}
      {shouldShowNavbar && <Navbar unreadCount={unreadCount} />}
      <Toaster position="top-center" reverseOrder={false} />  {/* Optional positioning and order */}

      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot_password" element={<ForgotPassword />} />
        <Route path="/reset_password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/recharge" element={<ProtectedRoute><Recharge_history /></ProtectedRoute>} />
        <Route path="/withdrawl_history" element={<ProtectedRoute><Withdrawl_history /></ProtectedRoute>} />
        <Route path="/addamount" element={<ProtectedRoute><Recharge_form /></ProtectedRoute>} />
        <Route path="/withdraw/request" element={<ProtectedRoute><WithdrawRequest /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><TotalPlan /></ProtectedRoute>} />
        <Route path="/approve" element={<ProtectedRoute><Approved /></ProtectedRoute>} />
        <Route path="/usertask" element={<ProtectedRoute><Usertask /></ProtectedRoute>} />
        <Route path="/notification" element={<ProtectedRoute><Notification setUnreadCount={setUnreadCount} /></ProtectedRoute>} />
        <Route path="/taskcount/:taskId" element={<TaskCount />} /> {/* Dynamic task page */}
        <Route path="/taskredirect/:taskId" element={<TaskRedirect />} />

        {/* Admin Routes */}
         {/* Admin Routes */}
         <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Admin_DashBoard />
              </ProtectedRoute>
            }
          />
  <Route
  path="/admin/dashboard/alltask/:planId"
  element={
    <ProtectedRoute isAdminRoute={true}>
      <All_Task />
    </ProtectedRoute>
  }
/>

          <Route
  path="/admin/dashboard/assignTask/:planId"
  element={
    <ProtectedRoute isAdminRoute={true}>
      <AssignTask />
    </ProtectedRoute>
  }
/>
          <Route
            path="/admin/dashboard/allusers"
            element={
              <ProtectedRoute isAdminRoute={true}>
               <All_users/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/aboutdetail"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <About_detail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/sendmail"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <SendEmailForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/add_aboutdetail"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Add_About_text />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/userdetail/:id"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <User_Detail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/support"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Update_About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/withdraw"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Withdraw_Requeat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/withdrawl_aciton/:id"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Withdrawl_action />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/requests"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Plan_Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/support"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Support_section />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/updateuser"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Update_user />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/adduser"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Add_user />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/allplans"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <All_Plains />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/addplan"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Add_Plan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/updateplan"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Update_Plan />
              </ProtectedRoute>
            }
          />
        </Routes>
    </div>
  );
};

const ProtectedRoute = ({ children, isAdminRoute = false }) => {
  const { authUser } = useAuthContext();

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  if (isAdminRoute && authUser.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default App;
