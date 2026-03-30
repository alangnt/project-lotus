import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { LogIn, X } from "lucide-react";
import { ChangeEvent, SubmitEvent, useState } from "react";

export default function SignUpFormComponent({ setIsSignUpWindowDisplayed, handleSwitchAuthWindow }
  : { setIsSignUpWindowDisplayed: (value: boolean) => void; handleSwitchAuthWindow: (value: "login" | "signup") => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formDataSignup, setFormDataSignup] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleFormChangeSignUp = (e: ChangeEvent<HTMLInputElement>) => {
    setFormDataSignup({ ...formDataSignup, [e.target.name]: e.target.value });
  }

  const handlePasswordNoMatch = () => {
    setErrorMessage("Passwords do not match");
    
    setTimeout(() => {
        setErrorMessage(null);
    }, 3000);
  }

  const handleSignup = async (e: SubmitEvent) => {
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
                  setIsSignUpWindowDisplayed(false);
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

  return (
    <motion.section 
      className="flex flex-col items-center justify-between gap-4 bg-foreground/10 backdrop-blur-lg rounded-lg p-6 h-120 w-87.5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-bold">Sign Up</h2>

      <form className="flex flex-col items-center justify-center gap-4 grow" onSubmit={handleSignup}>
        <input type="text" placeholder="Username" name="username" value={formDataSignup.username} onChange={handleFormChangeSignUp} className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
        <input type="email" placeholder="Email" name="email" value={formDataSignup.email} onChange={handleFormChangeSignUp} className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
        <input type="password" placeholder="Password" name="password" value={formDataSignup.password} onChange={handleFormChangeSignUp} className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
        <input type="password" placeholder="Confirm Password" name="confirmPassword" value={formDataSignup.confirmPassword} onChange={handleFormChangeSignUp} className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" required/>
        <button type="submit" className="flex items-center justify-center gap-2 bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200">
          <LogIn className="w-4 h-4" /> Sign Up
        </button>
      </form>

      {errorMessage && <p className={`text-xs text-red-800 dark:text-red-500 font-bold`}>Passwords do not match</p>}
      <p className="text-xs text-white hover:underline transition-all duration-200 cursor-pointer" onClick={() => handleSwitchAuthWindow("login")}>Already have an account? Login</p>

      <button className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200" onClick={() => setIsSignUpWindowDisplayed(false)}><X /></button>
    </motion.section>
  )
}