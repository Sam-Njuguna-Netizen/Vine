"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axios from "@/app/api/axios";
import { toast } from "sonner";
import ImageUpload from "@/app/Components/ImageUpload";
import { checkObjectFields, deleteFile } from "@/app/utils/common";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [gender, setGender] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    // Fetch profile data on component mount
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/myProfile");
        const data = res.data;

        // Set state with fetched data
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.user?.email || ""); // Email comes from user object
        setPhone(data.phone || "");
        setDateOfBirth(data.dateOfBirth || "");
        setCountry(data.country || "");
        setAddressLine1(data.addressLine1 || "");
        setAddressLine2(data.addressLine2 || "");
        setGender(data.gender || data.sex || ""); // Use gender, fallback to sex
        setProfileImage(data.pPic || null);
        setCoverImage(data.coverImage || null);
      } catch (err) {
        toast.error("Failed to fetch profile info");
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    // Consolidate user data for submission
    const userData = {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      country,
      addressLine1,
      addressLine2,
      gender,
      pPic: profileImage,
      coverImage,
    };

    console.log("Submitting user data:", userData);

    // Basic validation - fixed typo here
    const check = checkObjectFields(userData, []);
    if (!check.success) return toast.error(check.message);

    setLoading(true);
    try {
      const res = await axios.post("/api/profileUpdate", userData);
      if (res.status === 201) {
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("Something went wrong while updating profile");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image removal
  const removeImage = (type) => {
    if (type === "profile" && profileImage) {
      deleteFile(profileImage);
      setProfileImage(null);
    }
    if (type === "cover" && coverImage) {
      deleteFile(coverImage);
      setCoverImage(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Image Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Profile Picture</Label>
          <div className="flex justify-center md:justify-start">
            <ImageUpload
              storeFolder="ProfilePicture"
              label="Upload"
              imagePreview={profileImage}
              handleImageUpload={setProfileImage}
              handleRemoveImage={() => removeImage("profile")}
              inputId="profile-upload"
              isProfile={true}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base font-semibold">Cover Photo</Label>
          <ImageUpload
            storeFolder="CoverPicture"
            label="Upload Cover"
            imagePreview={coverImage}
            handleImageUpload={setCoverImage}
            handleRemoveImage={() => removeImage("cover")}
            inputId="cover-upload"
          />
        </div>
      </div>

      {/* Form Fields Section - New Design */}
      <div className="space-y-6 border-none">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-base font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-base font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Enter Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g info@institution.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g +1 234 567 890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Date of Birth & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-base font-medium">
              Date Of Birth
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              placeholder="10 may-1999"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Pakistan">Pakistan</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address Line 1 & Address Line 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="addressLine1" className="text-base font-medium">
              Address Line 1
            </Label>
            <Input
              id="addressLine1"
              placeholder="Enter full Address"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2" className="text-base font-medium">
              Address Line 2
            </Label>
            <Input
              id="addressLine2"
              placeholder="(optional)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Male" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-11 px-8 bg-[#9D5C9D] text-white hover:bg-[#8a4f8a] border-none"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="h-11 px-8 bg-[#4A235A] hover:bg-[#3a1b46] text-white"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div >
  );
}
