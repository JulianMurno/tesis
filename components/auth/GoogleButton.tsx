"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl: "/dashboard" });
      }}
      disabled={loading}
      className="btn-primary w-full py-3 text-base"
    >
      {loading ? (
        <><i className="fa-solid fa-spinner fa-spin" /> Conectando con Google…</>
      ) : (
        <><i className="fa-brands fa-google" /> {label}</>
      )}
    </button>
  );
}
