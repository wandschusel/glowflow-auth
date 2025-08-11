import Link from "next/link";
import { stackServerApp } from "@/stack";

export default async function Home() {
  const user = await stackServerApp.getUser(); // null if not logged in
  return (
    <main style={{padding: 24, fontFamily: "system-ui"}}>
      <h1>GlowFlow Auth</h1>
      {user ? (
        <>
          <p>Angemeldet als <b>{user.displayName ?? user.primaryEmail}</b></p>
          <p><a href="/handler/account-settings">Account Settings</a> · <a href="/handler/sign-out">Logout</a></p>
          <p><a href="/api/glowflow">API testen (GET)</a></p>
        </>
      ) : (
        <>
          <p>Du bist nicht eingeloggt.</p>
          <p><Link href="/handler/sign-in">Einloggen</Link> · <Link href="/handler/sign-up">Registrieren</Link></p>
        </>
      )}
    </main>
  );
}
