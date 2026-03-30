"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";

import { motion, AnimatePresence } from "motion/react";

import { Sun, Moon, Play, RotateCcw, Pause, LogIn } from "lucide-react";

// Import TanStack Query hooks
import { useUser, useAddPoints } from "./hooks/useUser";
import LoginFormComponent from "@/components/auth/LoginForm";
import SignUpFormComponent from "@/components/auth/SignUpForm";
import ProfileWindowComponent from "@/components/ProfileWindow";

export default function Home() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('light');
  const bell = useRef<HTMLAudioElement | null>(null);

  const { data: session, status } = useSession();
  const authenticated = status === "authenticated" && !!session?.user;
  
  // TanStack Query hooks - replaces manual fetch + useState pattern
  const { 
    data: user, 
    isLoading: userLoading,
    error: userError 
  } = useUser(authenticated ? session?.user?.id as number : undefined);
  
  const addPointsMutation = useAddPoints();

  const [loginWindow, setLoginWindow] = useState(false);
  const [signupWindow, setSignupWindow] = useState(false);
  const [profileWindow, setProfileWindow] = useState(false);

  useEffect(() => {
    bell.current = new Audio('/sounds/bell.wav');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Simplified handlePoints using TanStack Query mutation
  const handlePoints = useCallback(async () => {
    if (authenticated && session?.user?.id) {
      addPointsMutation.mutate({ 
        userId: session.user.id as number, 
        points: 100 
      });
    } else {
      setLoginWindow(true);
    }
  }, [authenticated, session?.user?.id, addPointsMutation]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          bell.current?.play();
          handlePoints();
          handleReset();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, handlePoints]);

  const handleCountdown = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setMinutes(25);
    setSeconds(0);
    setIsRunning(false);
  };

  const handleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Persist theme to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const handleSwitchAuthWindow = (target: "login" | "signup") => {
    setLoginWindow(target === "login" ? true : false);
    setSignupWindow(target === "login" ? false: true);
  }

  return (
    <div className={`flex flex-col min-h-screen bg-background`}>
      <header className="flex justify-center items-center text-white p-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <div className="flex items-center justify-center text-foreground hover:text-yellow-500 dark:hover:text-blue-500 gap-2 hover:bg-gray-200 transition-all duration-300 rounded-full py-1 px-4 cursor-pointer" onClick={handleTheme}>
            <h1 className="text-2xl font-bold">Project Lotus</h1>
            {theme === "light" ? <Sun className="w-min h-min" /> : <Moon className="w-min h-min" />}
          </div>
        </motion.div>
      </header>

      <main className="grow max-sm:flex-col flex items-center justify-center relative max-md:gap-4 gap-6 max-sm:my-12">
        <AnimatePresence mode="wait">
          {profileWindow && (
            <ProfileWindowComponent user={user!} setIsProfileWindowDisplayed={setProfileWindow}></ProfileWindowComponent>
          )}
        </AnimatePresence>

        <motion.section 
          className="flex flex-col items-center justify-center gap-4 bg-foreground/10 backdrop-blur-lg rounded-lg p-6 h-120 w-87.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {authenticated ? (
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold">Welcome back, <span className={`cursor-pointer underline transition-all duration-200 ${theme === "light" ? "hover:text-yellow-500" : "hover:text-blue-500"}`} onClick={() => setProfileWindow(true)}>{user?.username}</span> ! <span className="text-xs text-white/80 hover:underline cursor-pointer" onClick={() => signOut()}>Logout</span></p>
            </div>
          ) : (
            <button className="flex gap-2 items-center justify-center self-end bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200" onClick={() => setLoginWindow(true)}>
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}

          <div className="flex items-center justify-center text-[5rem] font-bold cursor-default">
            <span>{minutes.toString().padStart(2, '0')}</span>:<span>{seconds.toString().padStart(2, '0')}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            {isRunning ? (
              <button className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200" onClick={handleCountdown}><Pause /></button>
            ) : (
              <button className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200" onClick={handleCountdown}><Play /></button>
            )}
            <button className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200" onClick={handleReset}><RotateCcw /></button>
          </div>

          <EmbeddedVideo />

          <p className="text-xs text-white">Focus for 25 minutes, then take a short break!</p>
        </motion.section>

        <AnimatePresence>
          {loginWindow && (
            <LoginFormComponent setIsLoginWindowDisplayed={setLoginWindow} handleSwitchAuthWindow={handleSwitchAuthWindow}></LoginFormComponent>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {signupWindow && (
            <SignUpFormComponent setIsSignUpWindowDisplayed={setSignupWindow} handleSwitchAuthWindow={handleSwitchAuthWindow}></SignUpFormComponent>
          )}
        </AnimatePresence>
      </main>

      <motion.footer 
        className="flex justify-center items-center px-4 py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      >
        <p className="text-sm text-white">© 2026 Project Lotus</p>
      </motion.footer>
    </div>
  );
}

function EmbeddedVideo() {
  return (
    <div>  
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/jfKfPfyJRdk?si=V1yUG-F9Ra1iD2AC&autoplay=1&mute=1" 
        title="lofi hip hop radio - beats to relax/study to" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share, muted, playsinline" 
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen
        className="rounded-lg"
      >
      </iframe>
    </div>
  );
}