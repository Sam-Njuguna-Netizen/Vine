"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../../Components/home/header";

export default function DemoVideoPage() {
  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="w-full relative z-20">
          <Header />
        </div>
        {/* Background Swirls */}
        <img src="/assets/Vector_32.png" className="bottom-10 absolute z-10" alt="" />

        <div className="min-h-screen bg-gradient-to-r from-[#1E40AF] flex flex-col items-center pt-10 from-0% via-[#701A75] via-50% to-[#1E40AF] to-100%">

          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-[1000px] h-[1000px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>



          {/* Main Content */}
          <main className="container relative mx-auto px-6 py-16 text-center z-20">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              LMS University
            </motion.h1>
            <motion.p
              className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Watch this short video to discover how our powerful features can
              help you create, manage, and grow your online educational
              institution.
            </motion.p>

            {/* Embedded Video */}
            <motion.div
              className="aspect-video max-w-4xl mx-auto bg-black rounded-lg shadow-2xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/playlist?list=PLKbMMrPTOKZRjii_21z9pI4Y1xd6Oa7lu"
                title="Vine LMS – Training Playlist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12"
            >
              <Link href="/login" className="inline-block bg-black text-white font-bold py-4 px-12 rounded-full text-xl hover:bg-gray-800 transition-all duration-300 shadow-lg border border-white/10" >
                Ready to Get Started?
              </Link>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
