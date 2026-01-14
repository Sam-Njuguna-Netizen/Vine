import React from "react";
import Link from "next/link";
import {
  TreePine,
  Menu,
  Book,
  Settings,
  Check,
  CircleUser,
  Users,
  Megaphone,
  BarChart,
  MonitorSmartphone,
  Sparkles,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import GetStartedSteps from './home/getStarted'
import { EfficientCollaboration } from './home/effective-collaboration'
import { FrequentlyAskedQuestions } from './home/frequently-asked'
import { TestimonialCarousel } from './home/reviews'
import HeroSection from './home/join-section'
import Footer from './home/footer'
import { VineFeatures } from './home/sections'
import Header from './home/header'
// ============== 1. Header & Hero Section ==============
// (From image_484325.png)

function VineHeroSection() {
  const logos = ["Astrom", "cicio", "weavy", "vRockets", "viewio"];

  return (
    <section className="relative w-full min-h-screen  overflow-hidden ">
      {/* Background Swirls */}
      <img src="/assets/Vector_32.png" className="bottom-10 absolute z-10" alt="" />

      <div className="bg-gradient-to-r from-[#1E40AF] rounded-br-[300px]  rounded-bl-[200px] flex flex-col items-center justify-center text-center pt-32 from-0% via-[#701A75] via-50% to-[#1E40AF] to-100%">

        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/2 left-1/4 w-[1000px] h-[1000px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />

        <div className="container relative mx-auto px-4 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl mx-auto">
            Revolutionize Education with Vine
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto">
            The ultimate AI-powered platform to create, manage, and scale
            your school's online learning ecosystem with unparalleled ease
            and innovation.
          </p>
          {/* <div className="mt-10">
            <Button size="lg" className="bg-black rounded-full text-white px-8 py-6 text-lg font-semibold hover:bg-gray-800">
              <Link href="/demo-video">
                Watch a Demo
              </Link>
            </Button>
          </div> */}
          <div className="sticky border-[2px] rounded-xl border-black bottom-0 mt-16 md:mt-24 max-w-[80%] max-md:w-[90%] mx-auto">
            <img src="/assets/dash.jpg" className="overflow-hidden object-contain h-full w-full mx-auto rounded-xl" alt="" />
          </div>

        </div>
      </div>
    </section>
  );
}

// ============== 2. Features Section ==============
// (From image_484386.png, populated by old data)

const FeatureCheckItem = ({ text }) => (
  <li className="flex items-center gap-3">
    <div className="flex-shrink-0 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
      <Check className="w-3 h-3 text-green-400" />
    </div>
    <span className="text-gray-300">{text}</span>
  </li>
);

// Helper to map old feature titles to new icons
const featureIcons = {
  default: Book,
  "Comprehensive Course & Content Creation": Book,
  "Streamlined School Operations & Management": Settings,
  "Engaging Learning Communities": Users,
  "Marketing & Enrollment Growth Tools": Megaphone,
  "Powerful Analytics & Progress Insights": BarChart,
  "Branded School Website & Mobile Presence": MonitorSmartphone,
  "Innovative AI-Powered Educator Tools": Sparkles,
};

export function VineFeaturesSection({ features }) {
  return (
    <section className="relative w-full py-16 md:py-32 bg-white text-black overflow-hidden">
      {/* Abstract line art from image */}
      <div className="absolute top-1/2 left-0 w-1/3 h-1/2 opacity-30">
        <div className="absolute bottom-0 left-[-10rem] w-64 h-64 border-l-8 border-t-8 border-purple-500 rounded-tl-full"></div>
        <div className="absolute bottom-0 left-[-10rem] w-52 h-52 border-l-8 border-t-8 border-yellow-500 rounded-tl-full"></div>
      </div>
      <div className="absolute top-1/4 right-0 w-1/3 h-1/2 opacity-30">
        <div className="absolute top-0 right-[-10rem] w-64 h-64 border-r-8 border-b-8 border-purple-500 rounded-br-full"></div>
        <div className="absolute top-0 right-[-10rem] w-52 h-52 border-r-8 border-b-8 border-yellow-500 rounded-br-full"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Dive Deeper into Vine Features
        </h2>

        {/* Using .slice(0, 2) to match the design from the image */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.slice(0, 2).map((feature) => {
            const Icon = featureIcons[feature.title] || featureIcons.default;
            return (
              <div key={feature.title} className="relative bg-[#1E123A] p-8 md:p-10 rounded-2xl border border-white/10 shadow-xl z-10">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-6">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.details.map((detail) => (
                    <FeatureCheckItem key={detail} text={detail} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============== 3. Get Started Section ==============
// (From image_484344.png, populated by old data)

export function VineGetStartedSection({ steps }) {
  const stepColors = ["bg-purple-500", "bg-yellow-500", "bg-purple-500", "bg-green-500"];

  return (
    <section className="w-full py-16 md:py-32 bg-white text-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          Get Started in 4 Simple Steps
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {steps.map((step, index) => (
              // The image only shows 3, but the title says 4. 
              // Mapping all 4 from your data.
              <CarouselItem key={index} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-xl h-full">
                    <div className={`w-16 h-16 rounded-full ${stepColors[index % 4]} flex items-center justify-center text-white text-3xl font-bold mb-6`}>
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-900">{step.step}</h3>
                    <p className="text-gray-600 mb-6 flex-grow">{step.description}</p>
                    <ul className="space-y-2 text-left text-gray-700 w-full">
                      {step.details.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2 hidden sm:inline-flex" />
          <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2 hidden sm:inline-flex" />
        </Carousel>

        <div className="text-center mt-16">
          <Button asChild size="lg" className="bg-black text-white px-8 py-6 text-lg font-semibold hover:bg-gray-800">
            <Link href="/login?institution=true">Register Institution</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============== 4. Collaboration Section ==============
// (From image_484362.png)

export function VineCollaborationSection() {
  return (
    <section className="w-full py-16 md:py-32 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image Column */}
          <div className="relative h-[450px] md:h-[550px]">
            <div className="absolute top-10 left-0 grid grid-cols-7 gap-1 opacity-50">
              {Array.from({ length: 49 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              ))}
            </div>
            <div className="absolute top-0 left-16 w-3/4 h-3/5 bg-yellow-300 rounded-3xl transform -rotate-6"></div>
            <div className="absolute top-10 left-0 w-64 bg-white p-4 rounded-xl shadow-xl z-20">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                Popular
              </span>
              <h4 className="font-semibold text-gray-900 mb-1">
                Design for how people think
              </h4>
            </div>
            <div className="absolute bottom-0 left-4 w-1/2 h-2/3 bg-gray-300 rounded-2xl shadow-lg z-10 flex items-center justify-center text-gray-500">

            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3/4 h-3/5 bg-gray-300 rounded-2xl shadow-2xl z-30 p-4 flex flex-col justify-between">
              <div className="w-full h-full flex items-center justify-center text-gray-500">

              </div>
              <div className="flex -space-x-2 mt-2">
                <CircleUser className="w-8 h-8 rounded-full bg-gray-400 text-white border-2 border-white" />
                <CircleUser className="w-8 h-8 rounded-full bg-gray-400 text-white border-2 border-white" />
                <CircleUser className="w-8 h-8 rounded-full bg-gray-400 text-white border-2 border-white" />
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Efficient collaboration
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Foster a vibrant and interactive community to enhance student engagement, collaboration, and knowledge sharing</p>
          </div>

        </div>
      </div>
    </section>
  );
}


// ============== Main Page Component ==============
// This component now assembles the page using the data.

export default function LandingPage() {

  // --- Data copied from your old file ---
  const features = [
    {
      title: "Comprehensive Course & Content Creation",
      description: "Craft dynamic and engaging learning experiences tailored to your students’ needs. Create structured online courses with multimedia content, including videos, text, audio, quizzes, assignments, and certificates.",
      details: [
        "Support for video, audio, and interactive quizzes",
        "Drip content and self-paced learning options",
        "Create coaching programs and memberships",
        "Host podcasts and digital downloads",
      ],
    },
    {
      title: "Streamlined School Operations & Management",
      description: "Simplify your administrative tasks with an all-in-one platform. Manage student data, automate communications, and process payments seamlessly.",
      details: [
        "Integrated CRM with tagging and segmentation",
        "Flexible subscriptions and payment plans",
        "Automate emails and notifications",
        "Zapier and direct third-party integrations",
      ],
    },
    {
      title: "Engaging Learning Communities",
      description: "Build a vibrant online campus where students and faculty can connect, collaborate, and share knowledge.",
      details: [
        "Built-in forums and discussion rooms",
        "Host live events and webinars",
        "Encourage peer-to-peer collaboration",
        "Customizable community spaces",
      ],
    },
    {
      title: "Marketing & Enrollment Growth Tools",
      description: "Attract and convert prospective students with powerful marketing tools designed to boost enrollment.",
      details: [
        "Email marketing with automated sequences",
        "High-converting sales funnels",
        "Coupons and promotional tools",
        "SEO-optimized landing pages",
      ],
    },
    {
      title: "Powerful Analytics & Progress Insights",
      description: "Make informed decisions with detailed analytics on student progress, course performance, and revenue.",
      details: [
        "Track course completion and engagement",
        "Monitor marketing campaign performance",
        "Analyze revenue streams",
        "Customizable reporting dashboards",
      ],
    },
    {
      title: "Branded School Website & Mobile Presence",
      description: "Showcase your institution with a professional website and optional mobile app for on-the-go learning.",
      details: [
        "Drag-and-drop website builder",
        "Custom domain and blog integration",
        "Branded mobile app option",
        "Responsive design for all devices",
      ],
    },
    {
      title: "Innovative AI-Powered Educator Tools",
      description: "Enhance teaching efficiency with AI-driven tools that streamline content creation and marketing.",
      details: [
        "AI-generated course outlines",
        "Automated marketing copy creation",
        "Content repurposing tools",
        "Personalized student recommendations",
      ],
    },
  ];

  const steps = [
    {
      step: "Sign Up for Free",
      description: "Create your school’s account in minutes and choose between our monthly and yearly subscriptions. Let our robust LMS platform fulfill your vision for education.",
      details: [
        "Instant account setup",
        "Access to all features during subscription",
        "Guided onboarding process",
        "Student accounts are free",
      ],
    },
    {
      step: "Build & Customize",
      description: "Use our intuitive drag-and-drop tools to create courses, design your school website, and import existing content effortlessly.",
      details: [
        "No coding skills needed",
        "Customizable templates",
        "Import content from other platforms",
      ],
    },
    {
      step: "Launch & Engage",
      description: "Invite students, launch your courses, and foster a thriving online learning community with built-in engagement tools.",
      details: [
        "Automated student invitations",
        "Real-time engagement analytics",
        "Community-building features",
      ],
    },
    {
      step: "Manage & Grow",
      description: "Utilize our comprehensive dashboard to monitor your school’s progress, analyze student engagement, and implement strategies for growth.",
      details: [
        "Track course performance with detailed analytics",
        "Engage students with quizzes, and certificates",
        "Integrate marketing tools to expand your reach",
      ],
    },
  ];
  // --- End of data ---

  return (
    <>
      <main className="w-full">
        <VineHeroSection />
        <GetStartedSteps />
        <EfficientCollaboration />
        <VineFeatures />
        <FrequentlyAskedQuestions />
        <TestimonialCarousel />
        <HeroSection />
        <Footer />
        {/* <VineFeaturesSection features={features} />
        <VineGetStartedSection steps={steps} />
        <VineCollaborationSection /> */}
        {/* All other sections (FAQ, Footer, etc.) are omitted as requested */}
      </main>
    </>
  );
}