import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import Link from "next/link";

/**
 * User Profile Component.
 * Fetches the currently authenticated user's details and allows them to update their 
 * username, email, full name, and optionally change their password.
 */

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      try {
        setMessage("");
        setIsLoading(true);

        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setForm({
          username: data.username || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          new_password: "",
        });
      } catch (error) {
        console.error("Failed to load profile", error);
        setIsSuccess(false);
        setMessage("Could not load profile information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setIsSaving(true);

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage(data.message || "Profile updated successfully");
        setForm((prev) => ({ ...prev, new_password: "" }));
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.card} style={{ maxWidth: "500px" }}>
          <h1 className={styles.title}>My Profile</h1>

          {message && (
            <div
              className={`${styles.message} ${isSuccess ? styles.messageSuccess : ""
                }`}
            >
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

            <div style={{ display: "flex", gap: "1rem" }}>
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

            <button type="submit" className={styles.button} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div className={styles.linkGroup}>
            <Link href="/dashboard" className={styles.link}>
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      <footer>
        <p>© 2026 Buddy Budget - CSE499 Project</p>
      </footer>
    </div>
  );
}