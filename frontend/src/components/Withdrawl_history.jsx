import { useEffect, useState } from "react";
import { useAuthContext } from "../authcontext/AuthContext";
import axios from "axios";

const Withdrawl_history = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const fetchWithdrawalHistory = async () => {
        try {
          const token = authUser.token || localStorage.getItem("token");

          if (!token) {
            console.error("No token found, authorization denied.");
            return;
          }
          const baseURL = import.meta.env.VITE_API_BASE_URL;
          const response = await axios.get(`${baseURL}/api/withdrawl/${authUser._id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data) {
            console.log("Withdrawal History Data:", response.data); // Log data for debugging
            setWithdrawalHistory(response.data.data);
            setLoading(false);
          } else {
            setLoading(false);
            console.error("Error: No data found.");
          }
        } catch (error) {
          console.error("Error fetching withdrawal history:", error);
          setLoading(false);
        }
      };

      fetchWithdrawalHistory();
    }
  }, [authUser]);

  const handleViewProof = (image) => {
    setSelectedImage(image);
  };

  const closeImageView = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-4">
      <div className="wrapper">
        <h2 className="text-center my-8 text-3xl font-[600] font-sans">Withdrawal History</h2>
      </div>
      <div className="cards-wrapper mb-24 grid max-[850px]:grid-cols-1 max-[850px]:gap-4 max-[850px]:mx-2 grid-cols-2 md:gap-4 lg:gap-8 md:mx-8 lg:mx-16">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : withdrawalHistory.length > 0 ? (
          withdrawalHistory.map((history, index) => (
            <div
              key={index}
              data-aos="zoom-in"
              data-aos-duration="3000"
              className="card border relative p-2 max-[850px]:w-[450px] max-[520px]:w-full max-[850px]:mx-auto rounded-xl flex justify-start gap-2 bg-green-50"
            >
              <h2>
                <i className="fa-solid fa-check border p-1 rounded-full bg-green-400 text-white mr-2"></i>
              </h2>
              <div className="wrapp">
                <div>
                  <h2 className="text-xl font-[700]">{history.status}</h2>
                  <p className="text-xl font-[350] w-44 text-gray-700 mt-2">{history.paymentGateway}</p>
                  
                  <p className="text-base font-[350]">Account Name: {history.gatewayAccountName}</p>
                  <p className="text-base font-[350]"> Account Number: {history.gatewayAccountNumber}</p>
                 
                  <h3 className="my-4 text-lg font-[600] text-yellow-400">{history.processedDate}</h3>
                  {history.adminScreenshot && (
                    <div>
                     
 <div> 
    <br></br>
                      <button className=" bg-green-400 shadow-md focus:shadow-none text-white max-[850px]:text-sm px-2 min-[850px]:px-3 py-1 min-[850px]:py-2 rounded-md mx-1 min-[850px]:mx-2"   onClick={() => handleViewProof(history.adminScreenshot)}>View Proof</button>
                    </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 right-2">
                <p className="text-end m-2 text-xl font-[500] text-red-500">
                  Rs. {history.amount}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No withdrawal history found.</p>
        )}
      </div>

      {/* Full-screen Image View */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Proof"
              className=" max-w-full object-contain"
            />
            <button
              className="absolute top-2 right-2 bg-white p-2 rounded-full text-black"
              onClick={closeImageView}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawl_history;
