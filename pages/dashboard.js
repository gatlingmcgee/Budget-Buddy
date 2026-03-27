// pages/dashboard.js
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    remaining: 0,
  });
  const [loading, setLoading] = useState(true);

  // Protect route: redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // Fetch dashboard summary from API
  useEffect(() => {
    if (!session) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error("Failed to fetch summary");
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [session]);

  if (status === "loading" || loading) return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="navbar">
        <h2>Budget Buddy</h2>
        <div className="nav-actions">
          <button onClick={() => router.push("/")}>Home</button>
          <button onClick={() => router.push("/budget")}>Budget</button>
          <button onClick={() => router.push("/expenses")}>Expenses</button>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="header">
        <h1>Welcome back, {session.user.username}</h1>
        <p>Here’s your financial overview</p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="cards">
        <div className="card">
          <h3>Total Budget</h3>
          <p>${summary.totalBudget.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Spent</h3>
          <p>${summary.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Remaining</h3>
          <p>${summary.remaining.toFixed(2)}</p>
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
        {/* PLACEHOLDER */}
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
              <td>$50.00</td>
            </tr>
            <tr>
              <td>Gas</td>
              <td>Transport</td>
              <td>$40.00</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}