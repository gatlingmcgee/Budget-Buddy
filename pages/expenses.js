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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    if (endDate && val > endDate) setEndDate(val);
    setStartDate(val);
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    if (startDate && val < startDate) setStartDate(val);
    setEndDate(val);
  };
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

  const filteredExpenses = expenses.filter(
    (exp) => {
      const matchCategoryDrop = filter === "All" || exp.category === filter;
      
      const expDateStr = new Date(exp.date).toISOString().split("T")[0];
      const matchStartDate = !startDate || expDateStr >= startDate;
      const matchEndDate = !endDate || expDateStr <= endDate;
      const matchDates = matchStartDate && matchEndDate;

      const term = searchParam.toLowerCase();
      
      let matchSearch = true;
      if (term) {
        matchSearch = exp.name.toLowerCase().includes(term) ||
          exp.category.toLowerCase().includes(term) ||
          new Date(exp.date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).toLowerCase().includes(term) ||
          exp.date.includes(term);
      }
        
      return matchCategoryDrop && matchDates && matchSearch;
    }
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, startDate, endDate, searchParam, itemsPerPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="expenses-container">
      <div className="expenses-header" style={{ justifyContent: 'center' }}>
        <h1>Expense Tracker</h1>
      </div>

      <div className="filter-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}>
        <strong style={{marginRight: '0.5rem'}}>Filters:</strong>
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
        
        <strong style={{marginLeft: '1rem', marginRight: '0.5rem'}}>Date Range:</strong>
        <input 
          type="date" 
          className="filter-select" 
          value={startDate} 
          onChange={handleStartDateChange} 
          title="Start Date"
        />
        <span>-</span>
        <input 
          type="date" 
          className="filter-select" 
          value={endDate} 
          onChange={handleEndDateChange} 
          title="End Date"
        />

        {(startDate || endDate || filter !== "All") && (
          <button 
            type="button" 
            className="action-btn" 
            style={{ marginLeft: '0.5rem', backgroundColor: '#fff' }}
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setFilter("All");
            }}
          >
            Clear Filters
          </button>
        )}
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
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((exp) => (
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

        {!loadingExpenses && filteredExpenses.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
            <div>
              <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Items per page:</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="filter-select" style={{ padding: '0.25rem' }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <button 
                type="button"
                className="action-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ margin: '0 1rem', fontWeight: 'bold' }}>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button 
                type="button"
                className="action-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage >= totalPages}
                style={{ opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}