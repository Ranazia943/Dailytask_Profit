import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { useAuthContext } from "../authcontext/AuthContext"; // to get the auth user
import { toast, Toaster } from "react-hot-toast"; // Import react-hot-toast

export const Recharge_form = () => {
  const { authUser, authToken } = useAuthContext(); // Use AuthContext to get user details
  const [plans, setPlans] = useState([]);
  const [paymentGateways, setPaymentGateways] = useState(["EasyPaisa", "Sadapay", "Bank Transfer"]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [taxId, setTaxId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/plan/all`);

        if (response.status === 200) {
          const plansData = response.data;
          if (Array.isArray(plansData)) {
            setPlans(plansData); // Plans is an array, set it
          } else {
            console.warn("Unexpected response format:", plansData);
            setPlans([]); // If the response is not in expected format, fallback to empty array
          }
        } else {
          throw new Error("Failed to fetch plans");
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]); // In case of error, fallback to empty array
        setError("Failed to load plans. Please try again later.");
      } finally {
        setLoading(false); // Stop loading when fetch is complete (either success or failure)
      }
    };

    fetchPlans();
  }, []); // Empty dependency array ensures this runs only once on component mount

  const handlePlanChange = (e) => {
    const planName = e.target.value;
    const selectedPlan = plans.find((plan) => plan.name === planName);
    setSelectedPlan(planName);
    setPlanDetails(selectedPlan); // Store the plan details (for display)
  };

  const handleScreenshotChange = (e) => {
    setPaymentScreenshot(e.target.files[0]);
  };

  // Cloudinary upload function for payment screenshot
  const uploadScreenshot = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dqqejge0d/image/upload", {
        method: "POST",
        body: formData,
      });
      const urlData = await response.json();
      return urlData.secure_url; // Return the URL of the uploaded image
    } catch (error) {
      console.error("Error uploading payment screenshot:", error);
      return "";
    }
  };

  // Form Validation
  const validateForm = () => {
    let errors = {};
    if (!selectedPlan) errors.selectedPlan = "Plan is required";
    if (!paymentMethod) errors.paymentMethod = "Payment method is required";
    if (!taxId) errors.taxId = "Tax ID is required";
    if (!paymentScreenshot) errors.paymentScreenshot = "Payment screenshot is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const errors = validateForm();
    setFormErrors(errors);
  
    if (Object.keys(errors).length > 0) return;
  
    setIsSubmitted(true);
  
    const screenshotUrl = await uploadScreenshot(paymentScreenshot);
    if (!screenshotUrl) {
      toast.error("Error uploading screenshot. Please try again.");
      setIsSubmitted(false);
      return;
    }
  
    const formData = {
      planId: planDetails._id,
      paymentGateway: paymentMethod,
      paymentScreenshot: screenshotUrl,
      taxId: taxId,
    };
  
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${baseURL}/api/userplan/purchase/${authUser._id}`, formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      console.log("Response from API:", response.data);
  
      if (response.data.message?.toLowerCase().includes("plan purchased")) {
        console.log("Toast should appear now!");
        toast.success("Your plan purchase is under review. You will be notified once verified.", {
          duration: 3000,
          style: { background: "green", color: "white" },
        });
  
        setTimeout(() => {
          setSelectedPlan("");
          setPaymentMethod("");
          setTaxId("");
          setPaymentScreenshot(null);
          setPlanDetails(null);
          setFormErrors({});
          setIsSubmitted(false);
        }, 1000);
      } else {
        toast.error("Unexpected response. Please try again.");
        console.warn("Unexpected API response:", response.data);
      }
    } catch (error) {
      console.error("Error in purchase plan:", error);
      toast.error("There was an issue processing your payment. Please Try different Tax id for new plan.");
      setIsSubmitted(false);
    }
  };
  
  // Render payment method details based on selection
  const renderPaymentMethodDetails = () => {
    switch (paymentMethod) {
      case "EasyPaisa":
        return (
          <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg">
            <h4>EasyPaisa Details:</h4>
            <p>Bank: (EasyPaisa)</p>
            <p>Name: Abdullah Zulfiqar</p>
            <p>Account No: 03472627044</p>
          </div>
        );
      case "Sadapay":
        return (
          <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg">
            <h4>Sadapay Details:</h4>
            <p>Bank: (Sadapay)</p>
            <p>Name: Neelam Naz</p>
            <p>Account No: 03288187708</p>
          </div>
        );
      case "Bank Transfer":
        return (
          <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg">
            <h4>Bank Transfer Details:</h4>
            <p>Bank: UBL (United Bank Limited)</p>
            <p>Name: Abdullah Zulfiqar</p>
            <p>Account Number: 0962308854451</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[url('https://images.hdqwalls.com/download/dark-blur-abstract-4k-v3-1920x1080.jpg')] bg-cover bg-no-repeat min-h-screen">
      <div className="wrapper flex flex-col items-center min-h-[90vh] py-10">
       
        {/* Payment Gateway Details */}
        {renderPaymentMethodDetails()}

        {/* Recharge Form */}
        <form className="max-w-md w-full backdrop-blur-lg p-6 rounded-lg border" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Recharge Now</h2>

          {/* Plan Dropdown */}
          <div className="mb-6">
            <label htmlFor="plan" className="block text-white mb-2">Select Plan <span className="text-red-500">*</span></label>
            <select
              id="plan"
              className={`w-full h-10 px-3 border rounded-md ${formErrors.selectedPlan ? "border-red-500" : ""}`}
              onChange={handlePlanChange}
              value={selectedPlan}
            >
              <option value="">-- Select Plan --</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan.name}>
                  {plan.name} - Rs {plan.price}
                </option>
              ))}
            </select>
            {formErrors.selectedPlan && <p className="text-red-500 text-xs">{formErrors.selectedPlan}</p>}
          </div>

          {/* Payment Method Dropdown */}
          <div className="mb-6">
            <label htmlFor="paymentMethod" className="block text-white mb-2">Select Payment Method <span className="text-red-500">*</span></label>
            <select
              id="paymentMethod"
              className={`w-full h-10 px-3 border rounded-md ${formErrors.paymentMethod ? "border-red-500" : ""}`}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">-- Select Payment Method --</option>
              {paymentGateways.map((gateway, index) => (
                <option key={index} value={gateway}>
                  {gateway}
                </option>
              ))}
            </select>
            {formErrors.paymentMethod && <p className="text-red-500 text-xs">{formErrors.paymentMethod}</p>}
          </div>

          {/* Show Selected Plan Price and Payment Method */}
          {planDetails && (
            <div className="bg-gray-800 text-white p-4 mb-4 rounded-lg">
              <h3>Selected Plan:</h3>
              <p>Plan: {planDetails.name}</p>
              <p>Price: Rs {planDetails.price}</p>
              <p>Payment Method: {paymentMethod}</p>
            </div>
          )}

          {/* Tax ID and Payment Screenshot */}
          <span className="text-red-500">*</span>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter Tax ID"
              className={`w-full p-2 border rounded-md mb-4 ${formErrors.taxId ? "border-red-500" : ""}`}
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
            {formErrors.taxId && <p className="text-red-500 text-xs">{formErrors.taxId}</p>}
            <span className="text-red-500">*</span>
            <input
              type="file"
              className={`mb-4 w-full ${formErrors.paymentScreenshot ? "border-red-500" : ""}`}
              onChange={handleScreenshotChange}
            />
            {formErrors.paymentScreenshot && <p className="text-red-500 text-xs">{formErrors.paymentScreenshot}</p>}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              variant="contained"
              type="submit"
              sx={{ backgroundColor: "#4ade80" }}
            >
              Submit
            </Button>
          </div>
        </form>

        {/* Success Section */}
        {isSubmitted && (
          <div
            data-aos="zoom-in"
            data-aos-duration="1000"
            className="mt-10 w-full max-w-md bg-green-50 p-6 rounded-lg border"
          >
         
          </div>
        )}
      </div>

      {/* Toast container for success/error messages */}
      <Toaster position="top-center" />
    </div>
  );
};
