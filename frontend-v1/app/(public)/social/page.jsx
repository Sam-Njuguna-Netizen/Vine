"use client";
import SocialLeftSidebar from "./components/SocialLeftSidebar";
import SocialRightSidebar from "./components/SocialRightSidebar";
import MiddleNewsFeed from "./components/MiddleNewsFeed";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function SocialPage() {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const [sort, setSort] = useState("newest");

  return (
    <div className="h-[calc(100vh-7.5rem)] overflow-hidden ">
      {!isMobile ? (
        <main className="mx-auto px-4 max-md:px-0  flex flex-row items-center  gap-x-0 justify-center h-full">
          <SocialLeftSidebar setSort={setSort} currentSort={sort} />
          <MiddleNewsFeed sort={sort} setSort={setSort} />
          <SocialRightSidebar />
        </main>
      ) : (
        <main className="sm:px-2 px-0 mx-auto h-full ">

          <MiddleNewsFeed sort={sort} setSort={setSort} />
          <SocialRightSidebar />

          <SocialLeftSidebar setSort={setSort} currentSort={sort} />
        </main>
      )}
    </div>
  );
}
