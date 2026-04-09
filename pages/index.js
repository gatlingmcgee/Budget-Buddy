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

          {session ? (
            <div>
              <h1>Welcome, {session.user.username},</h1>
              <h1>You are logged in!</h1>
              <p>User ID: {session.user.id}</p>
            </div>
          ) : (
            <p>You are not logged in</p>
          )}
        </section>
      </header>

      <footer>
        <p>© 2026 Buddy Budget - CSE499 Project</p>
      </footer>
    </div>
  );
}