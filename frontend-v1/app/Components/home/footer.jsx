import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  // MapPin,   // ⛔️ no longer needed (address removed)
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-gray-100 pt-16 pb-8 border-t border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid – left-aligned on mobile, same 4-column layout on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 md:gap-x-10 lg:gap-x-14 gap-y-12 mb-12 justify-items-start text-left">
          {/* Company Info */}
          <div className="space-y-5 md:space-y-4 md:pr-10 lg:pr-16">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Vine LMS
            </h3>
            <p className="text-gray-300 text-[15px] leading-relaxed max-w-xs">
              Empowering schools to deliver world-class online education with
              AI-driven tools and{" "}
              <span className="whitespace-nowrap">seamless management</span>.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/products", label: "Products" },
                { href: "/solutions", label: "Solutions" },
                { href: "/resources", label: "Resources" },
                { href: "/pricing", label: "Pricing" },
                { href: "/about-vine", label: "About Us" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-purple-300 text-[15px] transition-all duration-200 inline-block hover:-translate-y-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/support"
                  className="text-gray-300 hover:text-purple-300 text-[15px] transition-all duration-200 inline-block hover:-translate-y-0.5"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-purple-300 text-[15px] transition-all duration-200 inline-block hover:-translate-y-0.5"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-300 hover:text-purple-300 text-[15px] transition-all duration-200 inline-block hover:-translate-y-0.5"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-gray-300 hover:text-purple-300 text-[15px] transition-all duration-200 inline-block hover:-translate-y-0.5"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/user-agreement"
                  className="text-gray-300 hover:text-purple-300 text-[15px] transition-all duration-200 inline-block hover:-translate-y-0.5"
                >
                  User Agreement
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info + Socials (address removed, left-aligned on all breakpoints) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-4 text-gray-300 text-[15px]">
              {/* Address removed to avoid hard-coding – client can manage location in their own contact/settings flow */}

              <li className="flex items-center justify-start space-x-3 group">
                <Phone
                  size={18}
                  className="flex-shrink-0 text-purple-400 group-hover:text-purple-300 transition-colors"
                />
                <a
                  href="tel:+19513942214"
                  className="hover:text-purple-300 transition-colors duration-200"
                >
                  +(951) 394-2214
                </a>
              </li>
              <li className="flex items-center justify-start space-x-3 group">
                <Mail
                  size={18}
                  className="flex-shrink-0 text-purple-400 group-hover:text-purple-300 transition-colors"
                />
                <a
                  href="mailto:support@vinelms.com"
                  className="hover:text-purple-300 transition-colors duration-200"
                >
                  support@vinelms.com
                </a>
              </li>
            </ul>

            {/* Social Icons under Contact Us, left-aligned on mobile too */}
            <div className="flex justify-start space-x-4 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61586065085321&mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group relative inline-flex"
              >
                <span className="absolute inset-0 rounded-full bg-blue-500/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Facebook
                  size={20}
                  className="relative text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300"
                />
              </a>

              <a
                href="https://x.com/vine_lms"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="group relative inline-flex"
              >
                <span className="absolute inset-0 rounded-full bg-sky-500/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Twitter
                  size={20}
                  className="relative text-gray-400 group-hover:text-sky-400 group-hover:scale-110 transition-all duration-300"
                />
              </a>

              <a
                href="https://www.instagram.com/vine_lms?igsh=MWdtdDJocXY0eGdsZQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group relative inline-flex"
              >
                <span className="absolute inset-0 rounded-full bg-pink-500/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Instagram
                  size={20}
                  className="relative text-gray-400 group-hover:text-pink-400 group-hover:scale-110 transition-all duration-300"
                />
              </a>

              <a
                href="https://linkedin.com/in/vine-lms-8832583a5/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="group relative inline-flex"
              >
                <span className="absolute inset-0 rounded-full bg-blue-600/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Linkedin
                  size={20}
                  className="relative text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Divider with subtle gradient accent */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 h-0.5 w-28 rounded-full" />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-xs sm:text-sm">
            &copy; 2025 Vine LMS. All rights reserved.
          </p>
          <p className="text-gray-500 text-[11px] sm:text-xs">
            Made with 💜 for educators worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
