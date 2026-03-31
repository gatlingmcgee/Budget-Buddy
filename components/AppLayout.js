import Navbar from "./Navbar";
import { useSession } from "next-auth/react";

export default function AppLayout({ children }) {
  const { data: session } = useSession();
  
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
