"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Note from "@/components/Note";
import { motion } from "framer-motion";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoaderTest, setShowLoaderTest] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Wait for hydration to complete before rendering to prevent hydration errors
  useEffect(() => {
    // Add a minimum loading time to ensure the loading screen is visible
    const minLoadingTime = setTimeout(() => {
      setIsLoaded(true);
    }, 1000); // Show loading screen for at least 1 second

    // Handle redirect from login page if present
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.pathname === "/login" || url.searchParams.has("action")) {
        // Replace the URL with the homepage without refreshing
        window.history.replaceState({}, document.title, "/");
      }
    }

    // Clean up timeout if component unmounts
    return () => clearTimeout(minLoadingTime);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-6 py-10 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg max-w-md mx-auto"
      >
        <div className="mb-6 relative">
          {/* Logo-like element */}
          <motion.div
            className="w-20 h-20 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center relative z-10"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-500"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </motion.div>

          {/* Animated loading spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-32 h-32 rounded-full border-4 border-transparent border-t-indigo-500 border-b-indigo-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        <motion.h3
          className="text-indigo-600 font-semibold text-xl mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading your notes
        </motion.h3>

        <motion.p
          className="text-gray-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Please wait a moment while we prepare your workspace
        </motion.p>

        {/* Loading dots animation */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-indigo-400 rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (!isLoaded || showLoaderTest) {
    return <LoadingScreen />;
  }

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={handleOverlayClick}
      ></div>

      <main className="main-layout">
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar
            isMobile={isMobile}
            closeSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
        <Note isMobile={isMobile} />
      </main>

      {/* Test button to show loader (only visible in development) */}
      {process.env.NODE_ENV !== "production" && (
        <button
          onClick={() => setShowLoaderTest(!showLoaderTest)}
          className="fixed right-4 bottom-4 bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium shadow-md hover:bg-indigo-600 z-50"
        >
          {showLoaderTest ? "Hide" : "Show"} Loader
        </button>
      )}
    </>
  );
}
