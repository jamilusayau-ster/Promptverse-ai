"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
  text,
  label = "Copy Prompt",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for browsers/contexts without Clipboard API permission
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied — fail silently, button just won't flip
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
        copied ? "bg-green-500/15 text-green-400" : "bg-electric/15 text-electric hover:bg-electric/25"
      }`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" /> Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> {label}
        </>
      )}
    </button>
  );
}
