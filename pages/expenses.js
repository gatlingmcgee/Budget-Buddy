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
  const [fieldErrors, setFieldErrors] = useState({});
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

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

  const resetForm = () => {
    setEditingId(null);
    setFieldErrors({});
    setForm({
      name: "",
      amount: "",
      category: "",
      date: getLocalDateString(),
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

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setFieldErrors({});
    setForm({
      name: exp.name,
      amount: exp.amount,
      category: exp.category,
      date: new Date(exp.date).toISOString().split("T")[0],
    });
    setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Expense name is required";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!form.category.trim()) {
      errors.category = "Category is required";
    }

    if (!form.date) {
      errors.date = "Date is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      if (editingId) {
        const res = await fetch("/api/expenses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            id: editingId,
            amount: parseFloat(form.amount),
          }),
        });

        if (!res.ok) throw new Error("Failed to update expense");
        setEditingId(null);
      } else {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            amount: parseFloat(form.amount),
          }),
        });

        if (!res.ok) throw new Error("Failed to create expense");
      }

      resetForm();
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
    new Set(expenses.map((exp) => exp.category).filter(Boolean))
  );

  const searchParam = router.query.search || "";

  const filteredExpenses = expenses.filter((exp) => {
    const matchCategoryDrop = filter === "All" || exp.category === filter;
    const term = searchParam.toLowerCase();

    if (!term) return matchCategoryDrop;

    const matchSearch =
      exp.name.toLowerCase().includes(term) ||
      exp.category.toLowerCase().includes(term) ||
      new Date(exp.date)
        .toLocaleDateString("en-US", {
          timeZone: "UTC",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toLowerCase()
        .includes(term) ||
      exp.date.includes(term);

    return matchCategoryDrop && matchSearch;
  });

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

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="expense-form-inline">
        <div className="form-group">
          <input
            name="name"
            placeholder="Expense Name"
            value={form.name}
            onChange={handleChange}
            className={fieldErrors.name ? "input-error" : ""}
          />
          {fieldErrors.name && (
            <span className="field-error">{fieldErrors.name}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
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
            list="category-options"
            onChange={handleChange}
            className={fieldErrors.category ? "input-error" : ""}
          />
          <datalist id="category-options">
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {fieldErrors.category && (
            <span className="field-error">{fieldErrors.category}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={fieldErrors.date ? "input-error" : ""}
          />
          {fieldErrors.date && (
            <span className="field-error">{fieldErrors.date}</span>
          )}
        </div>

        <div className="form-group button-group">
          <button type="submit" className="add-btn">
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              className="action-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
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
                        className="action-btn"
                        style={{ marginRight: "5px" }}
                        onClick={() => handleEdit(exp)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn"
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