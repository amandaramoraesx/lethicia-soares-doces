"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
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
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-pink/30">
        <div className="mb-7 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Lethícia Soares Doces"
            width={80}
            height={80}
            className="mb-3 h-20 w-20 rounded-full object-cover ring-2 ring-pink/50"
            unoptimized
          />
          <p className="font-script text-3xl leading-tight text-pink-deep">Lethícia Soares</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-stone-400">
            Painel da loja
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-pink-deep focus:ring-1 focus:ring-pink-deep"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-pink-deep focus:ring-1 focus:ring-pink-deep"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
