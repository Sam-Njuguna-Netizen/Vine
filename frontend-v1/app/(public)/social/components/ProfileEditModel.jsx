"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button, Flex, Modal, Input, Select, Upload, Radio } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { allCategories } from "@/app/utils/courseService";
import { useSelector } from "react-redux";

import ImageUpload from "@/app/Components/ImageUpload";
import { checkObjectFields, deleteFile } from "@/app/utils/common";

import { verifyUser } from "@/app/(public)/components/PublicLayout";

const { Option } = Select;

const ProfileEditModel = forwardRef((props, ref) => {
  const [open, setModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [profession, setProfession] = useState("");
  const [about, setAbout] = useState("");
  const [age, setAge] = useState(""); // Added age state
  const [sex, setSex] = useState(""); // Added sex state
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // Use useEffect to update state when props.profile changes
  useEffect(() => {
    if (props.profile) {
      setName(props.profile.name || "");
      setNickname(props.profile.nickName || "");
      setProfession(props.profile.profession || "");
      setAbout(props.profile.about || "");
      setAge(props.profile.age || ""); // Set age from props
      setSex(props.profile.sex || ""); // Set sex from props
      setProfileImage(props.profile.pPic || null);
      setCoverImage(props.profile.coverImage || null);
    }
  }, [props.profile]); // Dependency array: run effect only when props.profile changes

  const openModal = () => {
    setModalOpen(true);
  };

  const notifyParent = (status = true) => {
    props?.onProfileUpdate(status);
  };

  useImperativeHandle(ref, () => ({
    openModal,
    notifyParent,
  }));

  const handleSaveProfile = async () => {
    const profileData = {
      name,
      nickName: nickname,
      profession,
      about,
      age, // Add age to payload
      sex, // Add sex to payload
      pPic: profileImage,
      coverImage,
    };

    const ch = checkObjectFields(profileData);

    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    try {
      const response = await axios.post("/api/profileUpdate", profileData);
      console.log("response", response);
      if (response && response.status === 201) {
        notifyParent(true);
        N("Success", "Profile updated successfully", "success");
        console.log("reached herer");
        resetModal();
      }
    } catch (error) {
      notifyParent(false);
      N("Error", error?.response?.data?.message, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    }
  };

  const resetModal = () => {
    setModalOpen(false);
  };

  const removeProfileImage = () => {
    if (profileImage && profileImage !== "/default.jpg") {
      deleteFile(profileImage);
    }
    setProfileImage(null);
  };

  const removeCoverImage = () => {
    if (coverImage && coverImage !== "/default.jpg") {
      deleteFile(coverImage);
    }
    setCoverImage(null);
  };

  return (
    <Modal
      title="Edit Profile"
      centered
      open={open}
      onOk={handleSaveProfile}
      onCancel={resetModal}
      footer={[
        <Button key="cancel" onClick={resetModal} className="px-6">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSaveProfile}
          className="px-6"
        >
          Save
        </Button>,
      ]}
      width={600}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Profile Picture
          </label>
          <ImageUpload
            storeFolder="ProfilePicture"
            label="Upload Profile Picture"
            imagePreview={profileImage}
            handleImageUpload={setProfileImage}
            handleRemoveImage={removeProfileImage}
            inputId="profile-image-upload"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Cover Picture
          </label>
          <ImageUpload
            storeFolder="CoverPicture"
            label="Upload Cover Picture"
            imagePreview={coverImage}
            handleImageUpload={setCoverImage}
            handleRemoveImage={removeCoverImage}
            inputId="cover-image-upload"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Name*</label>
          <Input
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nickname</label>
          <Input
            placeholder="Enter Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <Input
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sex</label>
            <Select
              placeholder="Select your sex"
              value={sex}
              onChange={(value) => setSex(value)}
              style={{ width: "100%" }}
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
              <Option value="Prefer not to say">Prefer not to say</Option>
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Profession</label>
          <Input
            placeholder="Enter Profession"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">About</label>
          <Input.TextArea
            rows={3}
            placeholder="Tell us about yourself"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
});

export default ProfileEditModel;
