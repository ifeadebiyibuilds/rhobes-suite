import { useState } from "react";
import { C } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { error } = await signIn(email, password);
    if (error) setErr(error.message);
    setBusy(false);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text,
      fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 340, background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.goldBg,
          border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.gold, marginBottom: 16 }}>R</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, fontFamily: "Georgia,serif" }}>Rhobes Suite</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Sign in to continue</div>

        <input type="email" placeholder="Email" value={email} required
          onChange={e => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10, padding: "10px 12px",
            borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceAlt,
            color: C.text, fontSize: 13, boxSizing: "border-box" }} />
        <input type="password" placeholder="Password" value={password} required
          onChange={e => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 14, padding: "10px 12px",
            borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceAlt,
            color: C.text, fontSize: 13, boxSizing: "border-box" }} />

        {err && <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>{err}</div>}

        <button type="submit" disabled={busy}
          style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none",
            background: C.gold, color: "#000", fontSize: 14, fontWeight: 700,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <div style={{ fontSize: 11, color: C.muted, marginTop: 16, lineHeight: 1.6 }}>
          Accounts are created from the Supabase dashboard (Authentication → Users) —
          there's no self-signup yet. Ask the owner for a login.
        </div>
      </form>
    </div>
  );
}
