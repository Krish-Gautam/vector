import Link from "next/link";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[#7fb8ff]">Vector</span>
 
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
            <Link href="/about" className="transition-colors hover:text-white">
              About
            </Link>

            <span className="text-white/20">|</span>

            <Link
              href="/contact"
              className="transition-colors hover:text-white"
            >
              Contact us
            </Link>

            <span className="text-white/20">|</span>

            <Link
              href="/pricing"
              className="transition-colors hover:text-white"
            >
              Pricing
            </Link>

            <span className="text-white/20">|</span>

            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <span className="text-white/20">|</span>

            <Link href="/terms-and-conditions" className="transition-colors hover:text-white">
              Terms and Conditions
            </Link>

            <span className="text-white/20">|</span>

            <Link
              href="/refund-policy"
              className="transition-colors hover:text-white"
            >
              Cancellation and Refund Policy
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="https://www.instagram.com/vector.ai17?igsh=MTdnZHdwZWNtaGNodw=="
              className="rounded-md bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-2 text-white transition-transform hover:scale-110"
            >
              <FaInstagram size={16} />
            </Link>

            <Link
              href="https://x.com/vectorprvt"
              className="rounded-md bg-white/10 p-2 text-white transition-transform hover:scale-110"
            >
              <FaXTwitter size={16} />
            </Link>

            <Link
              href="https://www.linkedin.com/in/krish-gautam-4662b7334/"
              className="rounded-md bg-[#0A66C2] p-2 text-white transition-transform hover:scale-110"
            >
              <FaLinkedinIn size={16} />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-lg italic text-gray-500">
            Copyright © 2026 Moveforward Private Limited | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
