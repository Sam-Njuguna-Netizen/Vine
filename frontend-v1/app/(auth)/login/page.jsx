"use client";
import { useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAuthUser, login } from "../../utils/auth";
import { setAuthUser } from "../../store";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import ImageUpload from "@/app/Components/ImageUpload";
import { checkObjectFields, deleteFile } from "@/app/utils/common";
import ThemeSwitcher from "@/app/Components/ThemeSwitcher";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#141414] text-slate-700 dark:text-slate-200">
          Loading page...
        </div>
      }
    >
      <LoginComponent
        router={router}
        dispatch={dispatch}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
      />
    </Suspense>
  );
}

function LoginComponent({
  router,
  dispatch,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  setLoading,
  error,
  setError,
}) {
  const searchParams = useSearchParams();
  const user = useSelector((state) => state.auth.user);

  const open = searchParams.get("institution") === "true";
  const qtoken = searchParams.get("token");
  const redirectParam = searchParams.get("redirect") ? decodeURIComponent(searchParams.get("redirect")) : null;

  useEffect(() => {
    if (user) {
      let redirectPath = "/courses";
      const isSubscriptionExpired = (expiryDate) =>
        !expiryDate || moment(expiryDate).isBefore(moment(), "day");
      if (redirectParam) {
        redirectPath = redirectParam;
      } else if (user?.roleId === 1) {
        redirectPath = isSubscriptionExpired(user.institution?.expiryDate)
          ? "/admin/subscription"
          : "/admin";
      } else if (user?.roleId === 2 || user?.roleId === 3) {
        redirectPath = isSubscriptionExpired(user.expiryDate)
          ? "/dashboard"
          : "/dashboard";
      } else if (user?.roleId === 4) {
        redirectPath = "/superadmin";
      }
      router.push(redirectPath);
    }
  }, [user, router, redirectParam]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (qtoken) {
        N("Success", "Logging In...", "success");
        localStorage.setItem("authToken", qtoken);
        const res = await getAuthUser();
        if (isMounted && res && res.success && res.user) {
          dispatch(setAuthUser(res.user));
          const user = res.user;
          let redirectPath = "/";
          const isSubscriptionExpired = (expiryDate) =>
            !expiryDate || moment(expiryDate).isBefore(moment(), "day");
          if (redirectParam) {
            redirectPath = redirectParam;
          } else if (user?.roleId === 1) {
            redirectPath = isSubscriptionExpired(user.institution?.expiryDate)
              ? "/admin/subscription"
              : "/admin";
          } else if (user?.roleId === 2 || user?.roleId === 3) {
            redirectPath = isSubscriptionExpired(user.expiryDate)
              ? "/setting"
              : "/";
          } else if (user?.roleId === 4) {
            redirectPath = "/superadmin";
          }
          router.push(redirectPath);
        } else if (isMounted) {
          N("Error", "Token-based login failed.", "error");
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [qtoken, dispatch, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await login(email, password);
    setLoading(false);

    if (response && response.success) {
      dispatch(setAuthUser(response.user));
      N("Success", "Login Successful", "success");
      const user = response.user;
      let redirectPath = "/courses";
      const isSubscriptionExpired = (expiryDate) =>
        !expiryDate || moment(expiryDate).isBefore(moment(), "day");
      if (redirectParam) {
        redirectPath = redirectParam;
      } else if (user?.roleId === 1) {
        redirectPath = isSubscriptionExpired(user.institution?.expiryDate)
          ? "/admin/subscription"
          : "/admin";
      } else if (user?.roleId === 2 || user?.roleId === 3) {
        redirectPath = isSubscriptionExpired(user.expiryDate)
          ? "/dashboard"
          : "/dashboard";
      } else if (user?.roleId === 4) {
        redirectPath = "/superadmin";
      }
      router.push(redirectPath);
    } else {
      const errorMessage =
        response?.error?.response?.data?.message ||
        response?.message ||
        "Login failed. Please check credentials.";
      setError(errorMessage);
      N("Error", errorMessage, "error");
    }
  };

  // Modal State
  const [institutionName, setInstitutionName] = useState("");
  const [shortForm, setShortForm] = useState("");
  const [adminEmailModal, setAdminEmailModal] = useState("");
  const [adminPasswordModal, setAdminPasswordModal] = useState("");
  const [confirmAdminPasswordModal, setConfirmAdminPasswordModal] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [logo, setLogo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);

  // Institution Logo Logic
  const [instituteDetails, setInstituteDetails] = useState(null);

  useEffect(() => {
    const checkSubdomain = async () => {
      const hostname = window.location.hostname;
      // Handle subdomains (e.g., institute.domain.com)
      // Exclude 'www' or main domain scenarios if needed, but simple split is usually enough for now
      const parts = hostname.split('.');
      let subdomain = "";

      // Basic subdomain detection: at least 3 parts (sub.domain.com) or just check explicitly
      // Adjust logic based on your actual domain structure (e.g. localhost testing might need manual override)
      if (parts.length > 2) {
        subdomain = parts[0];
      }
      // Only for testing locally if easy switch is needed:
      // if (hostname.includes("localhost")) subdomain = "demo"; 

      if (subdomain && subdomain !== "www") {
        try {
          // Adjust API path if needed based on routes file
          const res = await axios.get(`/api/institutes/by-subdomain/${subdomain}`);
          if (res.data && res.data) {
            setInstituteDetails(res.data);
          }
        } catch (error) {
          console.error("Failed to load institution details", error);
        }
      }
    };
    checkSubdomain();
  }, []);

  useEffect(() => {
    if (open) {
      setIsModalOpen(true);
      router.replace("/login");
    }
  }, []);

  const resetModal = () => {
    setIsModalOpen(false);
    setInstitutionName("");
    setShortForm("");
    setAdminEmailModal("");
    setAdminPasswordModal("");
    setConfirmAdminPasswordModal("");
    setContactNumber("");
    setInstitutionAddress("");
    setWebsiteLink("");
    setLogo(null);
  };

  const removeProfileImage = async () => {
    if (logo && typeof logo === "string" && logo !== "/default.jpg") {
      try {
        await deleteFile(logo);
        N("Success", "Logo removed.", "info");
      } catch (err) {
        console.error("Logo deletion error:", err);
        N("Error", "Could not delete logo.", "error");
      }
    }
    setLogo(null);
  };

  const handleSaveInstitution = async () => {
    if (adminPasswordModal !== confirmAdminPasswordModal) {
      N("Error", "Passwords do not match", "error");
      return;
    }

    const institutionData = {
      name: institutionName,
      shortForm,
      adminEmail: adminEmailModal,
      adminPassword: adminPasswordModal,
      contactNumber,
      institutionAddress,
      websiteLink,
      logo,
    };
    const ch = checkObjectFields(institutionData, []);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    setModalLoading(true);
    try {
      const response = await axios.post("/api/institution", institutionData);
      if (response && response.status === 201) {
        N(
          "Success",
          response.data.message || "Institution registered!",
          "success"
        );
        N("Info", "Verification email sent to admin.", "info");
        resetModal();
      } else {
        N("Error", response.data.message || "Registration failed.", "error");
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Institution registration error.",
        "error"
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141414] flex flex-col justify-center items-center p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <Card className="w-full max-w-[480px] shadow-xl border-none rounded-3xl overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          <div className="mb-8 text-center">
            {instituteDetails?.logo ? (
              <>
                <div className="flex justify-center mb-6">
                  <img
                    src={instituteDetails.logo.startsWith('http') ? instituteDetails.logo : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${instituteDetails.logo}`}
                    alt={instituteDetails.name}
                    className="h-20 object-contain"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Sign into {instituteDetails.shortForm || instituteDetails.name}
                </h1>
              </>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Sign into Vine
              </h1>
            )}
            <p className="text-gray-500 max-md:text-xs dark:text-gray-400">
              Please login to continue to your account.
            </p>
          </div>

          <div className="mb-8">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              New Here?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Create one
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <FloatingLabelInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white dark:bg-gray-800"
            />

            <FloatingLabelInput
              label="Password*"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white dark:bg-gray-800"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="keep-logged-in" />
                <label
                  htmlFor="keep-logged-in"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                >
                  Keep me logged in
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-[#4A1D75] hover:bg-[#3a165c] text-white rounded-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Need Help?{" "}
              <Link
                href="/forgotPassword"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot Password
              </Link>
            </p>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">
                  or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              onClick={() => setIsModalOpen(true)}
            >
              Register New Institution
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-none shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-8 sm:p-10">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Register New Institution
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput
                label="Institution Name*"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
              <FloatingLabelInput
                label="Short Form*"
                placeholder="e.g, VMS"
                value={shortForm}
                onChange={(e) => setShortForm(e.target.value)}
              />
              <FloatingLabelInput
                label="Admin Email*"
                type="email"
                value={adminEmailModal}
                onChange={(e) => setAdminEmailModal(e.target.value)}
                className="border-purple-500" // Highlighted in design
              />
              <FloatingLabelInput
                label="Contact Number*"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
              <FloatingLabelInput
                label="Admin Password*"
                type="password"
                value={adminPasswordModal}
                onChange={(e) => setAdminPasswordModal(e.target.value)}
              />
              <FloatingLabelInput
                label="Confirm Admin Password*"
                type="password"
                value={confirmAdminPasswordModal}
                onChange={(e) => setConfirmAdminPasswordModal(e.target.value)}
              />
              <div className="md:col-span-2">
                <FloatingLabelInput
                  label="Institution Address*"
                  value={institutionAddress}
                  onChange={(e) => setInstitutionAddress(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <FloatingLabelInput
                  label="Website Link*"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <ImageUpload
                    storeFolder="Institution"
                    label={
                      <div className="flex flex-col items-center">
                        <span className="text-gray-600 font-medium mb-1">Click or Drag to Upload Institution Logo</span>
                        <span className="text-xs text-gray-400">JPG, PNG, GIF (Max: 5MB)</span>
                      </div>
                    }
                    imagePreview={logo}
                    handleImageUpload={setLogo}
                    handleRemoveImage={removeProfileImage}
                    inputId="institution-logo-upload"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button
                variant="secondary"
                onClick={resetModal}
                className="w-full sm:w-auto bg-[#A66E99] hover:bg-[#8e5d82] text-white h-12 px-8 text-base font-medium rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveInstitution}
                disabled={modalLoading}
                className="w-full sm:w-auto bg-[#4A1D75] hover:bg-[#3a165c] text-white h-12 px-8 text-base font-medium rounded-lg"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
