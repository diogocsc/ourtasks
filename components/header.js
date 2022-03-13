import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0';
import styles from './header.module.css'

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header () {
  const { user, error, isLoading } = useUser();
    // If user exists, display content
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;
  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
      {user && <>
      <nav className={styles.navigation}>
        <ul className={styles.navItems}>
          <li className={styles.navItem}><Link href="/"><a>Home</a></Link></li>
          <li className={styles.navItem}><Link href="/tasks/taskEdit"><a>New Task</a></Link></li>
        </ul>
      </nav>
      </>

      }
        
          {user && <>
            <span className={styles.signedInText}>
            <img className={styles.email} src={user.picture} alt={user.name} width="30px" height="30px"/>
              Signed in as 
                <strong className={styles.email}>{user.email || user.name}</strong>
                <a href="/api/auth/logout">Logout</a>

              </span>
             
          </>}
      </div>
      
    </header>
  )
}
