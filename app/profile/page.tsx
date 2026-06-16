import { ProfileContent, ProfileSkeleton } from "@/components/profile-content";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
    </Suspense>
  );
}
