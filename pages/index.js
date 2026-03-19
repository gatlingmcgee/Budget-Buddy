export default function Home() {
  return (
    <div>
      <header>
        <nav>
          <h1>Dashboard overview for Budget Buddy</h1>
          <div className="nav-links">
            <a href="login">Login Page</a>
            <a href="#">Budget Page</a>
            <a href="#">Expense Tracking Page</a>
            <a href="#">Enhancement Page</a>
          </div>
        </nav>

        <section>
          <h1>Visualization for Enhancements</h1>
        </section>
      </header>

      <footer>
        <p>© 2026 Buddy Budget</p>
      </footer>
    </div>
  );
}

async function testBackend() {
  try {
    const res = await fetch('/api/test');
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert('Backend not reachable');
  }
}