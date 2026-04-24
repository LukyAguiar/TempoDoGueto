"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  slug: string;
};

export function CopyLinkButton({ slug }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copiar link público"
      className="transition-colors"
      style={{ color: copied ? "#22c55e" : "#71717a" }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}
