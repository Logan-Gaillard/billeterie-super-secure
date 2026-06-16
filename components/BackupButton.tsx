"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BackupButton() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/backup");

      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        throw new Error("Backup failed");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Backup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBackup}
      disabled={loading}
      variant="outline"
      className="justify-start w-full"
    >
      {loading ? "Sauvegarde..." : "Télécharger backup BDD"}
    </Button>
  );
}