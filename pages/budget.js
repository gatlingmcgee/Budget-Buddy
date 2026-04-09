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
  const [fieldErrors, setFieldErrors] = useState({});

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

  const resetForm = () => {
    setEditingId(null);
    setFieldErrors({});
    setForm({
      amount: "",
      category: "Overall",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setFieldErrors({});
    setForm({
      amount: b.amount,
      category: b.category,
      month: b.month,
      year: b.year,
    });
    setMessage("");
    setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!form.category.trim()) {
      errors.category = "Category is required";
    }

    if (!form.month || Number(form.month) < 1 || Number(form.month) > 12) {
      errors.month = "Month must be between 1 and 12";
    }

    if (!form.year || String(form.year).length !== 4) {
      errors.year = "Enter a valid 4-digit year";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const url = "/api/budget";
      const method = editingId ? "PUT" : "POST";

      const bodyPayload = {
        ...form,
        amount: parseFloat(form.amount),
        month: parseInt(form.month, 10),
        year: parseInt(form.year, 10),
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
      resetForm();
      fetchBudgets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="budget-page">
      <h1>Budget Management</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="budget-form">
        <div className="form-group">
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount ($)"
            value={form.amount}
            onChange={handleChange}
            className={fieldErrors.amount ? "input-error" : ""}
          />
          {fieldErrors.amount && (
            <span className="field-error">{fieldErrors.amount}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className={fieldErrors.category ? "input-error" : ""}
          />
          {fieldErrors.category && (
            <span className="field-error">{fieldErrors.category}</span>
          )}
        </div>

        <div className="form-group">
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className={fieldErrors.month ? "input-error" : ""}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          {fieldErrors.month && (
            <span className="field-error">{fieldErrors.month}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            className={fieldErrors.year ? "input-error" : ""}
          />
          {fieldErrors.year && (
            <span className="field-error">{fieldErrors.year}</span>
          )}
        </div>

        <div className="form-group button-group">
          <button disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Budget" : "Save Budget"}
          </button>

          {editingId && (
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                resetForm();
                setMessage("");
                setError("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

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
                    <button
                      className="action-btn"
                      style={{ marginRight: "5px" }}
                      onClick={() => handleEdit(b)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <footer>
        <p>© 2026 Buddy Budget - CSE499 Project</p>
      </footer>
    </div>
  );
}