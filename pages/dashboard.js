import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    remaining: 0,
  });

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expensesError, setExpensesError] = useState("");

  // Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // Fetch data
  useEffect(() => {
    if (!session) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Summary
        const summaryRes = await fetch("/api/dashboard/summary");
        const summaryData = await summaryRes.json();
        if (!summaryRes.ok) throw new Error(summaryData.message);

        setSummary(summaryData);

        // Recent expenses
        const expenseRes = await fetch("/api/expenses");
        const expenseData = await expenseRes.json();
        if (!expenseRes.ok) throw new Error(expenseData.message);

        setRecentExpenses(expenseData);
      } catch (error) {
        console.error(error);
        setExpensesError("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  // PIE CHART DATA
  const getCategoryTotals = () => {
    const totals = {};

    recentExpenses.forEach((expense) => {
      const category = expense.category || "Other";

      if (!totals[category]) {
        totals[category] = 0;
      }

      totals[category] += Number(expense.amount);
    });

    return totals;
  };

  const categoryTotals = getCategoryTotals();

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#e63946",
          "#457b9d",
          "#2a9d8f",
          "#f4a261",
          "#8d99ae",
          "#ffb703",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (status === "loading" || loading) return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <h1>Welcome back, {session.user.username}</h1>
        <p>Here’s your financial overview</p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Budget</h3>
          <p>${summary.totalBudget.toFixed(2)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Spent</h3>
          <p>${summary.totalExpenses.toFixed(2)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Remaining</h3>
          <p>${summary.remaining.toFixed(2)}</p>
        </div>
      </section>

      {/* PIE CHART */}
      <section className="chart-section">
        <h2>Spending by Category</h2>

        {recentExpenses.length === 0 ? (
          <p>No data for chart</p>
        ) : (
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <Pie data={pieData} />
          </div>
        )}
      </section>

      {/* RECENT EXPENSES */}
      <section className="recent-expenses">
        <h2>Recent Expenses</h2>

        {expensesError ? (
          <p>{expensesError}</p>
        ) : recentExpenses.length === 0 ? (
          <p>No recent expenses found</p>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {recentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.name}</td>
                  <td>{expense.category}</td>
                  <td style={{ color: "#e63946", fontWeight: "bold" }}>
                    ${Number(expense.amount).toFixed(2)}
                  </td>
                  <td>
                    {new Date(expense.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}