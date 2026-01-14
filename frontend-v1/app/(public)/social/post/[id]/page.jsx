'use client';
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import { useParams } from "next/navigation";
import PostShow from "@/app/(public)/social/components/PostShow";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true); // Ensure client-side rendering
  }, []);

  useEffect(() => {
    if (client && id) {
      fetchPost();
    }
  }, [client, id]);

  async function fetchPost() {
    if (!id) return;
    try {
      const res = await axios.get(`/api/posts/${id}`);
      if (res.data) {
        setPost(res.data);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return <PostShow post={post} />;
}
