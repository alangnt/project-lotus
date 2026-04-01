import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { User } from "@/app/hooks/useUser";
import Form from "next/form";

export default function ProfileWindowComponent({ user, setIsProfileWindowDisplayed }
  : { user: User; setIsProfileWindowDisplayed: (value: boolean) => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUpdateUser = async (data: FormData) => {
    setIsSubmitting(true);

    console.log(data.get("avatarUrl"));

    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        body: data
      });

      if (response.ok) {
        setEditProfile(false);
        window.location.reload();
      } else {
        const result = await response.json();
        console.warn('Error editing your profile:', result.error);
        setErrorMessage(result.error);
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Failed to update user: ", error);
      setErrorMessage("An error has occured. Please try again later");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      key={editProfile ? "edit-profile" : "view-profile"}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {editProfile ? (
        <section className="ent-section">
          <Form action={(data) => handleUpdateUser(data)} className="flex flex-col items-center justify-between gap-8 grow">
            <div className="flex flex-col items-center justify-center gap-2">
              <Image src={user?.avatar_url || "img/user-round.svg"} alt="Profile" width={75} height={75} className="rounded-full"/>
              <input type="file" accept="image/*" name="avatarUrl" className="ent-input text-sm cursor-pointer" />
            </div>  

            <div className="flex flex-col items-center justify-center gap-6 grow">
                <input type="text" placeholder="First Name" name="firstName" defaultValue={user.first_name} className="ent-input" />
                <input type="text" placeholder="Last Name" name="lastName" defaultValue={user.last_name} className="ent-input" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button type="submit" disabled={isSubmitting} className="ent-button disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditProfile(false)} className="ent-button">Cancel</button>
            </div>
          </Form>
        </section>
      ) : (
        <section className="ent-section gap-12!">
          <div className="ent-button" onClick={() => setEditProfile(true)}>
            <Pencil className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-center justify-center w-full gap-4 grow">
            <div className="flex flex-col items-center justify-center">
              <Image src={user?.avatar_url || "img/user-round.svg"} alt="Profile" width={75} height={75} className="rounded-full"/>
            </div>
              
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold">{user?.username}</h3>
              <p className="text-lg font-light">{user?.points} points</p>
            </div>      

            <div className="flex flex-col items-start justify-start gap-2 mt-8">
              <p>First Name: <span>{user?.first_name || "Not set"}</span></p>
              <p>Last Name: <span>{user?.last_name || "Not set"}</span></p>
            </div>
          </div>

          <button className="ent-button" onClick={() => setIsProfileWindowDisplayed(false)}><X /></button>
        </section>
      )}
    </motion.div>
  )
}