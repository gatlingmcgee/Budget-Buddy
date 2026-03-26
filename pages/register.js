import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/Auth.module.css";

export default function Register() {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle the registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send user registration data to the backend API
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: e.target.username.value,
        email: e.target.email.value,
        password: e.target.password.value,
      }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      setIsSuccess(true);
      setMessage("Registration successful! You can now log in.");
    } else {
      setIsSuccess(false);
      setMessage(data.message || "An error occurred during registration.");
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Register - Budget Buddy</title>
        <meta name="description" content="Create a new Budget Buddy account" />
      </Head>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input 
              id="username"
              name="username" 
              className={styles.input}
              placeholder="Choose a username" 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <input 
              id="email"
              name="email" 
              className={styles.input}
              placeholder="you@example.com" 
              type="email" 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              className={styles.input}
              placeholder="Create a strong password" 
              type="password" 
              required 
            />
          </div>
          <button className={styles.button} type="submit">Sign Up</button>
        </form>
        {message && (
          <div className={`${styles.message} ${isSuccess ? styles.messageSuccess : ''}`}>
            {message}
          </div>
        )}
        <div className={styles.linkGroup}>
          Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
        </div>
      </div>
    </div>
  );
}