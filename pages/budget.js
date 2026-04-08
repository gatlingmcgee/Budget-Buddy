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
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budget");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setBudgets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (session) fetchBudgets();
  }, [session]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({
      amount: b.amount,
      category: b.category,
      month: b.month,
      year: b.year,
    });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      return setError("Amount must be greater than 0");
    }

    try {
      setLoading(true);

      const url = "/api/budget";
      const method = editingId ? "PUT" : "POST";
      const bodyPayload = {
        ...form,
        amount: parseFloat(form.amount),
        month: parseInt(form.month),
        year: parseInt(form.year),
      };

      if (editingId) bodyPayload.id = editingId;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(editingId ? "Budget updated!" : "Budget saved!");
      setEditingId(null);
      setForm({
        amount: "",
        category: "Overall",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });

      fetchBudgets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      const res = await fetch("/api/budget", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Deleted successfully");
      fetchBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="budget-page">
      <h1>Budget Management</h1>

      {message && <p className="success" style={{color: 'green'}}>{message}</p>}
      {error && <p className="error" style={{color: 'red'}}>{error}</p>}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="budget-form">
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount ($)"
          value={form.amount}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <select name="month" value={form.month} onChange={handleChange}>
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        <input
          name="year"
          type="number"
          value={form.year}
          onChange={handleChange}
        />

        <button disabled={loading}>
          {loading ? "Saving..." : (editingId ? "Update Budget" : "Save Budget")}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm({ amount: "", category: "Overall", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            setMessage(""); setError("");
          }} style={{marginLeft: '10px'}}>
            Cancel
          </button>
        )}
      </form>

      {/* TABLE */}
      <div className="budget-table">
        <h2>Your Budgets</h2>

        {budgets.length === 0 ? (
          <p>No budgets yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id}>
                  <td>{b.category}</td>
                  <td>${Number(b.amount).toFixed(2)}</td>
                  <td>{months[b.month - 1]}</td>
                  <td>{b.year}</td>
                  <td>
                    <button style={{marginRight: '5px'}} onClick={() => handleEdit(b)}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(b.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}