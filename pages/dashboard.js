import { useSession } from "next-auth/react";
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
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [expensesError, setExpensesError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  const fetchRecentExpenses = async () => {
    try {
      setExpensesError("");

      const res = await fetch("/api/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses");

      const data = await res.json();

      const sortedExpenses = [...data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setRecentExpenses(sortedExpenses.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
      setExpensesError("Could not load recent expenses");
    }
  };

  useEffect(() => {
    if (!session) return;

    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error("Failed to fetch summary");

        const data = await res.json();
        setSummary(data);

        await fetchRecentExpenses();
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (status === "loading" || loading) return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Welcome back, {session.user.username}</h1>
        <p>Here’s your financial overview</p>
      </header>

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

      <section className="chart">
        <h2>Spending Overview</h2>
        <div className="chart-box">[ Chart Coming Soon ]</div>
      </section>

      <section className="expenses">
        <h2>Recent Expenses</h2>

        {expensesError ? (
          <p>{expensesError}</p>
        ) : recentExpenses.length === 0 ? (
          <p>No recent expenses found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.title}</td>
                  <td>{expense.category}</td>
                  <td>${Number(expense.amount).toFixed(2)}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}