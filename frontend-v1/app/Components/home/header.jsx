"use client";

import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function Header() {
  const navItems = [
    { name: "Products", href: "/products" },
    { name: "Solutions", href: "/solutions" },
    { name: "Resources", href: "/resources" },
    { name: "Pricing", href: "/pricing" },
    { name: "About Us", href: "/about-vine" }, // 🔁 renamed label, same route
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-5 md:px-8 lg:px-12 md:py-6">
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        {/* Logo - Reduced size */}
        <Link href="/" className="flex items-center gap-2 text-white pl-2 md:pl-4">
          <img
            src="/assets/Vine-logo.png"
            className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto"
            alt="Vine LMS"
          />
        </Link>

        {/* Desktop Nav - Larger, bolder text */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-9">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className="text-base lg:text-[17px] font-semibold text-gray-100/95 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons (Desktop) - Larger size */}
        <div className="hidden md:flex items-center gap-3 pr-2 md:pr-4">
          {/* Login */}
          <Button
            asChild
            variant="ghost"
            className="px-6 py-3 text-base rounded-full
                       text-white bg-white/5 hover:bg-white/15 border border-white/10
                       shadow-sm transition-colors font-medium"
          >
            <Link href="/login">Login</Link>
          </Button>

          {/* Sign Up */}
          <Button
            asChild
            className="px-6 py-3 text-base rounded-full
                       bg-gradient-to-r from-purple-500 to-pink-500
                       hover:from-purple-400 hover:to-pink-400
                       text-white shadow-md hover:shadow-lg
                       border border-white/20 transition-all font-semibold"
          >
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Nav (Hamburger) - 35px icon */}
        <div className="md:hidden pr-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Open navigation menu"
                variant="ghost"
                className="group text-white bg-transparent hover:bg-transparent
                           p-2 w-auto h-auto focus-visible:ring-0 focus-visible:ring-offset-0
                           [&>svg]:h-[35px] [&>svg]:w-[35px]"
              >
                <Menu
                  strokeWidth={2.4}
                  className="transition-all group-hover:text-violet-200 group-hover:scale-105"
                />
              </Button>
            </SheetTrigger>

            <SheetContent className="bg-[#1a0f30] text-white border-none">
              <nav className="flex flex-col gap-5 mt-8">
                {navItems.map((item) => (
                  <Link
                    href={item.href}
                    key={item.name}
                    className="text-lg font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Buttons – smaller & in one row */}
              <div className="mt-8 flex gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium
                             text-white bg-white/5 hover:bg-white/15 border border-white/10"
                >
                  <Link href="/login" className="w-full text-center">
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 rounded-full px-4 py-2 text-sm font-semibold
                             bg-gradient-to-r from-purple-500 to-pink-500
                             hover:from-purple-400 hover:to-pink-400
                             text-white shadow-md hover:shadow-lg"
                >
                  <Link href="/register" className="w-full text-center">
                    Sign Up
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Header;
