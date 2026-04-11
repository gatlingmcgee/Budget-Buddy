import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

/**
 * Landing Page Component.
 * Responsive component that switches the hero interface based on user authentication status.
 * Unauthenticated users see marketing copy; authenticated users see a personalized greeting and dashboard shortcut.
 */

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
      <Head>
        <title>Budget Buddy - Home</title>
        <meta name="description" content="Manage your expenses effortlessly with Budget Buddy" />
      </Head>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '3rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          maxWidth: '650px',
          width: '100%'
        }}>
          {session ? (
            <>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333', margin: '0 0 1rem 0' }}>
                Welcome back, <span style={{ color: '#2563eb' }}>{session.user.username}</span>!
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                Ready to manage your finances today? Let's take a look at your recent expenses and budget.
              </p>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  background: '#000',
                  color: '#fff',
                  padding: '0.8rem 2.5rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'background 0.3s ease',
                }}
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '3rem', marginBottom: '1.2rem', color: '#333', lineHeight: '1.2', margin: '0 0 1.2rem 0' }}>
                Poupe mais, se preocupe menos.
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                Budget Buddy helps you track your expenses, set budgets, and achieve your financial goals without the hassle.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/register"
                  style={{
                    background: '#000',
                    color: '#fff',
                    padding: '0.8rem 2.5rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    border: '2px solid #000',
                  }}
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: '0.8rem 2.5rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    border: '2px solid #ccc',
                  }}
                >
                  Log In
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#6b7280' }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>© 2026 Buddy Budget - CSE499 Project</p>
      </footer>
    </div>
  );
}