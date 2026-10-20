import React from 'react'
import './styles.css'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

const styles = `
  :root {
    --site-fg: #111827;
    --site-muted: #6b7280;
    --site-bg: #ffffff;
    --site-surface: #f3f4f6;
    --site-border: #e5e7eb;
    --site-accent: #0070f3;
    --site-accent-hover: #005bc4;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --site-fg: #f3f4f6;
      --site-muted: #9ca3af;
      --site-bg: #0b0f19;
      --site-surface: #111827;
      --site-border: #1f2937;
      --site-accent: #3b82f6;
      --site-accent-hover: #60a5fa;
    }
  }

  body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0;
    color: var(--site-fg);
    background: var(--site-bg);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  .site-content { flex: 1; }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--site-bg);
    border-bottom: 1px solid var(--site-border);
  }
  .site-header-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1.5rem;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0.875rem 1.5rem;
  }

  .site-logo {
    color: var(--site-fg);
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    text-decoration: none;
  }

  .site-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1.5rem;
  }
  .site-nav-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .site-nav-link {
    color: var(--site-muted);
    font-size: 0.9375rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .site-nav-link:hover { color: var(--site-fg); }

  .site-user {
    max-width: 220px;
    overflow: hidden;
    padding: 0.375rem 0.875rem;
    color: var(--site-fg);
    background: var(--site-surface);
    border-radius: 999px;
    font-size: 0.875rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .site-login {
    padding: 0.5rem 1.125rem;
    color: #fff;
    background: var(--site-accent);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }
  .site-login:hover { background: var(--site-accent-hover); }
  .site-logout {
    padding: 0.5rem 1.125rem;
    color: var(--site-fg);
    background: transparent;
    border: 1px solid var(--site-border);
    border-radius: 8px;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }
  .site-logout:hover { border-color: var(--site-accent); }
  .site-logout:disabled { opacity: 0.6; cursor: default; }

  .site-logo:focus-visible,
  .site-nav-link:focus-visible,
  .site-login:focus-visible,
  .site-logout:focus-visible {
    outline: 3px solid var(--site-accent);
    outline-offset: 3px;
    border-radius: 4px;
  }

  .site-footer {
    border-top: 1px solid var(--site-border);
    color: var(--site-muted);
    font-size: 0.875rem;
  }
  .site-footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.5rem;
  }
`

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Internal links use next/link for client-side navigation; external ones stay plain anchors
  if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:')) {
    return (
      <a href={href} className="site-nav-link">
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className="site-nav-link">
      {children}
    </Link>
  )
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: configPromise })

  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  const headerData = await payload.findGlobal({
    slug: 'header',
  })

  return (
    <html lang="en">
      <body>
        <style>{styles}</style>

        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="site-logo">
              {headerData.logoText}
            </Link>

            <nav className="site-nav" aria-label="Main">
              <ul className="site-nav-list">
                {headerData.navItems?.map((item, index) => (
                  <li key={item.id ?? index}>
                    <NavLink href={item.link}>{item.label}</NavLink>
                  </li>
                ))}
                <li>
                  <NavLink href="/categories">Categories</NavLink>
                </li>
                <li>
                  <NavLink href="/authors">Authors</NavLink>
                </li>
              </ul>

              {user ? (
                <>
                  <span className="site-user" title={user.email}>
                    {user.email}
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login" className="site-login">
                  Log in
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="site-content">{children}</div>

        <footer className="site-footer">
          <div className="site-footer-inner">
            © {new Date().getFullYear()} {headerData.logoText}
          </div>
        </footer>
      </body>
    </html>
  )
}