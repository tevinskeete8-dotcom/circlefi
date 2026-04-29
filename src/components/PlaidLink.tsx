import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { supabase } from "../lib/supabase";

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PlaidLinkButton({
  onSuccess,
  onError,
  label = "Connect bank account",
  className,
  style,
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLinkToken = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plaid-link-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
      const json = await res.json();
      if (json.link_token) {
        setLinkToken(json.link_token);
      } else {
        const msg = json.error ?? "Failed to connect bank. Please try again.";
        setError(msg);
        onError?.(msg);
      }
    } catch {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      onError?.(msg);
    }
    setLoading(false);
  };

  const onPlaidSuccess = useCallback(
    async (public_token: string) => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plaid-exchange-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ public_token }),
          }
        );
        const json = await res.json();
        if (json.success) {
          setLinkToken(null);
          onSuccess?.();
        } else {
          const msg = json.error ?? "Failed to save bank connection.";
          setError(msg);
          onError?.(msg);
        }
      } catch {
        const msg = "Something went wrong saving your bank connection.";
        setError(msg);
        onError?.(msg);
      }
      setLoading(false);
    },
    [onSuccess, onError]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: onPlaidSuccess,
    onExit: () => setLinkToken(null),
  });

  // Once we have a token and Plaid is ready, open automatically
  if (linkToken && ready) {
    open();
  }

  return (
    <div>
      {error && (
        <p style={{ color: "#EF4444", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
          ⚠ {error}
        </p>
      )}
      <button
        className={className}
        style={style}
        onClick={fetchLinkToken}
        disabled={loading || (!!linkToken && !ready)}
      >
        {loading ? <span className="spinner" /> : `🏦 ${label}`}
      </button>
    </div>
  );
}
