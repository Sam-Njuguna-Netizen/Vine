'use client';

import MiddleNewsFeed from "@/app/(public)/social/components/MiddleNewsFeed";
import LeftSidebar from "@/app/(public)/social/components/LeftSidebar";
import RigntSidebar from "@/app/(public)/social/components/RigntSidebar";
import { useSelector, useDispatch } from "react-redux";

import { useState } from "react";

const ProfileOverview = (user) => {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const [sort, setSort] = useState('newest');

  return (
    <div>
      {!isMobile ?
        <main className="container mx-auto mt-6 px-4 flex flex-col md:flex-row">
          {/* <LeftSidebar /> */}
          <MiddleNewsFeed user={user} sort={sort} setSort={setSort} />
          {/* <RigntSidebar /> */}
        </main>
        :
        <main>
          {/* <LeftSidebar /> */}
          {/* <RigntSidebar /> */}
          <MiddleNewsFeed user={user} sort={sort} setSort={setSort} />
        </main>
      }
    </div>
  );
};

export default ProfileOverview;
