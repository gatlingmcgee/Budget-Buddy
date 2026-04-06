import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (router.query.search) {
      setSearchTerm(router.query.search);
    } else {
      setSearchTerm("");
    }
  }, [router.query.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/expenses?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(`/expenses`);
    }
  };
  
  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <h2 style={{ margin: 0, color: '#333', cursor: 'pointer' }} onClick={() => router.push("/")}>Budget Buddy</h2>
        {session && (
          <form onSubmit={handleSearch} style={{ display: 'flex', margin: 0 }} className="search-form">
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
            <button type="submit" style={{ padding: '8px 12px', marginLeft: '5px', borderRadius: '4px', border: 'none', background: '#0070f3', color: 'white', cursor: 'pointer' }}>Search</button>
          </form>
        )}
      </div>
      <div className="nav-actions">        {session ? (
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
