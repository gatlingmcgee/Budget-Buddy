import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Budget() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "Overall",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  const fetchBudgets = async () => {
    try {
      setLoadingBudgets(true);
      setError("");

      const res = await fetch("/api/budget");
      if (!res.ok) throw new Error("Failed to fetch budgets");

      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      console.error(err);
      setError("Could not load budgets");
    } finally {
      setLoadingBudgets(false);
    }
  };

  useEffect(() => {
    if (session) fetchBudgets();
  }, [session]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          month: parseInt(form.month, 10),
          year: parseInt(form.year, 10),
        }),
      });

      if (!res.ok) throw new Error("Failed to create budget");

      setForm({
        amount: "",
        category: "Overall",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });

      setMessage("Budget added successfully");
      fetchBudgets();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating the budget");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="budget-page">
      <h1>Budget Tracker</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="budget-form">
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Budget Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          name="month"
          type="number"
          min="1"
          max="12"
          placeholder="Month"
          value={form.month}
          onChange={handleChange}
          required
        />

        <input
          name="year"
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Budget"}
        </button>
      </form>

      <div className="budget-list">
        <h2>All Budgets</h2>

        {loadingBudgets ? (
          <p>Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p>No budgets yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.category}</td>
                  <td>${Number(budget.amount).toFixed(2)}</td>
                  <td>{budget.month}</td>
                  <td>{budget.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}