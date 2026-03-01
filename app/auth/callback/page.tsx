"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase implicit flow puts tokens in the URL fragment
      const hashParams = new URLSearchParams(
        window.location.hash.substring(1)
      );
      const accessToken = hashParams.get("access_token");

      if (!accessToken) {
        setError("No authentication token received.");
        return;
      }

      // Send the token to the server to validate and set an httpOnly cookie
      const res = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Authentication failed.");
        return;
      }

      router.push("/admin/guestbook");
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <a
            href="/admin/guestbook"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Authenticating...</p>
    </div>
  );
}
