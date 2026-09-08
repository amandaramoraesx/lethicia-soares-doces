"use client";

import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";
import { createSession } from "@/actions/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(getClientAuth(), email, password);
      const idToken = await credential.user.getIdToken();
      const result = await createSession(idToken);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200"
      >
        <h1 className="mb-1 text-xl font-semibold text-stone-800">Painel da loja</h1>
        <p className="mb-6 text-sm text-stone-500">Lethícia Soares Doces</p>

        <label className="mb-1 block text-sm font-medium text-stone-700">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
        />

        <label className="mb-1 block text-sm font-medium text-stone-700">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
