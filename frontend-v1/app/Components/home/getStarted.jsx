"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Data for the steps. This makes the component clean and easy to update.
const stepsData = [
  {
    step: 1,
    title: "Sign Up for Free",
    description: "Create your school's account in minutes and choose between our monthly and yearly subscriptions. Let our robust LMS platform fulfill your vision for education.",
    features: [
      "Instant account setup",
      "Access to all features during subscription",
      "Guided onboarding process",
      "Student accounts are free",
    ],
    color: "bg-purple-600",
  },
  {
    step: 2,
    title: "Build & Customize",
    description: "Use our intuitive drag-and-drop tools to create courses, design your school website, and import existing content effortlessly.",
    features: [
      "No coding skills needed",
      "Customizable templates",
      "Import content from other platforms",
    ],
    color: "bg-orange-500", // Using orange as it appears in the image
  },
  {
    step: 3,
    title: "Launch & Engage",
    description: "Invite students, launch your courses, and foster a thriving online learning community with built-in engagement tools.",
    features: [
      "Automated student invitations",
      "Real-time engagement analytics",
      "Community-building features",
    ],
    color: "bg-purple-600",
  },
  {
    step: 4, // The 4th step mentioned in the title
    title: "Analyze & Improve",
    description: "Track student progress with powerful analytics, gather feedback, and continuously improve your educational offerings.",
    features: [
      "Detailed student reporting",
      "Course feedback mechanisms",
      "Integration with analytics tools",
    ],
    color: "bg-blue-600", // Using a different color for the 4th step
  },
];

function GetStartedSteps() {
  return (
    <section className="w-full py-16 md:py-24 px-4 bg-gray-50 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Get Started in 4 Simple Steps
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true, // Set to true if you want it to loop
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {stepsData.map((step) => (
              <CarouselItem
                key={step.step}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Card className="shadow-lg min-h-[27em] rounded-[4em] border-none bg-white dark:bg-slate-900">
                    <CardContent className="flex flex-col  items-center text-center p-8 pt-10 h-full">
                      <div
                        className={`w-14 h-14 rounded-full shadow-md ${step.color} text-white flex items-center justify-center text-2xl font-bold mb-6`}
                      >
                        {step.step}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground dark:text-slate-400 text-sm mb-6 min-h-[100px]">
                        {step.description}
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground dark:text-slate-400 text-left list-disc list-inside">
                        {step.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Custom styled arrows to match the image */}
          <CarouselPrevious className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-slate-800 text-white border-none w-10 h-10 rounded-full hover:bg-gray-800 dark:hover:bg-slate-700" />
          <CarouselNext className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-slate-800 text-white border-none w-10 h-10 rounded-full hover:bg-gray-800 dark:hover:bg-slate-700" />
        </Carousel>

        <div className="flex justify-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-gray-900 dark:bg-indigo-600 text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-gray-800 dark:hover:bg-indigo-700"
          >
            <Link href="/register">Register Institution</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default GetStartedSteps;