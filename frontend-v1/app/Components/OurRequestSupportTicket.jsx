"use client";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Table, Space, Modal, Select, Popconfirm, Switch, Grid, Tag } from "antd";
import Highlighter from "react-highlight-words";
import axios from '@/app/api/axios';
import moment from 'moment';
import { N } from "@/app/utils/notificationService";
import Link from 'next/link';

const { useBreakpoint } = Grid;

export default function OurRequestSupportTicket({chatLink}) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const allPriority = useSelector((state) => state.auth.priority);
  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  useEffect(() => {
    getAllTickets();
  }, []);

  const getAllTickets = async () => {
    try {
      const response = await axios.get('/api/allMyTicket');
      if (response.status === 200) {
        setTickets(response.data.ticket);
      }
    } catch (error) {
      N("Error", "Failed to fetch tickets", "error");
    }
  };

  const getPriorityName = (priorityId) => {
    const priority = allPriority.find(p => p.id === priorityId);
    return priority ? priority.name : 'Unknown';
  };

  const getPriorityColor = (priorityId) => {
    switch(priorityId) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'orange';
      case 4: return 'red';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'orange';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'blue';
    }
  };

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
      <div onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 w-full"
          style={{ fontSize: isMobile ? '16px' : '14px' }}
        />
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} 
            icon={<SearchOutlined />} 
            size="small"
            style={{ fontSize: isMobile ? '16px' : '14px' }}
          >
            Search
          </Button>
          <Button 
            onClick={() => clearFilters && handleReset(clearFilters)} 
            size="small"
            style={{ fontSize: isMobile ? '16px' : '14px' }}
          >
            Reset
          </Button>
          <Button 
            type="link" 
            size="small" 
            onClick={() => close()}
            style={{ fontSize: isMobile ? '16px' : '14px' }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter 
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} 
          searchWords={[searchText]} 
          autoEscape 
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        <span style={{ fontSize: isMobile ? '16px' : '14px' }}>{text}</span>
      ),
  });

  const mobileColumns = [
    {
      key: 'mobileView',
      render: (record) => (
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
          <Link href={`${chatLink}${record.id}`}>
          <span className="text-blue-600 hover:underline" style={{ fontSize: '16px' }}>
            {record.subject}
          </span>
        </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Tag color={getPriorityColor(record.priority)}>
              {getPriorityName(record.priority)}
            </Tag>
            <Tag color={getStatusColor(record.status)}>
              {record.status}
            </Tag>
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            { record.lastMessageAt ? 
             <span>Last Message At: {moment(record.lastMessageAt).format('MMM D, YYYY, h:mm A')} </span> 
             : <span className="text-gray-500 italic">No message</span> }
          </div>
          {/* <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              size="middle"
              style={{ fontSize: '14px' }}
            >
              Edit
            </Button>
            <Popconfirm 
              title="Are you sure you want to delete this ticket?" 
              onConfirm={() => handleDelete(record.id)} 
              okText="Yes" 
              cancelText="No"
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />}
                size="middle"
                style={{ fontSize: '14px' }}
              >
                Delete
              </Button>
            </Popconfirm>
          </div> */}
        </div>
      ),
    },
  ];

  const desktopColumns = [
    // {
    //   title: <span style={{ fontSize: '16px' }}>ID</span>,
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: 80,
    //   sorter: (a, b) => a.id - b.id,
    // },
    {
      title: <span style={{ fontSize: '16px' }}>Subject</span>,
      dataIndex: 'subject',
      key: 'subject',
      ...getColumnSearchProps('subject'),
    },    
    {
      title: <span style={{ fontSize: '16px' }}>Priority</span>,
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityName(priority)}
        </Tag>
      ),
      filters: allPriority.map(p => ({ text: p.name, value: p.id })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: <span style={{ fontSize: '16px' }}>Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Closed', value: 'closed' },
        { text: 'Open', value: 'open' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: <span style={{ fontSize: '16px' }}>Last Message At</span>,
      dataIndex: 'lastMessageAt',
      key: 'lastMessageAt',
      render: (date) =>
        date && date !== ""
          ? moment(date).format('MMM D, YYYY, h:mm A')
          : <span className="text-gray-500 italic">No message</span>,
      sorter: (a, b) => new Date(a.lastMessageAt) - new Date(b.lastMessageAt),
    },    
    {
      title: <span style={{ fontSize: '16px' }}>Action</span>,
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Link href={`${chatLink}${record.id}`}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            // onClick={() => handleEdit(record)}
            style={{ fontSize: '14px' }}
          >
            View
          </Button>
          </Link>
          {/* <Popconfirm 
            title="Are you sure you want to delete this ticket?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Yes" 
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              style={{ fontSize: '14px' }}
            >
              Delete
            </Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState(2);

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setSubject(ticket.subject);
    setPriority(ticket.priority);
    setOpenTicketModal(true);
  };

  const resetModal = () => {
    setOpenTicketModal(false);
    setEditingTicket(null);
    setSubject("");
    setPriority(2);
  };

  const handleDelete = async (ticketId) => {
    try {
      const response = await axios.delete(`/api/ticket/${ticketId}`);
      if (response.status === 200) {
        getAllTickets();
        N("Success", "Ticket deleted successfully!", "success");
      }
    } catch (error) {
      N("Error", "Failed to delete ticket", "error");
    }
  };

  const handleSaveTicket = async () => {
    if (!subject || !priority) {
      N("Error", "All fields are required!", "error");
      return;
    }

    try {
      const payload = { subject, priority };
      let response;
      
      if (editingTicket) {
        response = await axios.put(`/api/ticket/${editingTicket.id}`, payload);
      } else {
        response = await axios.post('/api/ticket', payload);
      }

      if (response.status === 200) {
        getAllTickets();
        resetModal();
        N("Success", `Ticket ${editingTicket ? 'updated' : 'created'} successfully!`, "success");
      }
    } catch (error) {
      N("Error", error.response?.data?.message || "Failed to save ticket", "error");
    }
  };

  return (
    <div className="rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <p className="text-2xl font-semibold" style={{ fontSize: isMobile ? '20px' : '24px' }}>Support Tickets</p>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size={isMobile ? 'middle' : 'large'} 
          onClick={() => setOpenTicketModal(true)}
          style={{ fontSize: isMobile ? '14px' : '16px' }}
        >
          New Ticket
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table 
          columns={isMobile ? mobileColumns : desktopColumns} 
          dataSource={tickets} 
          loading={tickets.length === 0} 
          pagination={{ pageSize: 10 }}
          scroll={isMobile ? undefined : { x: true }}
          size={isMobile ? 'large' : 'middle'}
          className="ticket-management-table"
          rowKey="id"
        />
      </div>

      <Modal
        title={<span style={{ fontSize: isMobile ? '18px' : '20px' }}>{editingTicket ? "Edit Ticket" : "New Ticket"}</span>}
        open={openTicketModal}
        onOk={handleSaveTicket}
        onCancel={resetModal}
        footer={[
          <Button 
            key="cancel" 
            onClick={resetModal}
            style={{ fontSize: isMobile ? '14px' : '16px' }}
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSaveTicket}
            style={{ fontSize: isMobile ? '14px' : '16px' }}
          >
            {editingTicket ? "Update" : "Create"} Ticket
          </Button>,
        ]}
        width={isMobile ? '90%' : '50%'}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1 font-medium">Subject</label>
            <Input 
              placeholder="Ticket subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              style={{ fontSize: isMobile ? '16px' : '14px' }}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Priority</label>
            <Select 
              value={priority} 
              onChange={setPriority} 
              options={allPriority.map(p => ({ label: p.name, value: p.id }))} 
              style={{ width: '100%', fontSize: isMobile ? '16px' : '14px' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}