import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { LogIn, X } from "lucide-react";
import { ChangeEvent, SubmitEvent, useState } from "react";

export default function LoginFormComponent({ setIsLoginWindowDisplayed, handleSwitchAuthWindow }
  : { setIsLoginWindowDisplayed: (value: boolean) => void; handleSwitchAuthWindow: (value: "login" | "signup") => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formDataLogin, setFormDataLogin] = useState({
    email: "",
    password: "",
  });

  const handleFormChangeLogin = (e: ChangeEvent<HTMLInputElement>) => {
    setFormDataLogin({ ...formDataLogin, [e.target.name]: e.target.value });
  }

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    const result = await signIn('credentials', {
        email: formDataLogin.email,
        password: formDataLogin.password,
        redirect: false,
    });

    if (result?.ok) {
        setIsLoginWindowDisplayed(false);
    } else {
      setErrorMessage("Invalid email or password");

      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  }

  return (
    <motion.section 
      className="flex flex-col items-center justify-between gap-4 bg-foreground/10 text-foreground backdrop-blur-lg rounded-lg p-6 h-120 w-87.5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Login</h2>
        <p className="text-xs text-foreground">Login to your account to start tracking your focus time and earn points!</p>
      </div>

      <form className="flex flex-col items-center justify-center gap-8 grow" onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          name="email" 
          value={formDataLogin.email} 
          onChange={handleFormChangeLogin} 
          className="ent-input" 
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          name="password" 
          value={formDataLogin.password} 
          onChange={handleFormChangeLogin} 
          className="ent-input" 
          required
        />
        <button type="submit" className="ent-button ent-button_flex">
          <LogIn className="w-4 h-4" /> Login
        </button>
      </form>

      {errorMessage && <p className={`text-xs text-red-800 dark:text-red-500 font-bold`}>Invalid email or password</p>}
      <p className="ent-link" onClick={() => handleSwitchAuthWindow("signup")}>Don&apos;t have an account? Sign up</p>

      <button className="ent-button" onClick={() => setIsLoginWindowDisplayed(false)}>
        <X className="w-4 h-4" />
      </button>
    </motion.section>
  )
}