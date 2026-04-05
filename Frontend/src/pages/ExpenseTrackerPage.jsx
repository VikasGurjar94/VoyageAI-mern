import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  fetchExpenses,
  fetchSummary,
  addExpense,
  updateExpense,
  deleteExpense,
  importPlanned,
  clearExpenseState,
} from "../store/slices/expenseSlice";
import { fetchItinerary } from "../store/slices/itinerarySlice";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";
import api from "../services/api";

// chart colors for categories
const CATEGORY_COLORS = {
  food: "#f59e0b",
  transport: "#8b5cf6",
  accommodation: "#ec4899",
  sightseeing: "#3b82f6",
  shopping: "#f97316",
  adventure: "#10b981",
  medical: "#ef4444",
  other: "#6b7280",
};

const PAYMENT_ICONS = {
  cash: "💵",
  card: "💳",
  upi: "📱",
  other: "💰",
};

const CATEGORIES = [
  "food",
  "transport",
  "accommodation",
  "sightseeing",
  "shopping",
  "adventure",
  "medical",
  "other",
];

// reusable stat card component
const StatCard = ({ label, value, sub, color, bg }) => (
  <div style={{ ...styles.statCard, background: bg || "#fff" }}>
    <span style={{ ...styles.statValue, color: color || "#111827" }}>
      {value}
    </span>
    <span style={styles.statLabel}>{label}</span>
    {sub && <span style={styles.statSub}>{sub}</span>}
  </div>
);

