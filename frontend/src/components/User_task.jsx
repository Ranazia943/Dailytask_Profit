import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from "../authcontext/AuthContext";
import { useNavigate } from 'react-router-dom';

const Usertask = () => {
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState({});
  const [verificationTask, setVerificationTask] = useState(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Load completed tasks from localStorage on initial render
  useEffect(() => {
    const storedCompletedTasks = localStorage.getItem('completedTasks');
    if (storedCompletedTasks) {
      setCompletedTasks(JSON.parse(storedCompletedTasks));
    }
  }, []);

  // Fetch user plans with tasks once authenticated
  useEffect(() => {
    if (authUser) {
      const fetchUserPlansAndTasks = async () => {
        try {
          const token = authUser.token || localStorage.getItem("token");
          const baseURL = import.meta.env.VITE_API_BASE_URL;

          if (!token) {
            console.error("No token found, authorization denied.");
            setError("Authorization error: No token found.");
            setLoading(false);
            return;
          }

          const response = await axios.post(
            `${baseURL}/api/userplan/userplanswithtasks/${authUser._id}`,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            setUserPlans(response.data.userPlans || []);
            setError(null);
          } else {
            console.error(response.data.message);
            setError(response.data.message);
          }
        } catch (error) {
          console.error("Error fetching user plans:", error);
          setError("Something went wrong while fetching tasks.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserPlansAndTasks();
    }
  }, [authUser]);

  const handleTaskClick = async (taskId, taskUrl) => {
    try {
      const token = authUser.token || localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_BASE_URL;

      // First check task status with backend
      const response = await axios.get(
        `${baseURL}/api/usertask/task/${taskId}/user/${authUser._id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data.isCompleted) {
        alert(`Task already completed. Available again at ${new Date(response.data.nextAvailable).toLocaleString()}`);
        return;
      }

      // If not completed, proceed with task
      setVerificationTask({
        id: taskId,
        url: taskUrl,
        price: response.data.taskPrice,
        correctAnswer: response.data.mathQuestion.correctAnswer,
        mathQuestion: response.data.mathQuestion.question
      });
      
      window.open(taskUrl, '_blank');
    } catch (error) {
      console.error('Error checking task status:', error);
      setVerificationError('Failed to verify task status. Please try again.');
    }
  };

  const verifyMathAnswer = async () => {
    if (!verificationTask || parseInt(mathAnswer) !== verificationTask.correctAnswer) {
      setVerificationError('Incorrect answer. Please try again.');
      return;
    }
  
    try {
      const token = authUser.token || localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_BASE_URL;
  
      const response = await axios.post(
        `${baseURL}/api/usertask/task/${verificationTask.id}/user/${authUser._id}/submit`,
        {
          answer: mathAnswer,
          correctAnswer: verificationTask.correctAnswer,
          taskPrice: verificationTask.price
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      // Update local state
      const newCompletedTasks = {
        ...completedTasks,
        [verificationTask.id]: Date.now()
      };
      setCompletedTasks(newCompletedTasks);
      localStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
  
      // Update UI
      setUserPlans(prevPlans => 
        prevPlans.map(plan => ({
          ...plan,
          tasks: plan.tasks.map(task => 
            task._id === verificationTask.id ? { 
              ...task, 
              completed: true,
              lastCompleted: new Date().toISOString()
            } : task
          )
        }))
      );
  
      setVerificationTask(null);
      setVerificationError('');
      setMathAnswer('');
      
      alert(`Task completed! Rs. ${verificationTask.price} added to your balance. Total earnings: Rs. ${response.data.newBalance}`);
  
    } catch (error) {
      if (error.response?.data?.message === 'Task already completed recently') {
        alert(`Task already completed. Available again at ${new Date(error.response.data.nextAvailable).toLocaleString()}`);
      } else {
        setVerificationError('Failed to complete task. Please try again.');
      }
    }
  };

  const isTaskOnCooldown = (taskId) => {
    return completedTasks[taskId] && Date.now() - completedTasks[taskId] < 24 * 60 * 60 * 1000;
  };

  const getRemainingCooldownTime = (taskId) => {
    if (!completedTasks[taskId]) return null;

    const timePassed = Date.now() - completedTasks[taskId];
    const remainingTime = 24 * 60 * 60 * 1000 - timePassed;

    if (remainingTime <= 0) return null;

    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  };

  const hasActivePlansWithTasks = userPlans?.some(plan =>
    plan.planId &&
    plan.state === 'active' &&
    plan.tasks?.length > 0
  );

  if (loading) return <div className="text-center p-8">Loading...</div>;

  if (error && !hasActivePlansWithTasks) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-center my-4">Your Active Plans and Tasks</h2>
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold text-red-500 mb-4">You don't have any active plans yet.</p>
          <p className="text-lg mb-6">Please purchase a plan to access tasks and start earning.</p>
          <button
            onClick={() => navigate("/addamount")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Purchase Plan Now
          </button>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      {verificationTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Verify Task Completion</h3>
            <p className="mb-4">Please solve this simple math problem to confirm you completed the task:</p>
            <p className="text-2xl font-bold text-center my-4">{verificationTask.mathQuestion}</p>
            <input
              type="number"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Your answer"
            />
            {verificationError && (
              <p className="text-red-500 mb-4">{verificationError}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setVerificationTask(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={verifyMathAnswer}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-center my-4">Your Active Plans and Tasks</h2>
      {userPlans
        ?.filter(plan => plan.planId && plan.state === 'active' && plan.tasks?.length > 0)
        .map((plan) => (
          <div key={plan._id} className="p-4 border rounded-lg mb-4 bg-white">
            <div className="my-4">
              <h2 className="text-center font-bold text-xl my-2">{plan.planId.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-semibold">Price:</span> Rs. {plan.planId.price}</p>
                <p><span className="font-semibold">Duration:</span> {plan.planId.duration} Days</p>
                <p><span className="font-semibold">Daily Profit:</span> Rs. {plan.planId.dailyProfit}</p>
                <p><span className="font-semibold">Total Profit:</span> Rs. {plan.planId.totalProfit}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {plan.tasks.map((task) => {
                const isCooldown = isTaskOnCooldown(task._id);
                const remainingTime = getRemainingCooldownTime(task._id);

                return (
                  <div key={task._id} className="p-4 border rounded-lg">
                    <div>
                      <p><span className="font-bold">Task:</span> {task.type}</p>
                      <p><span className="font-bold">Earnings:</span> Rs. {task.price}</p>
                      {isCooldown && remainingTime && (
                        <p className="text-sm text-gray-500">
                          Available in: {remainingTime}
                        </p>
                      )}
                    </div>
                    {task.status === "pending" && task.url && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => !isCooldown && handleTaskClick(task._id, task.url)}
                          className={`px-4 py-2 rounded ${isCooldown ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          disabled={isCooldown}
                        >
                          {isCooldown ? 'Completed' : 'Start Task'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Usertask;