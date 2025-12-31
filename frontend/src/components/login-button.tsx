"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";

function getDiscordAvatarUrl(discordId: string, discordAvatarHash: string | null | undefined) {
  if (!discordId || !discordAvatarHash) {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  const extension = discordAvatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatarHash}.${extension}`;
}

interface LoginButtonProps {
  redirect?: string;
}

export function LoginButton({ redirect }: LoginButtonProps) {
  const { isAuthenticated, isLoading, login, logout, user } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    const avatarUrl = getDiscordAvatarUrl(user.discordId, user.discordAvatarHash);

    // TODO(discord-auth): fallback image if the avatar is not found
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border bg-muted px-2 py-1 shadow-sm">
          <img
            src={avatarUrl}
            alt={`${user.discordUsername} avatar`}
            className="h-7 w-7 rounded-full border border-border/50"
            height={28}
            width={28}
            loading="lazy"
          />
          <span className="text-sm font-medium">{user.discordUsername}</span>
        </div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    );
  }

  const handleLogin = () => {
    if (redirect) {
      login({ redirect });
    } else {
      login();
    }
  };

  return (
    <Button onClick={handleLogin} variant="default">
      Login with Discord
    </Button>
  );
}
