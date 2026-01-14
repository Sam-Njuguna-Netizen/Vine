'use client';
import {
  } from 'antd';
  import {
    HomeOutlined,
    UserOutlined,
    MessageOutlined,
    TeamOutlined,
    MoreOutlined,
  } from '@ant-design/icons';
  import Link from 'next/link';

export default function MobileNavbar({loadSecondSpace, setCollapsed}) {
  return (
    <div className="flex justify-around p-2">
                  <HomeOutlined onClick={loadSecondSpace} className="text-4xl" />
                  <Link
                    href="/profile"
                    className="flex flex-col items-center"
                    
                  >
                    <UserOutlined className="text-4xl" />
                  </Link>
                  <Link
                    href="/social"
                    className="flex flex-col items-center"
                    
                  >
                    <TeamOutlined className="text-4xl" />
                  </Link>
                  <Link
                    href="/social/messenger"
                    className="flex flex-col items-center"
                    
                  >
                    <MessageOutlined className="text-4xl" />
                  </Link>
                  <div
                    onClick={() => setCollapsed(false)}
                    className="flex flex-col items-center"
                    
                  >
                    <MoreOutlined className="text-4xl" />
                  </div>
                </div>
  );
}
