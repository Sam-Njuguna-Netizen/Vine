import {
  Book,
  CheckCircle2,
  Settings,
  Users,
  Target,
  BarChart,
  Monitor,
  Sparkles,
} from "lucide-react";

// 1. All feature data from the image is now in this array
const featuresData = [
  {
    icon: Book,
    title: "Comprehensive Course & Content Creation",
    description:
      "Craft dynamic and engaging learning experiences tailored to your students' needs. Create structured online courses with multimedia content, including videos, text, audio, quizzes, assignments, and certificates.",
    features: [
      "Support for video, audio, and interactive quizzes",
      "Drip content and self-paced learning options",
      "Create coaching programs and memberships",
      "Host podcasts and digital downloads",
    ],
  },
  {
    icon: Settings,
    title: "Streamlined School Operations & Management",
    description:
      "Simplify your day-to-day operations with robust tools for managing your school, students, and enrollments all in one place.",
    features: [
      "Easy student onboarding and management",
      "Automated email campaigns and reminders",
      "Track student progress and performance",
      "Integrate with your favorite tools",
    ],
  },
  {
    icon: Users,
    title: "Engaging Learning Community",
    description:
      "Foster a vibrant and interactive community to enhance student engagement, collaboration, and knowledge sharing.",
    features: [
      "Built-in forums and discussion boards",
      "Direct and group messaging",
      "Create student groups and cohorts",
      "Gamification and reward systems",
    ],
  },
  {
    icon: Target,
    title: "Marketing & Enrollment Growth Tools",
    description:
      "Attract more students and grow your enrollments with built-in marketing features designed to convert visitors into paying customers.",
    features: [
      "Build high-converting landing pages",
      "Offer coupons, discounts, and payment plans",
      "Affiliate marketing program management",
      "Sales and conversion tracking",
    ],
  },
  {
    icon: BarChart,
    title: "Powerful Analytics & Progress Reporting",
    description:
      "Gain valuable insights into your school's performance and student progress with comprehensive analytics and detailed reports.",
    features: [
      "Detailed reports on revenue and enrollments",
      "Track course completion rates",
      "Student engagement and activity tracking",
      "Export data for further analysis",
    ],
  },
  {
    icon: Monitor,
    title: "Branded School Website & Mobile Presence",
    description:
      "Create a professional, fully-branded website and offer seamless mobile access to your courses on any device.",
    features: [
      "Customizable website builder",
      "Use your own custom domain",
      "Fully responsive mobile-friendly design",
      "Branded mobile app available",
    ],
  },
  {
    icon: Sparkles,
    title: "Innovative AI-Powered Educator Tools",
    description:
      "Leverage cutting-edge AI to streamline content creation, automate tasks, and enhance the learning experience for your students.",
    features: [
      "AI-powered course and quiz generation",
      "Automated content summarization",
      "Smart suggestions for course improvements",
      "Personalized learning path recommendations",
    ],
  },
];

// 2. InternalCard now accepts a 'data' prop
const InternalCard = ({ data }) => {
  // Destructure the data, using 'Icon' (capitalized) for the component
  const { icon: Icon, title, description, features } = data;

  return (
    <div className="relative z-0 max-w-5xl mx-auto">
      {/* Feature Card */}
      <div className="bg-[#1a1f36] rounded-2xl p-8 md:p-10 w-full max-w-xl shadow-xl">
        {/* Card Icon - Now dynamic */}
        <Icon className="h-10 w-10 text-blue-400 mb-5" strokeWidth={2} />

        {/* Card Heading - Now dynamic */}
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {title}
        </h3>

        {/* Card Description - Now dynamic */}
        <p className="text-gray-300 text-base sm:text-lg mb-6">
          {description}
        </p>

        {/* Feature List - Now dynamic */}
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 3. VineFeatures passes the correct data to each card
export function VineFeatures() {
  return (
    <div className="bg-[#0F172A] space-y-8 relative pt-10 px-20 max-md:px-3">
      <img
        src="/assets/eclipse.png"
        className="h-[600px] absolute top-0 right-0 w-[600px]"
      />
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12">
        Dive Deeper into Vine Features
      </h2>

      <section className=" relative text-white ">
        <InternalCard data={featuresData[0]} />
      </section>
      <section className="flex flex-col md:flex-row relative text-white items-center">
        <img src="/assets/Shapes.png" alt="Shape image" className="pl-5 w-full md:w-1/2 scale-[0.9] hidden md:block" />
        <InternalCard data={featuresData[1]} />
      </section>
      <section className="flex flex-col md:flex-row relative text-white items-center">
        <InternalCard data={featuresData[2]} />
        <img
          src="/assets/Shapes.png"
          alt="Shape image"
          className="pl-5 rotate-270 scale-x-[-1] w-full md:w-1/2 hidden md:block"
        />
      </section>
      <section className="flex flex-col md:flex-row relative text-white items-center">
        <img
          src="/assets/Shapes.png"
          alt="Shape image"
          className="pl-5 rotate-270 w-full md:w-1/2 hidden md:block"
        />
        <InternalCard data={featuresData[3]} />
      </section>
      <section className="flex flex-col md:flex-row relative text-white items-center">
        <InternalCard data={featuresData[4]} />
        <img
          src="/assets/Shapes.png"
          alt="Shape image"
          className="pl-5 rotate-270 scale-x-[-1] w-full md:w-1/2 hidden md:block"
        />
      </section>
      <section className="flex flex-col md:flex-row relative text-white items-center">
        <img
          src="/assets/Shapes.png"
          alt="Shape image"
          className="pl-5 rotate-270 w-full md:w-1/2 hidden md:block"
        />
        <InternalCard data={featuresData[5]} />
      </section>
      {/* Added 7th section for the 7th card */}
      <section className="flex flex-col md:flex-row relative text-white pb-10 items-center">
        <InternalCard data={featuresData[6]} />
        <img
          src="/assets/Shapes.png"
          alt="Shape image"
          className="pl-5 rotate-270 scale-x-[-1] w-full md:w-1/2 hidden md:block"
        />
      </section>
    </div>
  );
}

export default VineFeatures;