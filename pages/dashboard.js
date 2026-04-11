import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  "#e63946",
  "#457b9d",
  "#2a9d8f",
  "#f4a261",
  "#8d99ae",
  "#ffb703",
  "#8b5cf6",
  "#14b8a6",
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    remaining: 0,
    budgetUsedPercent: 0,
    topCategory: null,
    recentExpensesCount: 0,
  });

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  useEffect(() => {
    if (!session) return;

    const fetchDashboardData = async () => {
      try {
        setDashboardError("");
        setLoadingSummary(true);
        setLoadingExpenses(true);

        const [summaryRes, expenseRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/expenses"),
        ]);

        const summaryData = await summaryRes.json();
        const expenseData = await expenseRes.json();

        if (!summaryRes.ok) {
          throw new Error(summaryData.message || "Failed to load summary");
        }

        if (!expenseRes.ok) {
          throw new Error(expenseData.message || "Failed to load expenses");
        }

        setSummary({
          totalBudget: summaryData.totalBudget ?? 0,
          totalExpenses: summaryData.totalExpenses ?? 0,
          remaining: summaryData.remaining ?? 0,
          budgetUsedPercent: summaryData.budgetUsedPercent ?? 0,
          topCategory: summaryData.topCategory ?? null,
          recentExpensesCount: summaryData.recentExpensesCount ?? 0,
        });

        setRecentExpenses(Array.isArray(expenseData) ? expenseData : []);
      } catch (error) {
        console.error(error);
        setDashboardError("Could not load dashboard data");
      } finally {
        setLoadingSummary(false);
        setLoadingExpenses(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  const categoryTotals = useMemo(() => {
    const totals = {};

    recentExpenses.forEach((expense) => {
      const category = expense.category || "Other";

      if (!totals[category]) {
        totals[category] = 0;
      }

      totals[category] += Number(expense.amount);
    });

    return totals;
  }, [recentExpenses]);

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryTotals),
        backgroundColor: CHART_COLORS.slice(0, Object.keys(categoryTotals).length),
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const budgetUsedColor =
    summary.budgetUsedPercent > 90
      ? "#e63946"
      : summary.budgetUsedPercent > 70
      ? "#f4a261"
      : "#2a9d8f";

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, {session.user.username}</h1>
        <p>Here’s your financial overview</p>
      </header>

      {dashboardError && <p className="error">{dashboardError}</p>}

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Budget</h3>
          {loadingSummary ? (
            <p>Loading...</p>
          ) : (
            <p>${Number(summary.totalBudget).toFixed(2)}</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Total Spent</h3>
          {loadingSummary ? (
            <p>Loading...</p>
          ) : (
            <p>${Number(summary.totalExpenses).toFixed(2)}</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Remaining</h3>
          {loadingSummary ? (
            <p>Loading...</p>
          ) : (
            <p
              style={{
                color: summary.remaining < 0 ? "#e63946" : "#2a9d8f",
              }}
            >
              ${Number(summary.remaining).toFixed(2)}
            </p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Budget Used</h3>
          {loadingSummary ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{Number(summary.budgetUsedPercent).toFixed(1)}%</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(summary.budgetUsedPercent, 100)}%`,
                    backgroundColor: budgetUsedColor,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="dashboard-cards dashboard-insights">
        <div className="dashboard-card">
          <h3>Top Category</h3>
          {loadingSummary ? (
            <p>Loading...</p>
          ) : summary.topCategory ? (
            <>
              <p>{summary.topCategory.name}</p>
              <span className="sub-value">
                ${Number(summary.topCategory.amount).toFixed(2)}
              </span>
            </>
          ) : (
            <p>No expenses yet</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Monthly Activity</h3>
          {loadingSummary ? (
            <p>Loading...</p>
          ) : (
            <p>{summary.recentExpensesCount} expenses this month</p>
          )}
        </div>
      </section>

      <section className="chart-section">
        <h2>Spending by Category</h2>

        {loadingExpenses ? (
          <p>Loading chart...</p>
        ) : recentExpenses.length === 0 ? (
          <p>No data for chart</p>
        ) : (
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        )}
      </section>

      <section className="recent-expenses">
        <h2>Recent Expenses</h2>

        {loadingExpenses ? (
          <p>Loading recent expenses...</p>
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
                  <td>{expense.category || "Other"}</td>
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
      <footer>
        <p>© 2026 Buddy Budget - CSE499 Project</p>
      </footer>
    </div>
  );
}