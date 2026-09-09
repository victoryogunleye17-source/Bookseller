import { getCurrentUser } from "@/lib/auth";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return <ProfileForm user={user} />;
}
