import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4">
                            WE ARE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">GS SPORTS</span>
                        </h1>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                            Empowering cricketers with world-class gear to chase their dreams.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* MISSION & VISION */}
            <div className="py-20 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-blue-50 p-10 rounded-3xl border border-blue-100"
                >
                    <h2 className="text-3xl font-black text-blue-900 mb-6 uppercase">Our Mission</h2>
                    <p className="text-lg text-blue-800 leading-relaxed">
                        To make professional-grade cricket equipment accessible to every aspiring player. We believe that talent should never be limited by the quality of gear. We strive to provide the best tools for the modern game.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-indigo-50 p-10 rounded-3xl border border-indigo-100"
                >
                    <h2 className="text-3xl font-black text-indigo-900 mb-6 uppercase">Our Vision</h2>
                    <p className="text-lg text-indigo-800 leading-relaxed">
                        To become the most trusted name in cricket retail globally, fostering a community of passionate players who live and breathe the sport. We aim to inspire the next generation of cricketing legends.
                    </p>
                </motion.div>
            </div>

            {/* WHY CHOOSE US */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">WHY CHOOSE US?</h2>
                        <p className="text-gray-500 text-lg">The GS Sports Advantage</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Premium Quality", desc: "Hand-picked gear from top manufacturers." },
                            { title: "Expert Support", desc: "Advice from former state-level players." },
                            { title: "Fast Delivery", desc: "Express shipping across the country." },
                            { title: "Best Prices", desc: "Competitive pricing without compromising quality." },
                            { title: "Secure Payment", desc: "100% safe and encrypted transactions." },
                            { title: "Easy Returns", desc: "Hassle-free 7-day return policy." },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <CheckCircleIcon className="w-10 h-10 text-green-500 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
