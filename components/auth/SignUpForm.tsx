import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { LogIn, X } from "lucide-react";
import { useState } from "react";
import Form from "next/form";

export default function SignUpFormComponent({ setIsSignUpWindowDisplayed, handleSwitchAuthWindow }
  : { setIsSignUpWindowDisplayed: (value: boolean) => void; handleSwitchAuthWindow: (value: "login" | "signup") => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async (data: FormData) => {
    setErrorMessage(null);

    const formData = {
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
      confirmPassword: data.get("confirmPassword")
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
  
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
    
        if (result?.ok) {
          setIsSignUpWindowDisplayed(false);
        }
      } else {
        const result = await response.json();
        console.warn('Error signing up:', result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage("An error has occured. Please try again later");
    }
  };

  return (
    <motion.section 
      className="ent-section"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-bold">Sign Up</h2>

      <Form action={(data) => handleSignup(data)} className="flex flex-col items-center justify-center gap-4 grow">
        <input 
          type="text" 
          placeholder="Username" 
          name="username" 
          className="ent-input" 
          required
        />
        <input 
          type="email" 
          placeholder="Email" 
          name="email" 
          className="ent-input" 
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          name="password" 
          className="ent-input" 
          required
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          name="confirmPassword" 
          className="ent-input" 
          required
        />

        <button type="submit" className="ent-button ent-button_background ent-button_flex text-sm">
          <LogIn className="w-3 h-3" /> Sign Up
        </button>
      </Form>

      {errorMessage && <p className={`text-xs text-red-500 font-bold`}>{errorMessage}</p>}
      <p className="ent-link" onClick={() => handleSwitchAuthWindow("login")}>Already have an account? Login</p>

      <button className="ent-button" onClick={() => setIsSignUpWindowDisplayed(false)}>
        <X className="w-4 h-4" />
      </button>
    </motion.section>
  )
}