const ExpenseTrackerPage = () => {
  const { id } = useParams(); // itinerary id
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { itinerary } = useSelector((s) => s.itineraries);
  const { expenses, summary, loading, error, success } = useSelector(
    (s) => s.expenses,
  );
  const { token } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("overview"); // overview | expenses | charts
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const emptyForm = {
    title: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    notes: "",
    day_number: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchItinerary(id));
    dispatch(fetchExpenses(id));
    dispatch(fetchSummary(id));
    return () => dispatch(clearExpenseState());
  }, [id, dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(fetchSummary(id)); // refresh summary after any change
      dispatch(clearExpenseState());
    }
  }, [success, id, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearExpenseState());
    }
  }, [error, dispatch]);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) {
      toast.error("Title, amount and date are required");
      return;
    }
    const payload = {
      ...form,
      itinerary_id: parseInt(id),
      amount: parseFloat(form.amount),
      day_number: form.day_number ? parseInt(form.day_number) : null,
    };

    if (editingExp) {
      await dispatch(
        updateExpense({ id: editingExp.id, expenseData: payload }),
      ).unwrap();
      toast.success("Expense updated");
      setEditingExp(null);
    } else {
      await dispatch(addExpense(payload)).unwrap();
      toast.success("Expense added");
    }
    setForm(emptyForm);
    setShowForm(false);
    dispatch(fetchSummary(id));
  };

  const handleEdit = (exp) => {
    setEditingExp(exp);
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      payment_method: exp.payment_method,
      notes: exp.notes || "",
      day_number: exp.day_number || "",
    });
    setShowForm(true);
    setActiveTab("expenses");
  };

  const handleDelete = (expId) => {
    if (window.confirm("Delete this expense?")) {
      dispatch(deleteExpense(expId))
        .unwrap()
        .then(() => {
          toast.success("Expense deleted");
          dispatch(fetchSummary(id));
        });
    }
  };

  const handleImport = () => {
    if (
      window.confirm(
        "Import planned costs from your itinerary? Existing planned items will be replaced.",
      )
    ) {
      dispatch(importPlanned(id))
        .unwrap()
        .then((data) => {
          toast.success(data.message);
          dispatch(fetchExpenses(id));
          dispatch(fetchSummary(id));
        })
        .catch(() => toast.error("Import failed"));
    }
  };

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/expenses/itinerary/${id}/export`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses-${itinerary?.destination || "trip"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded!");
    } catch {
      toast.error("Export failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !summary)
    return <Loader message="Loading expense tracker..." />;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button
            onClick={() => navigate(`/itineraries/${id}`)}
            style={styles.backBtn}
          >
            ← Back to Itinerary
          </button>
          <h1 style={styles.heading}>💰 Expense Tracker</h1>
          <p style={styles.sub}>
            {itinerary?.title} · {itinerary?.destination}
          </p>
        </div>

        <div style={styles.headerActions}>
          <button onClick={handleImport} style={styles.importBtn}>
            📥 Import Planned
          </button>
          <button
            onClick={handleExportCSV}
            disabled={downloading}
            style={styles.exportBtn}
          >
            {downloading ? "..." : "📤 Export CSV"}
          </button>
          <button
            onClick={() => {
              setEditingExp(null);
              setForm(emptyForm);
              setShowForm(true);
              setActiveTab("expenses");
            }}
            style={styles.addBtn}
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Budget overview cards */}
      {summary && (
        <div style={styles.statsGrid}>
          <StatCard
            label="Total Spent"
            value={`₹${summary.totalSpent.toLocaleString("en-IN")}`}
            sub={`${summary.totalExpenses} expenses`}
            color="#e94560"
            bg="#fff5f6"
          />
          <StatCard
            label="Total Budget"
            value={`₹${summary.totalBudget.toLocaleString("en-IN")}`}
            sub={`${itinerary?.days} days trip`}
            color="#3b82f6"
            bg="#eff6ff"
          />
          <StatCard
            label={summary.isOverBudget ? "Over Budget" : "Remaining"}
            value={`₹${Math.abs(summary.remaining).toLocaleString("en-IN")}`}
            sub={
              summary.isOverBudget ? "⚠️ exceeded budget" : "✅ under budget"
            }
            color={summary.isOverBudget ? "#ef4444" : "#10b981"}
            bg={summary.isOverBudget ? "#fef2f2" : "#ecfdf5"}
          />
          <StatCard
            label="Daily Average"
            value={`₹${summary.avgDailySpend.toLocaleString("en-IN")}`}
            sub="per day"
            color="#8b5cf6"
            bg="#faf5ff"
          />
          <StatCard
            label="Planned Total"
            value={`₹${summary.totalPlanned.toLocaleString("en-IN")}`}
            sub={
              summary.savedVsPlan >= 0
                ? `₹${summary.savedVsPlan.toLocaleString("en-IN")} saved vs plan`
                : `₹${Math.abs(summary.savedVsPlan).toLocaleString("en-IN")} more than plan`
            }
            color="#f59e0b"
            bg="#fffbeb"
          />
        </div>
      )}

      {/* Budget progress bar */}
      {summary && (
        <div style={styles.budgetBar}>
          <div style={styles.budgetBarHeader}>
            <span style={styles.budgetBarLabel}>Budget used</span>
            <span
              style={{
                ...styles.budgetBarPct,
                color: summary.isOverBudget ? "#ef4444" : "#10b981",
              }}
            >
              {Math.round((summary.totalSpent / summary.totalBudget) * 100)}%
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min((summary.totalSpent / summary.totalBudget) * 100, 100)}%`,
                background: summary.isOverBudget ? "#ef4444" : "#10b981",
              }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {["overview", "expenses", "charts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.tabActive : styles.tab}
          >
            {tab === "overview" && "📊 Overview"}
            {tab === "expenses" &&
              `📋 Expenses (${expenses.filter((e) => !e.is_planned).length})`}
            {tab === "charts" && "📈 Charts"}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ─────────────────────────────────── */}
      {activeTab === "overview" && summary && (
        <div style={styles.overviewGrid}>
          {/* Category breakdown */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Spending by Category</h3>
            {summary.categoryData.length === 0 ? (
              <p style={styles.noData}>No expenses added yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={summary.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {summary.categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString("en-IN")}`,
                      "Amount",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top expenses */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Top Expenses</h3>
            {summary.topExpenses.length === 0 ? (
              <p style={styles.noData}>No expenses yet.</p>
            ) : (
              <div style={styles.topList}>
                {summary.topExpenses.map((exp, i) => (
                  <div key={i} style={styles.topItem}>
                    <div style={styles.topItemLeft}>
                      <span
                        style={{
                          ...styles.topRank,
                          background: i === 0 ? "#fef3c7" : "#f3f4f6",
                          color: i === 0 ? "#d97706" : "#6b7280",
                        }}
                      >
                        #{i + 1}
                      </span>
                      <div>
                        <p style={styles.topTitle}>{exp.title}</p>
                        <p style={styles.topCategory}>{exp.category}</p>
                      </div>
                    </div>
                    <span style={styles.topAmount}>
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment method breakdown */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Payment Methods</h3>
            {Object.keys(summary.byMethod).length === 0 ? (
              <p style={styles.noData}>No expenses yet.</p>
            ) : (
              <div style={styles.methodList}>
                {Object.entries(summary.byMethod).map(([method, amount]) => (
                  <div key={method} style={styles.methodItem}>
                    <span style={styles.methodIcon}>
                      {PAYMENT_ICONS[method] || "💰"}
                    </span>
                    <span style={styles.methodName}>{method}</span>
                    <div style={styles.methodBarWrap}>
                      <div
                        style={{
                          ...styles.methodBar,
                          width: `${(amount / summary.totalSpent) * 100}%`,
                        }}
                      />
                    </div>
                    <span style={styles.methodAmount}>
                      ₹{Math.round(amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: EXPENSES ─────────────────────────────────── */}
      {activeTab === "expenses" && (
        <div>
          {/* Add / Edit form */}
          {showForm && (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>
                {editingExp ? "Edit Expense" : "Add New Expense"}
              </h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Lunch at beach shack"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Amount (₹)</label>
                    <input
                      name="amount"
                      type="number"
                      value={form.amount}
                      onChange={handleFormChange}
                      placeholder="e.g. 800"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      style={styles.input}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Date</label>
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleFormChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Payment Method</label>
                    <select
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleFormChange}
                      style={styles.input}
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="card">💳 Card</option>
                      <option value="upi">📱 UPI</option>
                      <option value="other">💰 Other</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Day Number (optional)</label>
                    <input
                      name="day_number"
                      type="number"
                      value={form.day_number}
                      onChange={handleFormChange}
                      placeholder="e.g. 2"
                      min={1}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                    <label style={styles.label}>Notes (optional)</label>
                    <input
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                      placeholder="Any notes..."
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingExp(null);
                    }}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={styles.submitBtn}
                  >
                    {loading ? "..." : editingExp ? "Update" : "Add Expense"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Expenses list */}
          <div style={styles.expensesList}>
            {expenses.filter((e) => !e.is_planned).length === 0 ? (
              <div style={styles.emptyExpenses}>
                <p style={styles.emptyIcon}>💸</p>
                <p style={styles.emptyText}>No expenses added yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  style={styles.addFirstBtn}
                >
                  + Add your first expense
                </button>
              </div>
            ) : (
              expenses
                .filter((e) => !e.is_planned)
                .map((exp) => (
                  <div key={exp.id} style={styles.expenseRow}>
                    <div
                      style={{
                        ...styles.categoryBullet,
                        background: CATEGORY_COLORS[exp.category] || "#6b7280",
                      }}
                    />

                    <div style={styles.expenseInfo}>
                      <p style={styles.expenseTitle}>{exp.title}</p>
                      <p style={styles.expenseMeta}>
                        {exp.date}
                        {exp.day_number ? ` · Day ${exp.day_number}` : ""}
                        {" · "}
                        {PAYMENT_ICONS[exp.payment_method]} {exp.payment_method}
                        {" · "}
                        {exp.category}
                      </p>
                      {exp.notes && (
                        <p style={styles.expenseNotes}>{exp.notes}</p>
                      )}
                    </div>

                    <div style={styles.expenseRight}>
                      <span style={styles.expenseAmount}>
                        ₹{Number(exp.amount).toLocaleString("en-IN")}
                      </span>
                      <div style={styles.expenseActions}>
                        <button
                          onClick={() => handleEdit(exp)}
                          style={styles.editBtn}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          style={styles.deleteBtn}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Planned expenses section */}
          {expenses.filter((e) => e.is_planned).length > 0 && (
            <div style={{ marginTop: "28px" }}>
              <h3 style={styles.sectionTitle}>
                📋 Planned Costs (from itinerary)
              </h3>
              <div style={styles.expensesList}>
                {expenses
                  .filter((e) => e.is_planned)
                  .map((exp) => (
                    <div
                      key={exp.id}
                      style={{ ...styles.expenseRow, opacity: 0.7 }}
                    >
                      <div
                        style={{
                          ...styles.categoryBullet,
                          background:
                            CATEGORY_COLORS[exp.category] || "#6b7280",
                        }}
                      />
                      <div style={styles.expenseInfo}>
                        <p style={styles.expenseTitle}>{exp.title}</p>
                        <p style={styles.expenseMeta}>
                          Day {exp.day_number} · {exp.category} · Planned
                        </p>
                      </div>
                      <span
                        style={{ ...styles.expenseAmount, color: "#9ca3af" }}
                      >
                        ₹{Number(exp.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CHARTS ───────────────────────────────────── */}
      {activeTab === "charts" && summary && (
        <div style={styles.chartsGrid}>
          {/* Day-wise spending line chart */}
          <div style={{ ...styles.chartCard, gridColumn: "1 / -1" }}>
            <h3 style={styles.chartTitle}>Daily Spending</h3>
            {summary.dailyData.length === 0 ? (
              <p style={styles.noData}>
                No expenses with day numbers added yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={summary.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [
                      `₹${v.toLocaleString("en-IN")}`,
                      "Spent",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#e94560"
                    strokeWidth={2.5}
                    dot={{ fill: "#e94560", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Planned vs Actual bar chart */}
          <div style={{ ...styles.chartCard, gridColumn: "1 / -1" }}>
            <h3 style={styles.chartTitle}>Planned vs Actual by Category</h3>
            {summary.comparisonData.length === 0 ? (
              <p style={styles.noData}>
                Import planned costs and add actual expenses to see comparison.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                  />
                  <Legend />
                  <Bar
                    dataKey="planned"
                    name="Planned"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="actual"
                    name="Actual"
                    fill="#e94560"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category pie chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Category Breakdown</h3>
            {summary.categoryData.length === 0 ? (
              <p style={styles.noData}>No expenses yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent}%`}
                    labelLine={false}
                  >
                    {summary.categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [
                      `₹${v.toLocaleString("en-IN")}`,
                      "Spent",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Budget vs Spent simple bar */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Budget vs Spent</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Budget", amount: summary.totalBudget },
                  { name: "Spent", amount: summary.totalSpent },
                  { name: "Planned", amount: summary.totalPlanned },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  <Cell fill="#3b82f6" />
                  <Cell fill={summary.isOverBudget ? "#ef4444" : "#e94560"} />
                  <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  backBtn: {
    background: "none",
    border: "1px solid #e5e7eb",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "8px",
    color: "#374151",
    display: "block",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "4px",
  },
  sub: { color: "#6b7280", fontSize: "14px" },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  importBtn: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  exportBtn: {
    background: "#f0fdf4",
    color: "#16a34a",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  addBtn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  statCard: {
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  statValue: {
    display: "block",
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "4px",
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
  },
  statSub: {
    display: "block",
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "3px",
  },
  budgetBar: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  budgetBarHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  budgetBarLabel: { fontSize: "13px", color: "#6b7280", fontWeight: "500" },
  budgetBarPct: { fontSize: "13px", fontWeight: "700" },
  progressTrack: {
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "5px",
    transition: "width 0.5s ease",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "24px",
    background: "#f3f4f6",
    padding: "4px",
    borderRadius: "10px",
    width: "fit-content",
  },
  tab: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  tabActive: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#111827",
    fontWeight: "600",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  chartCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  chartTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
  },
  noData: {
    color: "#9ca3af",
    fontSize: "14px",
    textAlign: "center",
    padding: "32px 0",
  },
  topList: { display: "flex", flexDirection: "column", gap: "12px" },
  topItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topItemLeft: { display: "flex", gap: "10px", alignItems: "center" },
  topRank: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  },
  topTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "2px",
  },
  topCategory: {
    fontSize: "12px",
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  topAmount: { fontSize: "14px", fontWeight: "700", color: "#e94560" },
  methodList: { display: "flex", flexDirection: "column", gap: "14px" },
  methodItem: { display: "flex", alignItems: "center", gap: "10px" },
  methodIcon: { fontSize: "18px", flexShrink: 0 },
  methodName: {
    fontSize: "13px",
    color: "#374151",
    width: "60px",
    textTransform: "capitalize",
  },
  methodBarWrap: {
    flex: 1,
    height: "8px",
    background: "#f3f4f6",
    borderRadius: "4px",
    overflow: "hidden",
  },
  methodBar: {
    height: "100%",
    background: "#e94560",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  methodAmount: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    minWidth: "70px",
    textAlign: "right",
  },
  formCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "18px",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  input: {
    padding: "9px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  formActions: { display: "flex", justifyContent: "flex-end", gap: "10px" },
  cancelBtn: {
    padding: "9px 20px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151",
  },
  submitBtn: {
    padding: "9px 22px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  expensesList: { display: "flex", flexDirection: "column", gap: "10px" },
  emptyExpenses: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: "48px", marginBottom: "12px" },
  emptyText: { color: "#9ca3af", fontSize: "16px", marginBottom: "16px" },
  addFirstBtn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  expenseRow: {
    background: "#fff",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  categoryBullet: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "5px",
  },
  expenseInfo: { flex: 1 },
  expenseTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "3px",
  },
  expenseMeta: {
    fontSize: "12px",
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  expenseNotes: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "3px",
    fontStyle: "italic",
  },
  expenseRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    flexShrink: 0,
  },
  expenseAmount: { fontSize: "16px", fontWeight: "700", color: "#e94560" },
  expenseActions: { display: "flex", gap: "6px" },
  editBtn: {
    background: "#eff6ff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteBtn: {
    background: "#fef2f2",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "12px",
  },
};

export default ExpenseTrackerPage;
