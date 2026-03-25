import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <header>
        <nav>
          <h1>Dashboard overview for Budget Buddy</h1>
          <div className="nav-links">
            {!session ? (
              <a href="login">Login Page</a>
            ) : (
              <button onClick={() => signOut()}>Logout</button>
            )}
            <a href="#">Budget Page</a>
            <a href="#">Expense Tracking Page</a>
            <a href="#">Enhancement Page</a>
          </div>
        </nav>

        <section>
          <h1>Visualization for Enhancements</h1>

          {session ? (
            <div>
              <p>Welcome, {session.user.username}</p>
              <p>User ID: {session.user.id}</p>
            </div>
          ) : (
            <p>You are not logged in</p>
          )}
        </section>
      </header>

      <footer>
        <p>© 2026 Buddy Budget</p>
      </footer>
    </div>
  );
}