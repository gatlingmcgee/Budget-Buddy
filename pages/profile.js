import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import Link from "next/link";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    new_password: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Protect route
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Fetch current user data
  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/user/profile");
          if (res.ok) {
            const data = await res.json();
            setForm({
              username: data.username || "",
              email: data.email || "",
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              new_password: "", // Keep password field empty
            });
          }
        } catch (error) {
          console.error("Failed to load profile", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [session]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(""); // Clear message on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage(data.message);
        setForm((prev) => ({ ...prev, new_password: "" })); // Clear password
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Failed to update profile");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("An unexpected error occurred.");
    }
  };

  if (status === "loading" || isLoading) return <div className={styles.container}><p>Loading...</p></div>;
  if (!session) return null;

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.card} style={{ maxWidth: '500px' }}>
        <h1 className={styles.title}>My Profile</h1>
        
        {message && (
          <div className={`${styles.message} ${isSuccess ? styles.messageSuccess : ""}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              className={styles.input}
              value={form.username}
              onChange={handleChange}
              placeholder="Your username"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.label}>First Name</label>
              <input
                type="text"
                name="first_name"
                className={styles.input}
                value={form.first_name}
                onChange={handleChange}
                placeholder="First name"
              />
            </div>

            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                name="last_name"
                className={styles.input}
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>New Password (Optional)</label>
            <input
              type="password"
              name="new_password"
              className={styles.input}
              value={form.new_password}
              onChange={handleChange}
              placeholder="Leave blank to keep current"
            />
          </div>

          <button type="submit" className={styles.button}>
            Save Changes
          </button>
        </form>

        <div className={styles.linkGroup}>
          <Link href="/dashboard" className={styles.link}>
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
