"use client";

import Image from "next/image";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";

import { motion, AnimatePresence } from "motion/react";

import { Sun, Moon, Play, RotateCcw, Pause, LogIn, X, Pencil } from "lucide-react";

// Import TanStack Query hooks
import { useUser, useUpdateUser, useAddPoints, User } from "./hooks/useUser";

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
  
  const updateUserMutation = useUpdateUser();
  const addPointsMutation = useAddPoints();

  const [loginWindow, setLoginWindow] = useState(false);
  const [signupWindow, setSignupWindow] = useState(false);
  const [profileWindow, setProfileWindow] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  const [formDataLogin, setFormDataLogin] = useState({
    email: "",
    password: "",
  });

  const [formDataSignup, setFormDataSignup] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formDataUpdateUser, setFormDataUpdateUser] = useState({
    first_name: "",
    last_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    bell.current = new Audio('/sounds/bell.wav');
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
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

  const handleSwitchToSignup = () => {
    setLoginWindow(false);
    setSignupWindow(true);
  };

  const handleSwitchToLogin = () => {
    setLoginWindow(true);
    setSignupWindow(false);
  };

  const handleFormChangeSignUp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataSignup({ ...formDataSignup, [e.target.name]: e.target.value });
  }

  const handleFormChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataLogin({ ...formDataLogin, [e.target.name]: e.target.value });
  }

  const handleFormChangeUpdateUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataUpdateUser({ ...formDataUpdateUser, [e.target.name]: e.target.value });
  }

  const handlePasswordNoMatch = () => {
    setNoMatch(true);
    
    setTimeout(() => {
        setNoMatch(false);
    }, 3000);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn('credentials', {
        email: formDataLogin.email,
        password: formDataLogin.password,
        redirect: false,
    });

    if (result?.ok) {
        setLoginWindow(false);
    } else {
      setErrorMessage(true);

      setTimeout(() => {
        setErrorMessage(false);
      }, 3000);
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

      if (formDataSignup.password !== formDataSignup.confirmPassword) {
          handlePasswordNoMatch();
          return;
      }
    
      try {
          const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username: formDataSignup.username,
                email: formDataSignup.email,
                password: formDataSignup.password,
                confirmPassword: formDataSignup.confirmPassword,
              })
          });
  
          if (response.ok) {
              const result = await signIn('credentials', {
                username: formDataSignup.username,
                email: formDataSignup.email,
                password: formDataSignup.password,
                redirect: false,
              });
          
              if (result?.ok) {
                  setSignupWindow(false);
              }

              const data = await response.json();

              const { email, username } = data;
              setFormDataSignup({ ...formDataSignup, email, username });
          } else {
              const errorData = await response.json();
              console.error('Error signing up:', errorData.message);
          }
        } catch (error) {
        console.error('Error signing up:', error);
      }
  };

  // Simplified handleUpdateUser using TanStack Query mutation
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', user?.username || '');
    formData.append('first_name', formDataUpdateUser.first_name);
    formData.append('last_name', formDataUpdateUser.last_name);

    const fileInput = document.getElementById('avatar') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('avatar_url', fileInput.files[0]);
    }

    updateUserMutation.mutate(formData, {
      onSuccess: () => {
        setEditProfile(false);
      },
      onError: (error) => {
        console.error('Error updating user:', error);
      },
    });
  };

  return (
    <div className={`flex flex-col min-h-screen dark:bg-black`}>
       <header className="flex justify-center items-center text-white p-2">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center hover:text-yellow-500 dark:hover:text-blue-500 gap-2 hover:bg-gray-200 transition-all duration-300 rounded-full py-1 px-4 cursor-pointer" onClick={handleTheme}>
              <h1 className="text-2xl font-bold">Project Lotus</h1>
              {theme === "light" ? <Sun className="w-min h-min" /> : <Moon className="w-min h-min" />}
            </div>
          </motion.div>
      </header>

      <main className="grow max-sm:flex-col flex items-center justify-center relative max-md:gap-4 gap-6 max-sm:my-12">
        <AnimatePresence mode="wait">
          {profileWindow && (
            <motion.div
              key={editProfile ? "edit-profile" : "view-profile"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {editProfile ? (
                <section className="flex flex-col items-center justify-between gap-8 bg-white/10 backdrop-blur-lg rounded-lg p-6 h-[480px] w-[350px]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Image src={user?.avatar_url || "img/user-round.svg"} alt="Profile" width={75} height={75} className="rounded-full"/>
                    <input id="avatar" type="file" accept="image/*" onChange={handleFormChangeUpdateUser} name="avatar_url" className="w-full rounded-lg bg-white/10 backdrop-blur-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer" />
                  </div>   

                  <form onSubmit={handleUpdateUser} className="flex flex-col items-center justify-between gap-8 grow">
                    <div className="flex flex-col items-center justify-center gap-6 grow">
                        <input type="text" placeholder="First Name" name="first_name" value={formDataUpdateUser.first_name} onChange={handleFormChangeUpdateUser} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" />
                        <input type="text" placeholder="Last Name" name="last_name" value={formDataUpdateUser.last_name} onChange={handleFormChangeUpdateUser} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" />
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button type="submit" disabled={updateUserMutation.isPending} className="bg-white/10 backdrop-blur-lg rounded-lg py-2 px-4 hover:bg-white/20 hover:scale-105 transition-all duration-200 disabled:opacity-50">
                        {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setEditProfile(false)} className="bg-white/10 backdrop-blur-lg rounded-lg py-2 px-4 hover:bg-white/20 hover:scale-105 transition-all duration-200">Cancel</button>
                    </div>
                  </form>
                </section>
              ) : (
                <section className="flex flex-col items-center justify-between gap-12 bg-white/10 backdrop-blur-lg rounded-lg p-6 h-[480px] w-[350px]">
                  <div className="flex flex-col items-center justify-center w-full gap-4">
                      <div className="flex items-center justify-end self-end bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer" onClick={() => setEditProfile(true)}>
                        <Pencil className="w-4 h-4" />
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <Image src={user?.avatar_url || "img/user-round.svg"} alt="Profile" width={75} height={75} className="rounded-full"/>
                      </div>
                        
                      <div className="flex flex-col items-center justify-center">
                        <h3 className="text-xl font-bold">{user?.username}</h3>
                        <p className="text-lg text-white/80">{user?.points} points</p>
                      </div>      
                  </div>
                  
                  <div className="flex flex-col items-start justify-start gap-2 grow w-full">
                      <p>First Name: <span className="text-white/80">{user?.first_name || "Not set"}</span></p>
                      <p>Last Name: <span className="text-white/80">{user?.last_name || "Not set"}</span></p>
                  </div>

                  <button className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={() => setProfileWindow(false)}><X /></button>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section 
          className="flex flex-col items-center justify-center gap-4 bg-background/10 dark:bg-foreground/10 backdrop-blur-lg rounded-lg p-6 h-[480px] w-[350px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {authenticated ? (
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold">Welcome back, <span className={`cursor-pointer underline transition-all duration-200 ${theme === "light" ? "hover:text-yellow-500" : "hover:text-blue-500"}`} onClick={() => setProfileWindow(true)}>{user?.username}</span> ! <span className="text-xs text-white/80 hover:underline cursor-pointer" onClick={() => signOut()}>Logout</span></p>
            </div>
          ) : (
            <button className="flex gap-2 items-center justify-center self-end bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={() => setLoginWindow(true)}>
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}

          <div className="flex items-center justify-center text-[5rem] font-bold cursor-default">
            <span>{minutes.toString().padStart(2, '0')}</span>:<span>{seconds.toString().padStart(2, '0')}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            {isRunning ? (
              <button className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={handleCountdown}><Pause /></button>
            ) : (
              <button className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={handleCountdown}><Play /></button>
            )}
            <button className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={handleReset}><RotateCcw /></button>
          </div>

          <EmbeddedVideo />

          <p className="text-xs text-white">Focus for 25 minutes, then take a short break!</p>
        </motion.section>

        <AnimatePresence>
          {loginWindow && (
            <motion.section 
              className="flex flex-col items-center justify-between gap-4 bg-white/10 backdrop-blur-lg rounded-lg p-6 h-[480px] w-[350px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold">Login</h2>
                <p className="text-xs text-white">Login to your account to start tracking your focus time and earn points!</p>
              </div>

              <form className="flex flex-col items-center justify-center gap-8 grow" onSubmit={handleLogin}>
                <input type="email" placeholder="Email" name="email" value={formDataLogin.email} onChange={handleFormChangeLogin} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
                <input type="password" placeholder="Password" name="password" value={formDataLogin.password} onChange={handleFormChangeLogin} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
                <button type="submit" className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200">
                  <LogIn className="w-4 h-4" /> Login
                </button>
              </form>

              {errorMessage && <p className={`text-xs ${theme === "light" ? "text-red-800" : "text-red-500"} font-bold`}>Invalid email or password</p>}
              <p className="text-xs text-white hover:underline transition-all duration-200 cursor-pointer" onClick={handleSwitchToSignup}>Don&apos;t have an account? Sign up</p>

              <button className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={() => setLoginWindow(false)}><X /></button>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {signupWindow && (
            <motion.section 
              className="flex flex-col items-center justify-between gap-4 bg-white/10 backdrop-blur-lg rounded-lg p-6 h-[480px] w-[350px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-2xl font-bold">Sign Up</h2>

              <form className="flex flex-col items-center justify-center gap-4 grow" onSubmit={handleSignup}>
                <input type="text" placeholder="Username" name="username" value={formDataSignup.username} onChange={handleFormChangeSignUp} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
                <input type="email" placeholder="Email" name="email" value={formDataSignup.email} onChange={handleFormChangeSignUp} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
                <input type="password" placeholder="Password" name="password" value={formDataSignup.password} onChange={handleFormChangeSignUp} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
                <input type="password" placeholder="Confirm Password" name="confirmPassword" value={formDataSignup.confirmPassword} onChange={handleFormChangeSignUp} className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
                <button type="submit" className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200">
                  <LogIn className="w-4 h-4" /> Sign Up
                </button>
              </form>

              {noMatch && <p className={`text-xs ${theme === "light" ? "text-red-800" : "text-red-500"} font-bold`}>Passwords do not match</p>}
              <p className="text-xs text-white hover:underline transition-all duration-200 cursor-pointer" onClick={handleSwitchToLogin}>Already have an account? Login</p>

              <button className="bg-white/10 backdrop-blur-lg rounded-lg p-2 hover:bg-white/20 hover:scale-105 transition-all duration-200" onClick={() => setSignupWindow(false)}><X /></button>
            </motion.section>
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