"use client";
import { Card, Divider } from "antd";
import { useTheme } from "@/context/ThemeContext";

import Header from "../../Components/home/header";
import Footer from "../../Components/home/footer";

export default function About() {
  const { darkMode } = useTheme();

  return (
    <main className="w-full flex flex-col min-h-screen">
      <div className="bg-[#1a0f30]">
        <Header />
        {/* Spacer for fixed header if needed, but Header is absolute. 
             We need a background for the header area or margin. 
             Let's add a padding top to the main container or a hero-like background behind header.
         */}
        <div className="h-32"></div>
      </div>

      <div
        className={`flex-grow px-0 py-4 sm:px-8 sm:py-8 ${darkMode ? "bg-[#141414]" : "bg-gray-50"
          }`}
      >
        <div className="max-w-4xl mx-auto">
          <Card
            className={`shadow-lg rounded-lg overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
              }`}
          >
            <div className="text-center mb-8">
              <h1
                className={`text-4xl font-bold mb-2 ${darkMode ? "text-purple-400" : "text-purple-700"
                  }`}
              >
                About Us
              </h1>
              <Divider
                className={`${darkMode ? "bg-purple-700" : "bg-purple-200"}`}
              />
              <p
                className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                Transforming lives through faith, education, and community
                empowerment
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 ${darkMode ? "text-purple-300" : "text-purple-800"
                    }`}
                >
                  Our Mission
                </h2>
                <p
                  className={`leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-700"
                    }`}
                >
                  Welcome to Vine, your number one source for all things online.
                  We're dedicated to providing you with the best through our
                  Training Curriculums, Online School, Social Media connectivity
                  etc., with a focus on quality, customer service, and uniqueness.
                </p>
              </div>

              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 ${darkMode ? "text-purple-300" : "text-purple-800"
                    }`}
                >
                  Our Purpose
                </h2>
                <p
                  className={`leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-700"
                    }`}
                >
                  Our purpose is simple: We aim to provide quality service and
                  excellence support that allows you to achieve your intended
                  goals and purpose. We are here to train, equip and empower
                  communities by building people.
                </p>
              </div>

              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 ${darkMode ? "text-purple-300" : "text-purple-800"
                    }`}
                >
                  Our Commitment
                </h2>
                <p
                  className={`leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-700"
                    }`}
                >
                  We hope you enjoy all we have to offer as much as we enjoy
                  offering them to you. If you have any questions or comments,
                  please dont hesitate to contact us at info@vinelms.com
                </p>
              </div>
            </div>

            <Divider
              className={`${darkMode ? "bg-purple-700" : "bg-purple-200"} my-8`}
            />

            <div className="text-center">
              <p className={` ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Sincerely
              </p>
              <p
                className={`text-xl font-medium ${darkMode ? "text-purple-400" : "text-purple-700"
                  }`}
              >
                The Vine Team
              </p>
            </div>
          </Card>

          {/* Optional decorative elements */}
          <div className="flex justify-center space-x-4 mt-8">
            <div
              className={`w-12 h-1 rounded-full ${darkMode ? "bg-purple-600" : "bg-purple-300"
                }`}
            ></div>
            <div
              className={`w-12 h-1 rounded-full ${darkMode ? "bg-purple-400" : "bg-purple-500"
                }`}
            ></div>
            <div
              className={`w-12 h-1 rounded-full ${darkMode ? "bg-purple-600" : "bg-purple-300"
                }`}
            ></div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
