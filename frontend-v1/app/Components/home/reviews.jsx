"use client";

import * as React from "react";

// shadcn/ui components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Dummy data based on the image
const testimonials = [
  {
    quote:
      "The flexibility to learn at my own pace while having access to expert mentorship has been invaluable. It allowed me to upgrade my skills without disrupting my practice.",
    name: "Hellen Jummy",
    title: "Financial Counselor",
    avatarSrc: "/assets/r-icon.jpg",
    avatarFallback: "HJ",
  },
  {
    quote:
      "As an educator, I appreciate how well-structured the courses are. The platform fosters a genuine environment for sharing knowledge and connecting with other professionals.",
    name: "Ralph Edwards",
    title: "Math Teacher",
    avatarSrc: "/assets/8604eac3a133e5565bc0d4b1f4935a0c29d9b29d.jpg",
    avatarFallback: "RE",
  },
  {
    quote:
      "I never felt isolated in my studies. The community forums and interactive study groups helped me understand complex theories through real-time discussion with peers.",
    name: "Hellena John",
    title: "Psychology Student",
    avatarSrc: "/assets/845c0a7e76a09dd9880480e7c59f7385cde7161f.jpg",
    avatarFallback: "HJ",
  },
  {
    quote:
      "The practical, project-based approach helped me apply new management frameworks immediately. It’s rare to find a platform that balances theory and real-world application so well.",
    name: "Markus Lee",
    title: "Product Manager",
    avatarSrc: "/assets/49685ac7b81e766e223bcb38bd406643740bb4b1.jpg",
    avatarFallback: "ML",
  },
]

export function TestimonialCarousel() {
  return (
    <section className="w-full bg-gray-50 dark:bg-gray-950 py-24 px-4 md:px-6">
      <div className="container max-w-6xl mx-auto">
        {/* FIX: The <Carousel> component now wraps both the header 
          and the <CarouselContent> to provide context to the buttons.
        */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          {/* === Header === */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'sans-serif' }}>
              Loved By The Best
            </h2>
            {/* Navigation Buttons (Now correctly inside the Carousel context) */}
            <div className="flex gap-2">
              <CarouselPrevious className="relative static translate-y-0 left-0 right-0 top-0 rounded-full border-gray-800 dark:text-white dark:border-gray-300" />
              <CarouselNext className="relative static translate-y-0 left-0 right-0 top-0 rounded-full border-gray-800 dark:border-gray-300 dark:text-white" />
            </div>
          </div>

          {/* === Carousel Content === */}
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={index}
                className="pt-1 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full shadow-md rounded-2xl">
                    <CardContent className="flex flex-col justify-between flex-grow p-6">
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                        {testimonial.quote}
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={testimonial.avatarSrc}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {/* End of <Carousel> wrapper */}
      </div>
    </section>
  );
}

export default TestimonialCarousel;