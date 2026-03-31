import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  
  return (
    <nav className="navbar">
      <h2 style={{ margin: 0, color: '#333', cursor: 'pointer' }} onClick={() => router.push("/")}>Budget Buddy</h2>
      <div className="nav-actions">
        {session ? (
          <>
            <button onClick={() => router.push("/dashboard")}>Dashboard</button>
            <button onClick={() => router.push("/budget")}>Budget</button>
            <button onClick={() => router.push("/expenses")}>Expenses</button>
            <button onClick={() => router.push("/profile")}>Profile</button>
            <button onClick={() => signOut()} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/login")}>Login</button>
            <button onClick={() => router.push("/register")}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}
