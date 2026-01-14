"use client";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  PlusOutlined,
  CheckCircleFilled,
  WarningFilled,
} from "@ant-design/icons";
import { Button, Card, Spin, Tag } from "antd";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import moment from "moment";
import Countdown from "react-countdown";
import { createStripeAccount } from "@/app/utils/stripe";
import CheckoutModal from "@/app/(public)/components/CheckoutModalSubscription";
import { setAuthUser } from "@/app/store";

const CountdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return (
      <div className="text-center text-red-500 text-2xl font-bold">
        Your subscription has expired!
      </div>
    );
  }

  const timeUnits = {
    Days: days,
    Hours: hours,
    Mins: minutes,
    Secs: seconds,
  };

  return (
    <div className="flex justify-center gap-4">
      {Object.entries(timeUnits).map(([unit, value]) => (
        <div
          key={unit}
          className="text-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner w-24"
        >
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
        </div>
      ))}
    </div>
  );
};

export default function UserSubscription() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [check, setCheck] = useState(false);

  useEffect(() => {
    async function fetchStripeInfo() {
      try {
        const stripe = await axios.post("/api/stripe/check", {
          withCredentials: true,
        });
        console.log("stripe", stripe.data);
        setCheck(true);
      } catch (error) {
        setCheck(false);
        console.log("console.error()", error?.response.data);
      }
    }
    fetchStripeInfo();
  }, []);

  useEffect(() => {
    const getAllPlan = async () => {
      try {
        setLoading(true);
        // If student (role 3), fetch institute plans. If institution/instructor (role 2), fetch standard plans.
        const endpoint = authUser?.roleId === 3 ? "/api/institutePlan" : "/api/institutePlan";
        const res = await axios.get(endpoint);
        if (res.data) {
          const role = authUser?.roleId;
          const filteredPlans = res.data.filter((plan) => {
            if (role === 3) return !plan.type || plan.type === "student"; // Default to student
            if (role === 2) return plan.type === "instructor";
            return true; // Show all for other roles
          });
          setPlans(filteredPlans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        N("Error", "Could not load subscription plans.", "error");
      } finally {
        setLoading(false);
      }
    };
    getAllPlan();
  }, [authUser]);

  const handleUpdatePlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const callCreateStripeAccount = async () => {
    N(
      "Information",
      "Redirecting to Stripe to connect your account...",
      "info"
    );
    try {
      // const res =
      const res = await createStripeAccount("/api/stripe/connect");
      // if (!res.success) {
      //     N('Error', res.message, 'error');
      // }

      if (res.connectUrl) {
        window.location.href = res.connectUrl;
      } else {
        N("Error", "Stripe did not return a redirect URL.", "error");
      }
    } catch (error) {
      console.log(error.response);
      N("Error", "An unexpected error occurred.", "error");
    }
  };

  const refreshUserProfile = async () => {
    try {
      const response = await axios.get("/api/myProfile");
      dispatch(setAuthUser(response.data.user));
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  return (
    <div className="px-0 sm:px-8 sm:py-8 py-4  min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold  dark:text-white sm:text-left text-center">
            Subscription & Billing
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 sm:text-left text-center">
            Manage your subscription plan and billing details.
          </p>
        </header>

        {/* Subscription Status Section */}
        <Card className="mb-10 shadow-lg border border-gray-200 dark:border-[#141414]  dark:bg-gray-800 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold  dark:text-white mb-2">
                Subscription Status
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your current plan is{" "}
                <Tag color="blue">
                  {authUser?.expiryDate ? "Active" : "Free"}
                </Tag>
              </p>
              {authUser?.expiryDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your subscription will expire on:{" "}
                  {moment(authUser?.expiryDate).format("MMMM Do, YYYY")}
                </p>
              )}
            </div>
            {authUser?.roleId === 2 && (
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                {check ? (
                  <p className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircleFilled /> Payment Method Connected
                  </p>
                ) : (
                  <div className="text-center">
                    <p className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-3">
                      <WarningFilled /> Please connect a payment method.
                    </p>
                    <Button onClick={callCreateStripeAccount} type="primary">
                      Connect to Stripe
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-[#141414]">
            <Countdown
              date={authUser?.expiryDate}
              renderer={CountdownRenderer}
            />
          </div>
        </Card>

        {/* Choose Your Plan Section */}
        <div>
          <h2 className="text-3xl font-bold text-center  dark:text-white mb-2">
            Choose Your Plan
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            Select the plan that best fits your needs.
          </p>

          {loading ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`shadow-lg rounded-xl flex flex-col text-center transition-transform hover:scale-105 ${plan.name === "Pro"
                    ? "border-2 border-blue-500"
                    : "dark:border-[#141414]"
                    }`}
                  bodyStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem",
                  }}
                >
                  {plan.name === "Pro" && (
                    <Tag color="blue" className="absolute top-4 right-4">
                      Recommended
                    </Tag>
                  )}

                  <div className="flex-grow">
                    <p className="text-2xl font-semibold mb-2  dark:text-white">
                      {plan.name}
                    </p>
                    <p className="text-4xl font-bold mb-2  dark:text-white">
                      ${plan.salePrice}
                      <span className="text-lg text-gray-500 dark:text-gray-400">
                        {" "}
                        / {plan.per}
                      </span>
                    </p>
                    <p className="line-through text-gray-400 dark:text-gray-500 mb-6">
                      ${plan.regularPrice}
                    </p>

                    {/* Feature List */}
                    <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300 mb-8">
                      <li className="flex items-center gap-3">
                        <CheckCircleFilled className="text-green-500" /> Up to{" "}
                        {plan.studentLimit} students
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleFilled className="text-green-500" />{" "}
                        {plan.courseLimit} courses
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleFilled className="text-green-500" /> Basic
                        Analytics
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircleFilled className="text-green-500" /> Email
                        Support
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleUpdatePlan(plan)}
                    type="primary"
                    size="large"
                    block
                    disabled={authUser?.subscription?.planId === plan.id}
                  >
                    {authUser?.subscription?.planId === plan.id
                      ? "Current Plan"
                      : "Choose Plan"}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <CheckoutModal
        open={showCheckoutModal}
        onCancel={() => setShowCheckoutModal(false)}
        plan={selectedPlan}
        onSuccess={refreshUserProfile}
      />
    </div>
  );
}
