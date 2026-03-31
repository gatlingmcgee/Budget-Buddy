import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Budget() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ name: "", amount: "" });

  // Protect route
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);

  // Fetch budgets
  const fetchBudgets = async () => {
    const res = await fetch("/api/budgets");
    const data = await res.json();
    setBudgets(data);
  };

  useEffect(() => {
    if (session) fetchBudgets();
  }, [session]);

  // Handle form change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit new budget
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });

    setForm({ name: "", amount: "" });
    fetchBudgets();
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="budget-page">
      <h1> Budget Tracker</h1>

      {/* ADD BUDGET FORM */}
      <form onSubmit={handleSubmit} className="budget-form">
        <input
          name="name"
          placeholder="Budget Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Budget</button>
      </form>

      {/* BUDGET LIST */}
      <div className="budget-list">
        <h2>All Budgets</h2>
        {budgets.length === 0 ? (
          <p>No budgets yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.name}</td>
                  <td>${budget.amount}</td>
                  <td>${budget.remaining ?? budget.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}