// frontend-v1/config/resources.js

// Central config for the Resource Hub.
// We will use this both on the public Resources page
// and (later) inside Settings so everything stays in sync.

export const RESOURCE_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Core videos and documents to help new students and instructors understand how Vine LMS works.",
    // we will wire this to the YouTube playlist the client sent
    youtubePlaylistUrl:
      "https://youtube.com/playlist?list=PLKbMMrPTOKZRjii_21z9pl4Y1xd6Oa7lu&si=K1bf04_gwGPqlp0a",
  },
  {
    id: "student-guides",
    title: "Student Guides",
    description:
      "Step-by-step guides, PDFs, and resources for students using Vine LMS.",
  },
  {
    id: "instructor-guides",
    title: "Instructor Guides",
    description:
      "Resources for instructors on creating courses, assignments, and managing classes.",
  },
  {
    id: "admin-resources",
    title: "Admin Resources",
    description:
      "Configuration, onboarding docs, and policies for school admins.",
  },
];
