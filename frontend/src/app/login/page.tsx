import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-foreground">Sign in to Notes</h1>
        <LoginForm />
      </div>
    </div>
  );
}
