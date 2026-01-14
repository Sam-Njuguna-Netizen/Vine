// This is an update for your existing Instructor page.
'use client'
import { useState, useEffect } from 'react'
import { Button, Modal, Form, Input, Select, Table, Space, Popconfirm, Typography, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from '@/app/api/axios'
import { N } from '@/app/utils/notificationService'
import { MyAllCourse as MyInstructorCourses } from '@/app/utils/courseService'

const { Option } = Select
const { Title } = Typography

const InstructorCourseModules = () => {
  // ... (keep all existing state declarations)
  const [modules, setModules] = useState([])
  const [courses, setCourses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [form] = Form.useForm()

  // ... (keep all existing functions: fetchInstructorModules, fetchInstructorCourses, handleDelete)
  useEffect(() => {
    fetchInstructorModules()
    fetchInstructorCourses()
  }, [])

  const fetchInstructorModules = async () => {
    try {
      const response = await axios.get('/api/course-modules')
      setModules(response.data)
    } catch (error) {
      N('Error', 'Failed to fetch your modules', 'error')
    }
  }

  const fetchInstructorCourses = async () => {
    try {
      const response = await MyInstructorCourses()
      if (response.success) {
        setCourses(response.courses)
      }
    } catch (error) {
      N('Error', "Failed to fetch your courses", 'error')
    }
  }
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/course-modules/${id}`)
      N('Success', 'Module deleted successfully', 'success')
      fetchInstructorModules()
    } catch (error) {
      N('Error', 'Failed to delete module', 'error')
    }
  }
  
  // MODIFIED handleOk function
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingModule) {
        await axios.put(`/api/course-modules/${editingModule.id}`, values)
        N('Success', 'Module updated successfully', 'success')
      } else {
        await axios.post('/api/course-modules', values)
        N('Success', 'Module created successfully', 'success')
      }
      setIsModalOpen(false)
      fetchInstructorModules()
    } catch (error) {
      N('Error', 'Failed to save module', 'error')
    }
  }

  const columns = [
    {
      title: 'Module Name',
      dataIndex: 'name',
      key: 'name',
    },
    // Add Price to the table
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${Number(price).toFixed(2)}`
    },
    {
      title: 'Courses Included',
      dataIndex: 'courses',
      key: 'courses',
      render: (courses) => (courses && courses.length > 0 ? courses.map((course) => course.title).join(', ') : 'No courses'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingModule(record)
              form.setFieldsValue({
                ...record,
                course_ids: record.courses.map((c) => c.id),
              })
              setIsModalOpen(true)
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this module?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>My Course Modules</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingModule(null)
          form.resetFields()
          setIsModalOpen(true)
        }}
        style={{ marginBottom: 16 }}
      >
        Add New Module
      </Button>
      <Table columns={columns} dataSource={modules} rowKey="id" />
      <Modal
        title={editingModule ? 'Edit Module' : 'Add Module'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical" name="module_form">
          <Form.Item
            name="name"
            label="Module Name"
            rules={[{ required: true, message: 'Please input the module name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          
          {/* ADDED PRICE INPUT */}
          <Form.Item
            name="price"
            label="Price ($)"
            rules={[{ required: true, message: 'Please set a price for the module!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="course_ids"
            label="Select Your Courses for this Module"
            rules={[{ required: true, message: 'Please select at least one course!' }]}
          >
            <Select mode="multiple" placeholder="Select from your courses">
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default InstructorCourseModules
