'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Layout } from 'antd';


import "../../../globals.css";
import { useRouter } from 'next/navigation';
import { useDispatch } from "react-redux";
import { getAuthUser } from '@/app/utils/auth';
import { setAuthUser } from '@/app/store';


const SocialLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyUser = async () => {
      const authUser = await getAuthUser();
      if (authUser && authUser.success) {
        dispatch(setAuthUser(authUser.user))
      }
      else {
        router.push('/login');
      }
    };
    verifyUser();
  }, [router]);



  return (
    <div className="bg-gray-100">
      {/* Content will go here */}
      <header className="bg-[#C106FE] text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-4">SocialConnect</h1>
            <div className="hidden md:block">
              <input type="text" placeholder="Search" className="bg-white text-black px-3 py-1 rounded-full" />
            </div>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/social" className="hover:bg-[#19A463] px-3 py-2 rounded-full"><i className="fas fa-home" /><span className="hidden md:inline ml-2">Home</span></Link></li>
              <li><a href="#" className="hover:bg-[#19A463] px-3 py-2 rounded-full"><i className="fas fa-user-friends" /><span className="hidden md:inline ml-2">Friends</span></a></li>
              <li><Link href="/social/messenger" className="hover:bg-[#19A463] px-3 py-2 rounded-full"><i className="fas fa-users" /><span className="hidden md:inline ml-2">Messenger</span></Link></li>
              <li><a href="#" className="hover:bg-[#19A463] px-3 py-2 rounded-full"><i className="fas fa-bell" /><span className="hidden md:inline ml-2">Notifications</span></a></li>
              <li><a href="#" className="hover:bg-[#19A463] px-3 py-2 rounded-full"><i className="fas fa-user-circle" /><span className="hidden md:inline ml-2">Profile</span></a></li>
            </ul>
          </nav>
        </div>
      </header>
      {children}
      <footer className=" mt-6 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <ul className="flex justify-center space-x-4">
            <li><a href="#" className="hover:text-blue-600">About</a></li>
            <li><a href="#" className="hover:text-blue-600">Help</a></li>
            <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
            <li><a href="#" className="hover:text-blue-600">Terms</a></li>
          </ul>
          <p className="mt-2">© {new Date().getFullYear()} Vine LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>

  );
};

export default SocialLayout;
