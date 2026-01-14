"use client";
import { useEffect, useRef, useState } from "react";
// import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import { Button, Input, Table, Space, Modal, Select, Popconfirm } from "antd";

import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  UploadOutlined, CloseSquareOutlined, MinusCircleOutlined
} from "@ant-design/icons";
import {
  Modal, Button, Input, Radio, message, Typography, Divider, Table, Select,
  TimePicker, Popover, ConfigProvider, DatePicker, Space, Popconfirm, Form
} from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { checkObjectFields } from "@/app/utils/common";
import moment from 'moment';
import Countdown from 'react-countdown';
import axios from '@/app/api/axios';
dayjs.extend(duration);
const { Text } = Typography;

dayjs.extend(customParseFormat);


import Highlighter from "react-highlight-words";
import { addUser, allUsers, updateUser, deleteUser } from "@/app/utils/auth";
import { N } from "@/app/utils/notificationService";

import { useSelector } from "react-redux";

export default function LiveClassSchedules({ course }) {
  const authUser = useSelector((state) => state.auth.user);

  const [mettings, setMettings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [openUserModal, setOpenAddClassModal] = useState(false);

  useEffect(() => {
    getAllMetting();
  }, []);

  const getAllMetting = async () => {
    try {
      const response = await axios.get(`/api/live-classes/${course.id}`);
      if (response.status === 200) {
        if (response?.data.success) {
          const formattedUsers = response?.data.liveClasses.map((user, index) => ({
            key: index.toString(),
            id: user.id,
            serialNo: user.serialNo,
            title: user.title,
            description: user.description,
            duration: user.duration,
            meetingUrl: user.meetingUrl,
            isStarted: user.isStarted,
            isClosed: user.isClosed,
            startDateTime: <Countdown date={user.startDateTime} />,
          }));
          setMettings(formattedUsers);
        }
      }
    } catch (error) {
      N("Error", "Failed to fetch Quizs", "error");
    }
  };

  // Searchable columns
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 w-full"
        />
        <Space>
          <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small">
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small">
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  const [serialNo, setSerialNo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(null);
  const [isStartedClicked, setIsStartedClicked] = useState(false);
  const [startDateTime, setStartDateTime] = useState(dayjs());

  const columns = [
    {
      title: "Serial No",
      dataIndex: "serialNo",
      key: "serialNo",
      ...getColumnSearchProps("serialNo"),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description"),
    },
    {
      title: "Start Date Time",
      dataIndex: "startDateTime",
      key: "startDateTime",
      ...getColumnSearchProps("startDateTime"),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      ...getColumnSearchProps("duration"),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <>
        { !record.isClosed ? (
          <Space>
          
          {authUser.id === course.instructorId ? (
            <Popconfirm key="submit" title="Are you sure you want to host the metting right now?" onConfirm={() => joinMeeting(record)} okText="Yes" cancelText="No">
              <Button type="primary" icon={<DeleteOutlined />}>
                Join
              </Button>
            </Popconfirm>

          ) :
          (
            record.isStarted ? (
              <Button onClick={() => joinMeeting(record)} type="primary" icon={<DeleteOutlined />}>
            Join
          </Button>
            ) :

            (
              <span>Not Started</span>
            )
            
          )
        }


          {/* <Popconfirm title="Are you sure you want to delete this user?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm> */}
        </Space>
        ) : 
        <span>Closed</span>
        }
        
        </>
        
      ),
    },
  ];

  const [meetingUrl, setMeetingUrl] = useState(null);
  const [meetingId, setMeetingId] = useState(0);
  const [meetingModel, setMeetingModel] = useState(false);
  const [meetingData, setMeetingData] = useState({});

  const joinMeeting = (record) => {
    setMeetingData(record)
    setMeetingModel(true)
  };
  const handleCloseMeeting = async () => {
    try {
      const response = await axios.post('/api/updateTheMeetingIscloseStatus', { ...meetingData, isClosed: true });
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getAllMetting();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Upload failed", "error");
    }
    setMeetingData(null)
    setMeetingModel(false)
  };

  const makeTheMeetingOpen = async () => {
    try {

      const response = await axios.post('/api/makeTheMeetingOpen', meetingData);
      if (response.status === 200) {
        setIsStartedClicked(true)
        N("Success", response.data.message, "success");
        getAllMetting();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Upload failed", "error");
    }
  };

  const handleRestore = () => {
    setMeetingId(false); // Restore the modal to the original size
  };

  const handleChangeDuration = (time, timeString) => {
    setDuration(timeString);
  };

  const resetModal = () => {
    setOpenAddClassModal(false);
    setTitle('')
    setDescription('')
    setDuration(null)
    setStartDateTime(dayjs())
  };

  const handleDelete = async (userId) => {
    const response = await deleteUser(userId);
    if (response.success) {
      getAllMetting();
      N("Success", "User deleted successfully!", "success");
    } else {
      N("Error", "Failed to delete user!", "error");
    }
  };

  const handleMeeting = async () => {
    const mettingInfo = {
      serialNo, title, description, courseId: course.id,
      startDateTime: startDateTime.format('YYYY-MM-DD HH:mm:ss'), duration
    };
    const ch = checkObjectFields(mettingInfo, ['description']);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }
    try {
      const response = await axios.post('/api/live-classes', mettingInfo);
      if (response.status === 201) {
        N("Success", response.data.message, "success");
        getAllMetting();
        resetModal();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Upload failed", "error");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Live Class Schedules</h1>
        
        {course.instructorId === authUser.id ? (
              <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setOpenAddClassModal(true); }}>
              Add Class Schedule
            </Button>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { getAllMetting(); }}>
              Refresh
            </Button>
            )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={mettings} loading={mettings.length === 0} pagination={{ pageSize: 10 }} />
      </div>

      {/* Modal for Jitsi Meeting */}
      <Modal
        title="Join Meeting"
        open={meetingModel}
        onCancel={() => setMeetingUrl(null)}
        footer={[
          authUser.id === course.instructorId ? (
            <Popconfirm
              key="closeMeeting"
              title="Are you sure you want to close the meeting?"
              onConfirm={handleCloseMeeting}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" className="px-6">
                Close Meeting
              </Button>
            </Popconfirm>
          ) : (
            <Button key="joinMeeting" type="primary" className="px-6" onClick={() => setMeetingModel(false)}>
              Leave Meeting
            </Button>
          ),
        ]}
        width={800}
        destroyOnClose
        className="minimized-modal"
        closable={false}
      >
        {/* Minimized state button */}
        {meetingData && (
          <>
            {authUser.id === course.instructorId && (
              <h1>Step 1: Join the meetings as the Instructor</h1>
            )}
            <div className="jitsi-container">
            {/* <a  href={meetingData.meetingUrl}>Any Issue? Click here.</a> */}
              <iframe
                title="Meeting"
                src={meetingData.meetingUrl}
                width="100%"
                height="600px"
                allow="camera; microphone; fullscreen; display-capture"
              />
            </div>
            {(authUser.id === course.instructorId) && (!isStartedClicked && !meetingData.isStarted) && (
              <div>
                <h1>Step 2: Make the meeting open for students</h1>
                <Popconfirm title="Are you sure you want to make open for students?" onConfirm={() => makeTheMeetingOpen()} okText="Yes" cancelText="No">
                  <Button type="primary" className="px-6">Open</Button>
                </Popconfirm>
              </div>

            )}
          </>
        )}
      </Modal>

      {/* User Modal */}
      <Modal
        title={"Schedule a meeting"}
        open={openUserModal}
        onOk={handleMeeting}
        onCancel={resetModal}
        footer={[
          <Button key="cancel" onClick={resetModal}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleMeeting}>Add meeting</Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Serial No*</label>
            <Input type="number" placeholder="Enter Serial No" value={serialNo} onChange={(e) => setSerialNo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title*</label>
            <Input placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input.TextArea rows={3} placeholder="Enter Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date Time*</label>
            <DatePicker
              showTime
              locale="en"
              value={startDateTime}
              onChange={(date) => setStartDateTime(date || dayjs())}
              className="w-full"
              format="YYYY-MM-DD hh:mm A"
              
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration*</label>
            <TimePicker
              format="HH:mm:ss"
              onChange={handleChangeDuration}
              minuteStep={5}
              showNow={false}
              placeholder="Select Duration (HH:mm)"
              className="w-full"
            />
          </div>


        </div>
      </Modal>
    </div>
  );
}
