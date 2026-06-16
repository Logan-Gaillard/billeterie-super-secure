"use client";

import { Button } from "@/components/ui/button";
import { deleteUserAction } from "../actions";

export function DeleteUserButton({ userId }: { userId: string }) {
  return (
    <form 
      action={async () => {
        if (confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) {
          await deleteUserAction(userId);
        }
      }}
    >
      <Button type="submit" size="sm" variant="ghost" className="text-destructive">
        🗑️
      </Button>
    </form>
  );
}
