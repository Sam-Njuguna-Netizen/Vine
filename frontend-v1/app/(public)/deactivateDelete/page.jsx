"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import axios from "@/app/api/axios";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function DeactivateDelete() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/myProfile");
        const data = res.data;

        setNotificationsEnabled(data.user?.notificationsEnabled !== false);

        // Store other profile data needed for update payload
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          country: data.country || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          gender: data.gender || data.sex || "",
          pPic: data.pPic || null,
          coverImage: data.coverImage || null,
        });
      } catch (err) {
        console.error("Failed to fetch profile settings");
      }
    };
    fetchProfile();
  }, []);

  const handleNotificationChange = async (checked) => {
    setNotificationsEnabled(checked);
    try {
      const payload = {
        ...profileData,
        notificationsEnabled: checked,
      };
      await axios.post("/api/profileUpdate", payload);
      toast.success("Notification settings updated");
    } catch (err) {
      setNotificationsEnabled(!checked); // Revert on failure
      toast.error("Failed to update settings");
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/deactivate", {
        confirmationText,
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h2 className="text-3xl font-bold">Account Settings</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#701A75] uppercase tracking-wide">
          Notification Settings
        </h3>

        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="space-y-0.5">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
              Receive Notifications
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable to receive notifications about courses, updates, and community activity.
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationChange}
          />
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-6" />

        <h3 className="text-lg font-medium text-[#701A75] uppercase tracking-wide">
          Account Deactivation/Deletion
        </h3>

        <div className="space-y-2">
          <p className="text-base text-gray-800 dark:text-gray-200">
            What happens when you deactivate/delete your account?
          </p>
          <ul className="list-disc list-inside text-base text-gray-600 dark:text-gray-400 space-y-1 ml-2">
            <li>Your profile won’t be shown on the platform anymore.</li>
            <li>Any payment will be cancelled.</li>
          </ul>
        </div>

        <div className="pt-6">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-[#701A75] to-[#312E81] hover:from-[#5a155e] hover:to-[#262466] text-white"
              >
                Deactivate/Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently deactivate your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <p className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Warning
                  </p>
                  <p className="mt-1">
                    If you deactivate/delete your account, you will not be able to reactivate it without admin assistance.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    To confirm, type <span className="font-bold">deactivate</span> or <span className="font-bold">delete</span> below:
                  </Label>
                  <Input
                    id="confirm"
                    placeholder="Type 'deactivate' or 'delete'"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeactivate}
                  disabled={
                    confirmationText !== "deactivate" &&
                    confirmationText !== "delete"
                  }
                  loading={loading}
                >
                  Confirm Deactivation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
