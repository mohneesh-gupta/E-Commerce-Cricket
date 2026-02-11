import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon
} from "@heroicons/react/24/solid";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setError("");
      setLoading(true);
      const res = await register(email, password);
      if (res.success) {
        navigate("/");
      } else {
        setError(res.error);
      }
    } catch {
      setError("Failed to create an account");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black relative overflow-hidden flex items-center justify-center p-4 py-6">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -ml-48 -mt-48 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -mr-48 -mb-48 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding/Information */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-full">
              <SparklesIcon className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">Join The Elite</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-[0.9] tracking-tighter">
              START YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">JOURNEY.</span>
            </h1>

            <p className="text-lg text-gray-400 font-medium max-w-md leading-relaxed">
              Create your account to unlock exclusive access to premium cricket gear, early releases, and join a community of passionate players.
            </p>

            <div className="space-y-3 pt-4">
              {[
                { icon: <TrophyIcon className="w-5 h-5" />, text: "Exclusive Member Deals" },
                { icon: <ShieldCheckIcon className="w-5 h-5" />, text: "Secure Account Protection" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-500">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Create Account</h2>
              <p className="text-gray-400 font-medium text-sm">Start your journey with premium cricket gear</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 font-bold text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                  Email Address
                </label>
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-sm"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                  Password
                </label>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                  Confirm Password
                </label>
                <div className="relative group">
                  <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${password.length > i * 2 + 2
                          ? password.length >= 8
                            ? "bg-green-500"
                            : password.length >= 6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          : "bg-white/10"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {password.length < 6 && "Password too short"}
                    {password.length >= 6 && password.length < 8 && "Password is okay"}
                    {password.length >= 8 && "Strong password"}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:bg-blue-700 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-4 font-medium">
              By creating an account, you agree to our{" "}
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>
            </p>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-4 text-gray-500 font-black tracking-widest">Or</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-400 font-medium text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-black uppercase tracking-wider text-sm transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-300 font-bold text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
