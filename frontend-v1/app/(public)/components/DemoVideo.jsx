import React from "react";
import { motion } from "framer-motion";

const DemoVideo = () => {
  return (
    <div>
      <div className="dark:text-white">Demo Video - Vine</div>
      <motion.div
        className="aspect-video w-full mx-auto bg-black rounded-lg shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <iframe
          class="w-full h-full"
          src="https://www.youtube.com/embed/videoseries?list=PLKbMMrPTOKZRjii_21z9pI4Y1xd6Oa7lu&si=tpvDVT2PcGg5dcvh"
          title="YouTube playlist"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </motion.div>
    </div>
  );
};

export default DemoVideo;
