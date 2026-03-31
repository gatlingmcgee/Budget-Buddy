import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <header>
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