import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Expenses() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ name: "", amount: "", category: "", date: "" });
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);

  // Helper to get local YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  useEffect(() => {
    setForm(prev => ({ ...prev, date: getLocalDateString() }));
  }, []);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    if (session) fetchExpenses();
  }, [session]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setForm({
      name: exp.name,
      amount: exp.amount,
      category: exp.category,
      // Date in DB is UTC, but it represents the "day" entered. Simply slice to get YYYY-MM-DD
      date: new Date(exp.date).toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      // Update expense
      await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      setEditingId(null);
    } else {
      // Create expense
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    
    setForm({ name: "", amount: "", category: "", date: getLocalDateString() });
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchExpenses();
  };

  const uniqueCategories = Array.from(new Set(expenses.map((exp) => exp.category)));

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <div className="filter-wrapper">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="All">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <h1>Expense Tracker</h1>
        <div className="header-spacer"></div>
      </div>

      <form onSubmit={handleSubmit} className="expense-form-inline">
        <input name="name" placeholder="Expense Name" value={form.name} onChange={handleChange} required />
        <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} list="category-options" onChange={handleChange} required />
        <datalist id="category-options">
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <button type="submit" className="action-btn add-btn">{editingId ? "Update" : "Add"}</button>
        {editingId && (
          <button type="button" className="action-btn" onClick={() => { setEditingId(null); setForm({ name: "", amount: "", category: "", date: getLocalDateString() }); }}>Cancel</button>
        )}
      </form>

      <div className="table-container">
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
            {expenses.filter(exp => filter === "All" || exp.category === filter).map((exp) => (
              <tr key={exp.id}>
                <td>{exp.name}</td>
                <td>${parseFloat(exp.amount).toFixed(2)}</td>
                <td>{exp.category}</td>
                <td>{new Date(exp.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(exp.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}