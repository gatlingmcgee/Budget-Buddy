import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Expenses() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "",
    date: "",
  });
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // Helper to get local YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: getLocalDateString() }));
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      setError("");

      const res = await fetch("/api/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses");

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError("Could not load expenses");
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (session) fetchExpenses();
  }, [session]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setForm({
      name: exp.name,
      amount: exp.amount,
      category: exp.category,
      date: new Date(exp.date).toISOString().split("T")[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (editingId) {
        const res = await fetch("/api/expenses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingId }),
        });

        if (!res.ok) throw new Error("Failed to update expense");
        setEditingId(null);
      } else {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error("Failed to create expense");
      }

      setForm({
        name: "",
        amount: "",
        category: "",
        date: getLocalDateString(),
      });

      fetchExpenses();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the expense");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      setError("");

      const res = await fetch("/api/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete expense");

      fetchExpenses();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while deleting the expense");
    }
  };

  const uniqueCategories = Array.from(
    new Set(expenses.map((exp) => exp.category))
  );

  const filteredExpenses = expenses.filter(
    (exp) => filter === "All" || exp.category === filter
  );

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <div className="filter-wrapper">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <h1>Expense Tracker</h1>
        <div className="header-spacer"></div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="expense-form-inline">
        <input
          name="name"
          placeholder="Expense Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          list="category-options"
          onChange={handleChange}
          required
        />
        <datalist id="category-options">
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <button type="submit" className="action-btn add-btn">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              setEditingId(null);
              setForm({
                name: "",
                amount: "",
                category: "",
                date: getLocalDateString(),
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="table-container">
        {loadingExpenses ? (
          <p>Loading expenses...</p>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Expense Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.name}</td>
                    <td>${parseFloat(exp.amount).toFixed(2)}</td>
                    <td>{exp.category}</td>
                    <td>
                      {new Date(exp.date).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(exp)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(exp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}