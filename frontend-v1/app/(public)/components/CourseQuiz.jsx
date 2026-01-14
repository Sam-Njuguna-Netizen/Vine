'use client';
import { useState, useRef, useEffect } from 'react';
import { MoreOutlined, PlusOutlined, UploadOutlined, CloseSquareOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
    Dropdown,
    Modal, Button, Input, Radio, List, Tag, message, Typography, Divider,
    TimePicker, Popover, ConfigProvider, DatePicker, Space, Popconfirm, Form
} from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { N } from "@/app/utils/notificationService";
import axios from '@/app/api/axios';
import { checkObjectFields } from "@/app/utils/common";
import Countdown from 'react-countdown';
import moment from 'moment';

dayjs.extend(duration);

const { Text } = Typography;

dayjs.extend(customParseFormat);

const CourseQuiz = ({ course }) => {
    const [courseQuizs, setCourseQuizs] = useState([]);
    const [submissionBefore, setSubmissionBefore] = useState(dayjs());

    useEffect(() => {
        getCourseQuizs();
    }, [course.id]);

    const getCourseQuizs = async () => {
        try {
            const response = await axios.get(`/api/getCourseQuizs/${course.id}`);
            if (response.status === 200) {
                setCourseQuizs(response.data);
            }
        } catch (error) {
            N("Error", "Failed to fetch Quizs", "error");
        }
    };

    const [serialNo, setSerialNo] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(null);

    const [open, setModalOpen] = useState(false);

    const handleSave = async () => {
        const QuizInfo = {
            serialNo, title, description, courseId: course.id,
            submissionBefore: submissionBefore.format('YYYY-MM-DD HH:mm:ss'), duration
        };
        const ch = checkObjectFields(QuizInfo, ['description']);
        if (!ch.success) {
            N("Error", ch.message, "error");
            return;
        }
        try {
            const response = await axios.post('/api/storeQuizInfo', QuizInfo);
            if (response.status === 201) {
                N("Success", response.data.message, "success");
                getCourseQuizs();
                onClose();
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }
    };

    const [quizId, setQuizId] = useState('');
    const [quizQuizQuAddModel, setQuizQuestionAddModel] = useState(false);
    const [quizAttendExamModel, setQuizAttendExamModel] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [quiz, setQuiz] = useState('');

    const handleAddQuizQuestions = (QuizId) => {
        setQuizId(QuizId)
        setQuizQuestionAddModel(true);
    };

    const handleAttendTest = async (QuizId) => {
        setQuizId(QuizId)
        try {
            const response = await axios.get(`/api/getQuizQuestions/${QuizId}`);
            if (response.status === 200) {
                N("Success", "Start your test.", "success");
                setQuiz(response.data);
                setQuizAttendExamModel(true)
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }
        setQuizAttendExamModel(true);
    };

    const handleChangeDuration = (time, timeString) => {
        setDuration(timeString);
    };

    const [form] = Form.useForm();

    const onFinish = async (values) => {
        let optionMatched = false;
        values.inputs.forEach(element => {
            if (element.name === answer) {
                optionMatched = true
                return
            }
        });

        if (!optionMatched) {
            N("Error", "No options matched with the answer!", "error");
            return;
        }
        const QuizInfo = { question, answer, quizId, options: values.inputs };
        const ch = checkObjectFields(QuizInfo);
        if (!ch.success) {
            N("Error", ch.message, "error");
            return;
        }

        try {
            const response = await axios.post('/api/storeQuizQuestion', QuizInfo);
            if (response.status === 201) {
                N("Success", response.data.message, "success");
                getCourseQuizs();
                setQuestion('')
                setAnswer('')
                form.resetFields();
                // onClose();
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }

    };


    const onClose = () => {
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setSerialNo('')
        setQuizQuestionAddModel(false);
        form.resetFields();
    };

    const onCloseAfterExam = () => {
        setQuizId('')

        setQuizAttendExamModel(false);

        setQuestion('')
        setAnswer('')
        setDuration(null);
    };

    //exam
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (quiz?.duration) {
            const [hours, minutes, seconds] = quiz.duration.split(':').map(Number);
            const totalSeconds = dayjs.duration({ hours, minutes, seconds }).asSeconds();
            setTimeLeft(totalSeconds);
        }
    }, [quiz]);

    // Timer functionality
    useEffect(() => {
        if (!timeLeft || !open) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitAnswer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, open]);

    const formatTime = (seconds) => {
        const duration = dayjs.duration(seconds, 'seconds');
        return duration.format('HH:mm:ss');
    };

    const handleAnswerChange = (questionId, value) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitAnswer = async () => {
        const answers = quiz.questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: selectedAnswers[q.id] || null,
            correctAnswer: q.answer,
            isCorrect: selectedAnswers[q.id] === q.answer,
        }));

        const score = answers.filter((a) => a.isCorrect).length;

        const QuizInfo = { answers, score, quizId };
        const ch = checkObjectFields(QuizInfo);
        if (!ch.success) {
            N("Error", ch.message, "error");
            return;
        }

        try {
            const response = await axios.post('/api/storeQuizAnswer', QuizInfo);
            if (response.status === 201) {
                N("Success", `You scored ${score} out of ${quiz.questions.length}`, "success");
                onCloseAfterExam();
                getCourseQuizs();
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }

    }
    const [result, setResult] = useState(null);
    const [resultModel, setResultModel] = useState(false);

    const handleMyQuizResult = async (answers) => {
        const ch = checkObjectFields(answers);
        if (!ch.success) {
            N("Error", ch.message, "error");
            return;
        }

        try {
            const response = await axios.post('/api/myQuizResult', answers);
            if (response.status === 201) {
                N("Success", 'You result is ready', "success");
                setResult(response.data.result)
                setResultModel(true);
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        }

    }

    const closeResultModel = async () => {
        setResult([])
        setResultModel(false);
    }



    // 🎯 Function to trigger when countdown ends
    const handleTimeUp = () => {
        message.warning('Time is up! Submitting your quiz automatically.');
        // 🛠️ Call your submit function here
        handleSubmitAnswer();
    };

    // ⏰ Function to convert "HH:MM:SS" to milliseconds
    const convertDurationToMs = (duration = "00:00:00") => {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        return ((hours * 60 + minutes) * 60 + seconds) * 1000;
    };

    const menuItems = (doc, handleDelete) => [
        {
            key: '1',
            label: (
                <Popconfirm
                    title="Are you sure you want to delete this Quiz?"
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
        try {
            // Fetch the new video
            const videoResponse = await axios.post('/api/deleteQuiz', doc);
            if (videoResponse.status === 200) {
                N('Success', videoResponse.data.message, 'success')
                getCourseQuizs()
            } else {
                console.error('Response is not a Blob:', videoResponse.data);
            }
        } catch (error) {
            console.error('Error streaming video:', error);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap flex-stack mb-6">
                <h3 className="fw-bolder my-2">Course Quizs</h3>
                {course.instructorCall && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                        Add Quiz
                    </Button>
                )}
            </div>

            <Modal
                title="Upload Quiz"
                centered
                open={open}
                onOk={handleSave}
                onCancel={onClose}
                footer={[
                    <Button key="cancel" onClick={onClose} className="px-6">Cancel</Button>,
                    <Button key="submit" type="primary" onClick={handleSave} className="px-6">Upload</Button>,
                ]}
                width="100%"
                style={{ maxWidth: '600px', top: 20 }}
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

                    <div>
                        <label className="block text-sm font-medium mb-2">Submission Before*</label>
                        <DatePicker
                            showTime
                            locale="en"
                            value={submissionBefore}
                            onChange={(date) => setSubmissionBefore(date || dayjs())}
                            className="w-full"
                            format="YYYY-MM-DD hh:mm A"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                title={quiz?.title}
                centered
                open={quizAttendExamModel}
                onOk={handleSubmitAnswer}
                onCancel={handleSubmitAnswer}
                footer={[
                    <Popconfirm key="submit-popconfirm" title="Are you sure you want to Submit?" onConfirm={() => handleSubmitAnswer()} okText="Yes" cancelText="No">
                        <Button key="submit" type="primary" className="px-6">
                            Submit
                        </Button>
                    </Popconfirm>
                ]}
                width="100%"
                style={{ maxWidth: '600px', top: 20 }}
            >
                <div className="space-y-4">
                    {convertDurationToMs(quiz.duration) !== null && (
                        <div className="text-right mb-2">
                            <Text type={convertDurationToMs(quiz.duration) <= 60 ? 'danger' : 'secondary'}>
                                Time Remaining: <Countdown date={(Date.now() + convertDurationToMs(quiz.duration))} onComplete={handleTimeUp} />
                            </Text>
                        </div>
                    )}



                    {quiz?.questions?.map((question, index) => (
                        <div key={question.id} className="space-y-2">
                            <Text strong>
                                {index + 1}. {question.question}
                            </Text>
                            <Divider style={{ borderColor: '#7cb305' }} />
                            <Radio.Group
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                value={selectedAnswers[question.id]}
                            >
                                <Space direction="vertical">
                                    {JSON.parse(question.options)?.map((option, optIndex) => (
                                        <Radio key={optIndex} value={option.name}>
                                            {option.name}
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                            <Divider />
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal
                title="Upload Quiz Questions"
                centered
                open={quizQuizQuAddModel}
                onOk={handleSave}
                onCancel={onClose}
                footer={[
                    <Button key="cancel" onClick={onClose} className="px-6">Cancel</Button>,
                    // <Button key="submit" type="primary" onClick={handleSave} className="px-6">Upload</Button>,
                ]}
                width="100%"
                style={{ maxWidth: '600px', top: 20 }}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Question*</label>
                        <Input placeholder="Enter Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Options*</label>

                        <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
                            <Form.List name="inputs">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                                            <Space key={key} align="baseline" className="mb-2">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    fieldKey={[fieldKey, 'name']}
                                                    rules={[{ required: true, message: 'Please enter value' }]}
                                                >
                                                    <Input placeholder="Input field" />
                                                </Form.Item>
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                    style={{ color: 'red', fontSize: '20px' }}
                                                />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                icon={<PlusOutlined />}
                                                style={{ width: '100%' }}
                                            >
                                                Add Option
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>

                            <div>
                                <label className="block text-sm font-medium mb-2">Answer*</label>
                                <Input placeholder="Enter Question" value={answer} onChange={(e) => setAnswer(e.target.value)} />
                            </div>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                </div>
            </Modal>

            <Modal
                title="Your Result"
                centered
                open={resultModel}
                onOk={closeResultModel}
                onCancel={closeResultModel}
                footer={[
                    <Button key="cancel" onClick={closeResultModel} className="px-6">Back</Button>,
                ]}
                width="100%"
                style={{ maxWidth: '600px', top: 20 }}
            >
                <List
                    dataSource={result}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={<b>{item.question}</b>}
                                description={
                                    <div>
                                        <p><b>Selected Answer:</b> {item.selectedAnswer}</p>
                                        <p><b>Correct Answer:</b> {item.correctAnswer}</p>
                                        <p>
                                            <b>Options:</b> {JSON.parse(item.options).map((opt) => (
                                                <Tag key={opt.name}>{opt.name}</Tag>
                                            ))}
                                        </p>
                                        <Space>
                                            {item.isCorrect ? (
                                                <Tag color="green">Correct</Tag>
                                            ) : (
                                                <Tag color="red">Incorrect</Tag>
                                            )}
                                        </Space>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                {courseQuizs.map((doc) => (
                    <div
                        className="max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl m-4"
                        key={doc.id}
                    >
                        <div className="md:flex">

                            {/* Clickable Image with Hover Effect */}
                            <div
                                className="md:flex-shrink-0 cursor-pointer overflow-hidden"

                            >
                                <img
                                    className="h-48 w-full object-cover md:w-48 transform transition-transform duration-300 hover:scale-105"
                                    src="https://png.pngtree.com/png-clipart/20230303/original/pngtree-quiz-clipart-design-png-image_8970967.png"
                                    alt="Product"
                                />
                            </div>
                            <div className="p-8 w-full">
                                <div className="flex justify-between items-center">
                                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                        No: {doc.serialNo}
                                    </div>
                                    {(course.instructorCall &&
                                        <Dropdown
                                            menu={{ items: menuItems(doc, handleDelete) }}
                                            trigger={['click']}
                                            placement="bottomRight"
                                        >
                                            <MoreOutlined />
                                        </Dropdown>
                                    )}
                                </div>
                                <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                    {doc.title}
                                </p>
                                <div className="mt-4">
                                    <p className="text-gray-400 fw-bold fs-5 mt-1 mb-7">
                                        {doc?.description?.length > 50 ? (
                                            <Popover content={doc?.description} title="Description">
                                                {doc?.description?.slice(0, 50)}...
                                            </Popover>
                                        ) : (
                                            doc?.description
                                        )}
                                    </p>
                                </div>
                                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                    Duration: {doc.duration}
                                </div>
                                {(!doc?.answer && moment(doc.submissionBefore).isAfter(moment())) && (
                                    <><div className="mt-4">
                                        <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                            Submission Due Date: <Countdown date={doc.submissionBefore} />
                                        </p>
                                    </div>
                                        {course.instructorCall && (
                                            <div className="mt-4">
                                                <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                                    <Button key="submit" type="primary" onClick={() => handleAddQuizQuestions(doc.id)} className="px-6">Add Questions</Button>
                                                </p>
                                            </div>
                                        )}
                                        {!course.instructorCall && (
                                            <div className="mt-4">
                                                <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                                    <Popconfirm title="Are you sure you want to attend right now?" onConfirm={() => handleAttendTest(doc.id)} okText="Yes" cancelText="No">
                                                        <Button key="submit" type="primary" className="px-6">Start Quiz</Button>
                                                    </Popconfirm>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {(doc?.answer) && (
                                    <>
                                        {!course.instructorCall && (
                                            <div className="mt-4">
                                                <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                                    <Button key="submit" type="primary" onClick={() => handleMyQuizResult(doc?.answer)} className="px-6">Your Result</Button>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseQuiz;
