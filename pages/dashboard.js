import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="navbar">
        <h2> Budget Buddy</h2>
        <div className="nav-actions">
          <button onClick={() => router.push("/")}> Home</button>
          <button onClick={() => router.push("/expenses")}> Expenses</button>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="header">
        <h1>Welcome back, {session.user.username} </h1>
        <p>Here’s your financial overview</p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="cards">
        <div className="card">
          <h3>Total Budget</h3>
          <p>$2,500</p>
        </div>
        <div className="card">
          <h3>Total Spent</h3>
          <p>$1,200</p>
        </div>
        <div className="card">
          <h3>Remaining</h3>
          <p>$1,300</p>
        </div>
      </section>

      {/* PLACEHOLDER FOR CHART */}
      <section className="chart">
        <h2>Spending Overview</h2>
        <div className="chart-box">[ Chart Coming Soon ]</div>
      </section>

      {/* RECENT EXPENSES */}
      <section className="expenses">
        <h2>Recent Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Groceries</td>
              <td>Food</td>
              <td>$50</td>
            </tr>
            <tr>
              <td>Gas</td>
              <td>Transport</td>
              <td>$40</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}