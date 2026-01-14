'use client';
import { useState, useRef, useEffect } from 'react';
import { PlusOutlined, UploadOutlined, CloseSquareOutlined, MoreOutlined } from "@ant-design/icons";
import { Dropdown, Button, Popconfirm, Space, Modal, Input, Upload, Popover, Select, Table } from 'antd';
import { N } from "@/app/utils/notificationService";
import axios from '@/app/api/axios';
import { checkObjectFields, deleteFile } from "@/app/utils/common";
import { MyAllCourse } from "@/app/utils/courseService";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

const CourseVideos = () => {
    const [courses, setCourses] = useState([]); // State to store all courses
    const [selectedCourseId, setSelectedCourseId] = useState(null); // State to store the selected course ID
    const [courseVideos, setCourseVideos] = useState([]); // State to store videos for the selected course

    // Fetch all courses on component mount
    useEffect(() => {
        getAllCourses();
    }, []);

    // Fetch videos for the selected course
    useEffect(() => {
        if (selectedCourseId) {
            getCourseVideos(selectedCourseId);
        }
    }, [selectedCourseId]);

    // Fetch all courses
    const getAllCourses = async () => {
        try {
            const response = await MyAllCourse();

            setCourses(response.courses);
        } catch (error) {
            N("Error", "Failed to fetch courses", "error");
        }
    };

    // Fetch videos for a specific course
    const getCourseVideos = async (courseId) => {
        try {
            const response = await axios.get(`/api/getCourseDocuments/${courseId}`);
            if (response.status === 200) {
                setCourseVideos(response.data);
            }
        } catch (error) {
            N("Error", "Failed to fetch videos", "error");
        }
    };

    // Handle course selection
    const handleCourseChange = (value) => {
        setSelectedCourseId(value);
    };

    const [serialNo, setSerialNo] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [path, setDocument] = useState('');
    const [open, setModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleSave = async () => {
        const documentInfo = { serialNo, title, description, path, courseId: selectedCourseId };
        const ch = checkObjectFields(documentInfo, ['description']);
        if (!ch.success) {
            N("Error", ch.message, "error");
            return;
        }
        try {
            const response = await axios.post('/api/storeDocumentInfo', documentInfo);
            if (response.status === 201) {
                N("Success", response.data.message, "success");
                getCourseVideos(selectedCourseId);
                onClose();
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }
    };

    const [docUrl, setDocUrl] = useState(null);
    const [docTitle, setDocTitle] = useState("");
    const [docModalOpen, setDocModalOpen] = useState(false);

    const handleDocumentOpen = async (doc) => {
        try {
            setDocTitle(doc.title);
            setDocUrl(doc.path);

            // Open the modal
            setDocModalOpen(true);
        } catch (error) {
            console.error("Error fetching document:", error);
        }
    };


    const onClose = () => {
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setSerialNo('')
        setDocument('');
    };

    // const handleDocumentUpload = async (event) => {
    //     const file = event.target.files[0];
    //     const formData = new FormData();
    //     formData.append('file', file);

    //     const folder = 'Documents';

    //     try {
    //         const response = await axios.post(`/api/upload?folder=${folder}`, {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (response.status === 200) {
    //             const data = await response.json();
    //             N("Success", data.message, "success");
    //             setDocument(data.publicUrl);
    //         } else {
    //             N("Error", "Error uploading", "error");
    //             // onError('Upload failed');
    //         }
    //     } catch (error) {
    //         N("Error", "Error uploading document", "error");
    //         //   onError('Upload failed');
    //     }
    // };

    const handleDocumentUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'Documents'); // ✅ append folder in FormData

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                const data = response.data;
                N("Success", "Uploaded successfully", "success");
                setDocument(data.publicUrl); // ✅ Save uploaded file URL
            } else {
                N("Error", "Error uploading", "error");
            }
        } catch (error) {
            console.error('Upload error:', error);
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }
    };

    const menuItems = (doc, handleDelete) => [
        {
            key: '1',
            label: (
                <Popconfirm
                    title="Are you sure you want to delete this Document?"
                    onConfirm={() => handleDelete(doc)}
                    okText="Yes"
                    cancelText="No"
                >
                    <span className="cursor-pointer text-red-500">Delete</span>
                </Popconfirm>
            ),
        },
    ]

    const handleDelete = async (doc) => {
        console.log(doc)
        try {
            deleteFile(doc.path)

            // Fetch the new video
            const videoResponse = await axios.post('/api/deleteDoc', doc);
            if (videoResponse.status === 200) {
                N('Success', videoResponse.data.message, 'success')
                getCourseVideos(selectedCourseId);
            } else {
                console.error('Response is not a Blob:', videoResponse.data);
            }
        } catch (error) {
            console.error('Error streaming video:', error);
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Serial No',
            dataIndex: 'serialNo',
            key: 'serialNo',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <Popover content={text} title="Description">
                    {text?.length > 50 ? `${text.slice(0, 50)}...` : text}
                </Popover>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleDocumentOpen(record)}>
                        Open
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this video?"
                        onConfirm={() => handleDelete(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <span className="cursor-pointer text-red-500">Delete</span>
                    </Popconfirm>
                    {/* <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'delete',
                                    label: (
                                        <Popconfirm
                                            title="Are you sure you want to delete this video?"
                                            onConfirm={() => handleDelete(record)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <span className="cursor-pointer text-red-500">Delete</span>
                                        </Popconfirm>
                                    ),
                                },
                            ],
                        }}
                        trigger={['click']}
                    >
                        <MoreOutlined />
                    </Dropdown> */}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="text-center sm:text-left mb-4">
                <Select
                    placeholder="Select a course"
                    style={{ width: 300 }}
                    onChange={handleCourseChange}
                    className="text-left" // Add this class to align left on larger screens
                >
                    {courses.map((course) => (
                        <Select.Option key={course.id} value={course.id}>
                            {course.title}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {selectedCourseId && (
                <div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalOpen(true)}
                        className="mb-4"
                    >
                        Add Document
                    </Button>

                    <Table
                        columns={columns}
                        dataSource={courseVideos}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            )}

            {/* Video Upload Modal */}
            <Modal
                title="Upload Document"
                centered
                open={open}
                onOk={handleSave}
                onCancel={onClose}
                footer={[
                    <Button key="cancel" onClick={onClose} className="px-6">Cancel</Button>,
                    <Button key="submit" type="primary" onClick={handleSave} className="px-6">Upload</Button>,
                ]}
                width={600}
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
                        <label className="block text-sm font-medium mb-2">Upload Document*</label>
                        <DragDropFileUpload
                            onFileSelect={(file) => handleDocumentUpload({ target: { files: [file] } })}
                            selectedFile={path ? { name: "Uploaded Document", previewUrl: path.endsWith('.pdf') ? null : path } : null}
                            label="Upload Document"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                title={docTitle}
                centered
                open={docModalOpen}
                onCancel={() => setDocModalOpen(false)}
                footer={[<Button key="close" onClick={() => setDocModalOpen(false)}>Close</Button>]}
                width={1000}
            >
                {docUrl && (
                    <>
                        {/* Show PDF */}
                        {docUrl.endsWith(".pdf") ? (
                            <iframe src={docUrl} className="w-full h-[600px]" />
                        ) : (
                            // Show Download Link for Other Files
                            <div className="flex flex-col items-center">
                                <p>Preview not available. Download the document:</p>
                                <a
                                    href={docUrl}
                                    download={docTitle}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    Download Document
                                </a>
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default CourseVideos;