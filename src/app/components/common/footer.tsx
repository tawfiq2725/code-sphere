import Link from "next/link";
import {
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Music,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-4 px-6 pt-20">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div className="text-sm text-gray-400">© Code Sphere</div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-gray-400 transition-colors">
            <Youtube className="h-5 w-5" />
            <span className="sr-only">YouTube</span>
          </Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">
            <Music className="h-5 w-5" />
            <span className="sr-only">TikTok</span>
          </Link>
        </div>

        {/* Links */}
        <div className="flex gap-4 text-sm">
          <Link href="#" className="hover:text-gray-400 transition-colors">
            Terms of Use
          </Link>
          <Link href="#" className="hover:text-gray-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
