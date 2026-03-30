import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { User, useUpdateUser } from "@/app/hooks/useUser";

export default function ProfileWindowComponent({ user, setIsProfileWindowDisplayed }
  : { user: User; setIsProfileWindowDisplayed: (value: boolean) => void }) {
  const [editProfile, setEditProfile] = useState<boolean>(false);

  const updateUserMutation = useUpdateUser();

  const [formDataUpdateUser, setFormDataUpdateUser] = useState({
    first_name: "",
    last_name: "",
    avatar_url: "",
  });

  const handleFormChangeUpdateUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataUpdateUser({ ...formDataUpdateUser, [e.target.name]: e.target.value });
  }

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
    <motion.div
      key={editProfile ? "edit-profile" : "view-profile"}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {editProfile ? (
        <section className="flex flex-col items-center justify-between gap-8 bg-foreground/10 backdrop-blur-lg rounded-lg p-6 h-120 w-87.5">
          <div className="flex flex-col items-center justify-center gap-2">
            <Image src={user?.avatar_url || "img/user-round.svg"} alt="Profile" width={75} height={75} className="rounded-full"/>
            <input id="avatar" type="file" accept="image/*" onChange={handleFormChangeUpdateUser} name="avatar_url" className="w-full rounded-lg bg-foreground/10 backdrop-blur-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 cursor-pointer" />
          </div>   

          <form onSubmit={handleUpdateUser} className="flex flex-col items-center justify-between gap-8 grow">
            <div className="flex flex-col items-center justify-center gap-6 grow">
                <input type="text" placeholder="First Name" name="first_name" value={formDataUpdateUser.first_name} onChange={handleFormChangeUpdateUser} className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" />
                <input type="text" placeholder="Last Name" name="last_name" value={formDataUpdateUser.last_name} onChange={handleFormChangeUpdateUser} className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 placeholder:text-white/80 text-lg" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button type="submit" disabled={updateUserMutation.isPending} className="bg-foreground/10 backdrop-blur-lg rounded-lg py-2 px-4 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 disabled:opacity-50">
                {updateUserMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditProfile(false)} className="bg-foreground/10 backdrop-blur-lg rounded-lg py-2 px-4 hover:bg-foreground/20 hover:scale-105 transition-all duration-200">Cancel</button>
            </div>
          </form>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-between gap-12 bg-foreground/10 backdrop-blur-lg rounded-lg p-6 h-120 w-87.5">
          <div className="flex flex-col items-center justify-center w-full gap-4">
              <div className="flex items-center justify-end self-end bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200 cursor-pointer" onClick={() => setEditProfile(true)}>
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

          <button className="bg-foreground/10 backdrop-blur-lg rounded-lg p-2 hover:bg-foreground/20 hover:scale-105 transition-all duration-200" onClick={() => setIsProfileWindowDisplayed(false)}><X /></button>
        </section>
      )}
    </motion.div>
  )
}