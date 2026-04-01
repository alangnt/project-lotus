import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { LogIn, X } from "lucide-react";
import { useState } from "react";
import Form from 'next/form';

export default function LoginFormComponent({ setIsLoginWindowDisplayed, handleSwitchAuthWindow }
  : { setIsLoginWindowDisplayed: (value: boolean) => void; handleSwitchAuthWindow: (value: "login" | "signup") => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (data: FormData) => {
    setErrorMessage(null);

    const result = await signIn('credentials', {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });

    if (result?.ok) {
      setIsLoginWindowDisplayed(false);
      setErrorMessage(null);
    } else {
      setErrorMessage("Invalid email or password");
    }
  }

  return (
    <motion.section 
      className="ent-section"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Login</h2>
        <p className="text-xs text-foreground">Login to your account to start tracking your focus time and earn points!</p>
      </div>

      <Form action={(data) => handleLogin(data)} className="flex flex-col items-center justify-center gap-8 grow">
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

        <button type="submit" className="ent-button ent-button_flex">
          <LogIn className="w-4 h-4" /> Login
        </button>
      </Form>

      {errorMessage && <p className={`text-xs text-red-800 dark:text-red-500 font-bold`}>{errorMessage}</p>}
      <p className="ent-link" onClick={() => handleSwitchAuthWindow("signup")}>Don&apos;t have an account? Sign up</p>

      <button className="ent-button" onClick={() => setIsLoginWindowDisplayed(false)}>
        <X className="w-4 h-4" />
      </button>
    </motion.section>
  )
}