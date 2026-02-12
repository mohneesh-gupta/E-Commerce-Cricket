import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaGooglePay
} from "react-icons/fa";
import { GiCricketBat } from "react-icons/gi"; // Using a cricket specific icon if available in react-icons/gi

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, url: "https://facebook.com", color: "hover:text-blue-600" },
    { icon: <FaTwitter />, url: "https://twitter.com", color: "hover:text-sky-400" },
    { icon: <FaInstagram />, url: "https://instagram.com", color: "hover:text-pink-600" },
    { icon: <FaLinkedinIn />, url: "https://linkedin.com", color: "hover:text-blue-700" },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Shop All", path: "/products" },
    { name: "Trophies", path: "/trophies" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const customerService = [
    { name: "FAQ", path: "/faq" },
    { name: "Shipping Policy", path: "/shipping" },
    { name: "Returns & Exchanges", path: "/returns" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                <GiCricketBat className="text-2xl text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">GS<span className="text-blue-500"> Sports</span></span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm max-w-sm">
              Your premier destination for professional cricket equipment & sports trophies. We provide world-class gear for champions at every level. Elevate your game with GS Sports.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className={`bg-gray-800 p-3 rounded-full text-gray-400 hover:bg-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 ${social.color}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group text-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Categories
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products/category/bats" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Cricket Bats
                </Link>
              </li>
              <li>
                <Link to="/products/category/protective" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Protective Gear
                </Link>
              </li>
              <li>
                <Link to="/products/category/balls" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Cricket Balls
                </Link>
              </li>
              <li>
                <Link to="/products/category/trophies" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Trophies
                </Link>
              </li>
              <li>
                <Link to="/products/category/clothing" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Clothing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-sm">
                <FaMapMarkerAlt className="text-blue-500 text-lg mt-1 shrink-0" />
                <span className="text-gray-400">123 Cricket Avenue, Sports Complex,<br />Mumbai, India 400001</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FaPhoneAlt className="text-blue-500 shrink-0" />
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FaEnvelope className="text-blue-500 shrink-0" />
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">support@gssports.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} GS Sports. All rights reserved. Designed with <span className="text-red-500">❤</span> for Cricket Lovers.
            </p>
            <div className="flex items-center gap-3 text-2xl text-gray-500">
              <FaCcVisa className="hover:text-white transition-colors" />
              <FaCcMastercard className="hover:text-white transition-colors" />
              <FaCcPaypal className="hover:text-white transition-colors" />
              <FaGooglePay className="hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
