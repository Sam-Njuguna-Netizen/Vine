// components/FloatingAvatar.jsx
import Image from 'next/image';
// app/page.jsx (or a new component, e.g., components/HeroSection.jsx)
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FloatingAvatar = ({ src, size, className }) => {
  return (
    <div
      className={`absolute rounded-full overflow-hidden ${size} ${className}`}
      style={{
        boxShadow: '0 0 0 2px rgba(255,255,255,0.3), 0 0 0 4px rgba(255,255,255,0.2)'
      }}
    >
      <Image src={src} alt="Avatar" layout="fill" objectFit="cover" />
    </div>
  );
};

// components/FloatingIcon.jsx
const FloatingIcon = ({ children, className }) => {
  return (
    <div className={`absolute text-white text-opacity-50 ${className}`}>
      {children}
    </div>
  );
};



// This is a simple SVG icon for demonstration.
// In a real app, you might use an icon library like Lucide React.
const BoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M21 8V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v3" />
    <path d="M19 14h-6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z" />
    <rect x="3" y="10" width="7" height="12" rx="2" ry="2" />
  </svg>
);

const CloudIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M17.5 19H18a3 3 0 0 0 0-6h-.5a5 5 0 0 0-10-2H5a3 3 0 0 0 0 6h.5" />
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M18.66 10.33A8.995 8.995 0 0 0 13 2a9 9 0 0 0-9 9c0 4.19 2.53 7.85 6.3 9.38L12 22l2.7-1.62A8.995 8.995 0 0 0 18.66 10.33z" />
    <path d="M14 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
  </svg>
);

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M21 12V7H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v4h-5" />
    <path d="M15 16h2a2 2 0 0 0 2-2V7M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const WebsiteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="20" x2="22" y2="20" />
    <line x1="10" y1="7" x2="14" y2="7" />
    <line x1="12" y1="17" x2="12" y2="20" />
  </svg>
);

const CursorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M4 4l6.242 16.632l2.427-7.283l7.283-2.427L4 4z" />
  </svg>
);


export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r   flex-col justify-center text-center pt-32 from-0% via-[#701A75] via-50% to-[#1E40AF] to-100% relative flex min-h-screen items-center  overflow-hidden  from-[#4D00B8] to-[#9C3FE4] p-4 text-white">
      {/* Floating Avatars */}
      <FloatingAvatar src="/avatars/img1.jpg" size="w-[6em] h-[6em]" className="max-md:hidden top-1/2 left-[17vw] scale-100" />
      <FloatingAvatar src="/avatars/img2.jpg" size="w-16 h-16" className="max-md:hidden top-1/4 left-[20vw] scale-90" />
      <FloatingAvatar src="/avatars/img3.jpg" size="w-20 h-20" className="max-md:hidden top-1/2 left-10 scale-110" />
      <FloatingAvatar src="/avatars/img4.jpg" size="w-10 h-10" className="max-md:hidden top-1/4 left-10 scale-110" />
      <FloatingAvatar src="/avatars/img5.jpg" size="w-5 h-5" className="max-md:hidden bottom-[2.6em] left-10 scale-110" />

      <FloatingAvatar src="/avatars/img_ (1).jpg" size="w-[6em] h-[6em]" className="max-md:hidden top-1/2 right-[17vw] scale-100" />
      <FloatingAvatar src="/avatars/img_ (2).jpg" size="w-16 h-16" className="max-md:hidden top-1/4 right-[20vw] scale-90" />
      <FloatingAvatar src="/avatars/img_ (3).jpg" size="w-20 h-20" className="max-md:hidden top-1/2 right-10 scale-110" />
      <FloatingAvatar src="/avatars/img_ (4).jpg" size="w-10 h-10" className="max-md:hidden top-1/4 right-10 scale-110" />
      <FloatingAvatar src="/avatars/img_ (5).jpg" size="w-5 h-5" className="max-md:hidden bottom-[2.6em] right-10 scale-110" />




      {/* Floating Icons */}
      <FloatingIcon className="max-md:hidden top-1/4 left-1/4 translate-x-[-50%] opacity-40 text-3xl">B</FloatingIcon>
      <FloatingIcon className="max-md:hidden top-1/4 left-[30%] translate-x-[-50%] opacity-40">
        <BoxIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden bottom-1/4 left-[20%] translate-x-[-50%] opacity-40">
        <BoxIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden top-1/4 right-[20%] translate-x-[50%] opacity-40">
        <CloudIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden bottom-1/3 right-[10%] translate-x-[50%] opacity-40">
        <WalletIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden top-1/2 right-[5%] translate-x-[50%] opacity-40">
        <WalletIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden bottom-1/4 right-[25%] translate-x-[50%] opacity-40">
        <ShoppingCartIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden bottom-[20%] left-[45%] translate-x-[-50%] opacity-40">
        <WebsiteIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden top-[30%] right-[40%] opacity-40">
        <CursorIcon />
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden top-[25%] left-[10%] opacity-30 text-5xl transform -rotate-12">
        <span className="max-md:hidden text-sm">B</span>
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden top-[50%] left-[15%] opacity-30 text-4xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="max-md:hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.664 12l2-2m0 0l2 2m-2-2v8m0-8a9 9 0 110 18A9 9 0 0112 3zm0 0c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z" />
        </svg>
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden bottom-[10%] left-[5%] opacity-30 text-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="max-md:hidden h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z" />
        </svg>
      </FloatingIcon>
      <FloatingIcon className="max-md:hidden top-[5%] right-[2%] opacity-30 text-3xl">
        <BellIcon />
      </FloatingIcon>


      {/* Main Content */}
      <div className="relative z-20 space-y-5 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl  font-bold leading-tight mb-4 max-w-5xl">
          Join thousands and build your Platform on <span>Vine</span> today
        </h1>
        <p className="mb-8 max-w-xl text-lg opacity-80">
          Empowering minds and shaping futures through accessible education.
        </p>
        <Button asChild className="rounded-full px-6 py-4  text-lg font-semibold bg-black hover:bg-gray-800 transition-colors duration-200">
          <Link href="/register" className="dark:text-white">Sign Up Now</Link>
        </Button>
      </div>
    </div>
  );
}