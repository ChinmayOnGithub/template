/*
 * page.tsx
 * User profile settings page.
 * Manages display name, email preferences, and password updates via Better Auth.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, authClient } from "@/features/auth/auth-client";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { FormField, FormLabel, FormControl } from "@/design-system/components/FormField";
import { Card, CardHeader, CardBody, CardFooter } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";

export default function ProfileSettingsPage() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoadingName(true);

    try {
      const res = await authClient.updateUser({
        name,
      });

      if (res.error) {
        setFeedback({
          type: "error",
          message: res.error.message || "Failed to update profile name",
        });
      } else {
        setFeedback({ type: "success", message: "Profile name updated successfully" });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while updating profile",
      });
    } finally {
      setLoadingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({ type: "error", message: "New password must be at least 8 characters long" });
      return;
    }

    setLoadingPassword(true);

    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        setFeedback({ type: "error", message: res.error.message || "Failed to update password" });
      } else {
        setFeedback({ type: "success", message: "Password updated successfully" });
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while changing password",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--muted-foreground)]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Account Settings</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Manage your identity and security preferences
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {feedback && (
          <div
            className={`rounded-lg border p-3 text-xs ${
              feedback.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Identity & Details Card */}
        <Card>
          <form onSubmit={handleUpdateName}>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Profile Information
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--muted-foreground)]">Account Role</span>
                  <div className="mt-1">
                    <Badge variant="secondary">member</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted-foreground)]">Email Address</span>
                  <p className="text-sm font-medium text-[var(--foreground)] mt-1">
                    {session?.user?.email || "No email available"}
                  </p>
                </div>
              </div>

              <FormField>
                <FormLabel htmlFor="displayName">Display Name</FormLabel>
                <FormControl>
                  <Input
                    id="displayName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={session?.user?.name || "Enter your full name"}
                  />
                </FormControl>
              </FormField>
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="primary" size="sm" disabled={loadingName}>
                {loadingName ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security / Password Card */}
        <Card>
          <form onSubmit={handleUpdatePassword}>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Change Password</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <FormField>
                <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
                <FormControl>
                  <Input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </FormControl>
              </FormField>

              <FormField>
                <FormLabel htmlFor="newPassword">New Password</FormLabel>
                <FormControl>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </FormControl>
              </FormField>
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="secondary" size="sm" disabled={loadingPassword}>
                {loadingPassword ? "Updating password..." : "Update password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
