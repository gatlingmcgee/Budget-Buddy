import { useState } from "react";

export default function Register() {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    setMessage(data.message);
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" required />
        <input name="email" placeholder="Email" type="email" required />
        <input name="password" placeholder="Password" type="password" required />
        <button type="submit">Register</button>
        <a href="login">Login Page</a>
      </form>
      <p>{message}</p>
    </div>
  );
}