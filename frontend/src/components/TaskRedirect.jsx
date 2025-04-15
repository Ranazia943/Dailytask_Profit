import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from "../authcontext/AuthContext";

const TaskRedirect = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthContext();

  useEffect(() => {
    const completeAndRedirect = async () => {
      const taskData = JSON.parse(localStorage.getItem('pendingTask'));
      if (!taskData || taskData.taskId !== taskId) {
        navigate('/usertask');
        return;
      }

      const { taskUrl } = taskData;
      const token = authUser?.token || localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_BASE_URL;

      try {
        await axios.post(
          `${baseURL}/api/tasks/task/${taskId}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || {};
        completedTasks[taskId] = Date.now();
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
      } catch (error) {
        console.error("Error completing task:", error);
      }

      localStorage.removeItem('pendingTask');
      window.location.href = taskUrl;
    };

    completeAndRedirect();
  }, [taskId, authUser, navigate]);

  return (
    <div className="text-center p-10 text-xl font-medium">
      Redirecting to your task...
    </div>
  );
};

export default TaskRedirect;
