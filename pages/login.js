import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/Auth.module.css";

export default function Login() {
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Handle the login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    // Attempt to sign in using NextAuth credentials provider
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setMessage("Invalid username or password");
    } else {
      setMessage("Login successful. Redirecting...");
      router.push("/"); // Redirect user to the homepage/dashboard
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login - Budget Buddy</title>
        <meta name="description" content="Login to your Budget Buddy account" />
      </Head>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input 
              id="username"
              name="username" 
              className={styles.input} 
              placeholder="Enter your username" 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              className={styles.input} 
              placeholder="Enter your password" 
              type="password" 
              required 
            />
          </div>
          <button className={styles.button} type="submit">Log In</button>
        </form>
        {message && <div className={styles.message}>{message}</div>}
        <div className={styles.linkGroup}>
          Don't have an account? <Link href="/register" className={styles.link}>Sign up</Link>
        </div>
      </div>
      <footer>
        <p>© 2026 Buddy Budget - CSE499 Project</p>
      </footer>
    </div>
  );
}