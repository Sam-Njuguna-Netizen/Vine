"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "../../utils/auth";
import { N } from "@/app/utils/notificationService";
import axiosInstance from "@/app/api/axios";
import ThemeSwitcher from "@/app/Components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("3");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [isSubdomainLocked, setIsSubdomainLocked] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // Debounced search handler for institutions
  const handleInstitutionSearch = (searchText) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(
          `/api/allActiveInstitution?search=${searchText}`
        );
        if (res?.data?.success) {
          const formattedInstitutions = res.data.institution.map((inst) => ({
            value: inst.id.toString(),
            label: inst.name,
          }));
          setInstitutions(formattedInstitutions);
        }
      } catch (err) {
        console.error("Error searching institutions:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  useEffect(() => {
    const fetchInstitutionData = async () => {
      setInstitutionsLoading(true);
      const hostname = window.location.hostname;
      const parts = hostname.split(".");

      const isLocalhost = hostname.includes("localhost");
      const subdomain =
        !isLocalhost && parts.length > 2 && parts[0] !== "www"
          ? parts[0]
          : null;

      try {
        if (subdomain) {
          const res = await axiosInstance.get(
            `/api/institutes/by-subdomain/${subdomain}`
          );
          if (res?.data) {
            const inst = res.data;
            const formattedInstitute = {
              value: inst.id.toString(),
              label: inst.name,
            };
            setInstitutions([formattedInstitute]);
            setInstitution(inst.id.toString());
            setIsSubdomainLocked(true);
          } else {
            N(
              "Error",
              "This institution's registration page is not available.",
              "error"
            );
          }
        } else {
          // Initial fetch of all institutions (or top ones)
          const res = await axiosInstance.get("/api/allActiveInstitution");
          if (res?.data?.success) {
            const formattedInstitutions = res.data.institution.map((inst) => ({
              value: inst.id.toString(),
              label: inst.name,
            }));
            setInstitutions(formattedInstitutions);
          } else {
            N(
              "Error",
              res?.data?.message || "Failed to load institutions.",
              "error"
            );
          }
          setIsSubdomainLocked(false);
        }
      } catch (err) {
        console.error("Error fetching institution data:", err);
        const errorMessage = subdomain
          ? "Could not verify this institution's domain."
          : "Could not fetch the list of institutions.";
        N(
          "Error",
          err?.response?.data?.message || errorMessage,
          "error"
        );
      } finally {
        setInstitutionsLoading(false);
      }
    };

    fetchInstitutionData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !name ||
      !dob ||
      !email ||
      !password ||
      !confirmPassword ||
      !institution
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, password, role, institution, {
        name,
        dob,
      });

      if (response && response.success) {
        N(
          "Success",
          response.message ||
            "Registration successful! Please check your email for verification.",
          "success"
        );
        router.push("/login");
      } else {
        const errorMessage =
          response?.error?.response?.data?.message ||
          response?.message ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        N("Error", errorMessage, "error");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "An unexpected error occurred during registration.";
      setError(errorMessage);
      N("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141414] flex flex-col justify-center items-center p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <Card className="w-full max-w-[480px] shadow-xl border-none rounded-3xl overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Vine Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <FloatingLabelInput
              label="Your Name*"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <FloatingLabelInput
              label="Date of Birth*"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <FloatingLabelInput
              label="Email*"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-purple-500"
            />

            <FloatingLabelInput
              label="Password*"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FloatingLabelInput
              label="Confirm Password*"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="relative">
              <label className="absolute text-xs text-gray-500 dark:text-gray-400 -top-2 left-2 bg-white dark:bg-gray-800 px-1 z-10">
                Select Your Institution*
              </label>

              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full h-12 justify-between pt-2 font-normal text-base"
                    disabled={isSubdomainLocked || institutionsLoading}
                  >
                    {institution
                      ? institutions.find(
                          (inst) => inst.value === institution
                        )?.label
                      : "Select institution..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search institution..."
                      onValueChange={handleInstitutionSearch}
                    />
                    <CommandList>
                      {isSearching ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No institution found.</CommandEmpty>
                          <CommandGroup>
                            {institutions.map((inst) => (
                              <CommandItem
                                key={inst.value}
                                value={inst.value}
                                onSelect={(currentValue) => {
                                  setInstitution(
                                    currentValue === institution
                                      ? ""
                                      : currentValue
                                  );
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    institution === inst.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {inst.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="relative">
              <label className="absolute text-xs text-gray-500 dark:text-gray-400 -top-2 left-2 bg-white dark:bg-gray-800 px-1 z-10">
                Register as*
              </label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full h-12 pt-2">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Student / Learner</SelectItem>
                  <SelectItem value="2">Instructor / Educator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-[#4A1D75] hover:bg-[#3a165c] text-white rounded-lg transition-all duration-200 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to the Vine{" "}
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-500"
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link
              href="/eula"
              className="text-blue-600 hover:text-blue-500"
            >
              License Agreement
            </Link>
            , and{" "}
            <Link
              href="/terms-and-conditions"
              className="text-blue-600 hover:text-blue-500"
            >
              Terms &amp; Conditions
            </Link>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
