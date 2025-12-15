"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadPromoCSVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setFileName(f.name);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/promo-links/import", {
      method: "POST",
      body: form, // ← IMPORTANT — no manual header!
    });

    const result = await res.json();
    setLoading(false);

    console.log("IMPORT RESULT:", result);

    if (!res.ok) {
      alert(result.error || "Import failed.");
      return;
    }

    alert(result.message || "CSV imported successfully!");
  };

  return (
    <div className="p-8 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Import Subscriptions CSV</h1>

      {/* FILE INPUT */}
      <input
        type="file"
        accept=".csv"
        className="border p-3 rounded-lg"
        onChange={handleFileUpload}
      />

      {/* FILE PREVIEW */}
      {file && (
        <div className="p-4 rounded-lg bg-white border shadow space-y-3">
          <p>
            Selected file: <strong>{fileName}</strong>
          </p>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Importing..." : "Import CSV"}
          </Button>
        </div>
      )}
    </div>
  );
}
