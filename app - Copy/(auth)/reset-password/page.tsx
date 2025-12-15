"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import { Button, Input, Label, Logo } from "@/components/ui";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-8 py-6">
        <Link href="/">
          <Logo className="w-48 h-48" />
        </Link>
        <Link href="/signin" className="text-sm text-gray-500 hover:text-blue-600">
          Login
        </Link>
      </div>

      {/* Center Form */}
      <div className="flex items-center justify-center flex-1">
        <div className="w-full max-w-md p-8">   
          <h2 className="mb-2 text-2xl font-semibold text-center">
            Reset your password
          </h2>
          <p className="mb-6 text-sm text-center text-gray-500">
            Please set a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="mb-1">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-sm text-center text-green-600">
                Password updated! Redirecting...
              </p>
            )}

            <Button
               color='primary'
            size='medium'
            variant='solid'
            type='submit'
              className="w-full mt-1"
              loading={loading}
              disabled={loading}
            >
              Set Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
