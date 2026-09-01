import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
      {/* Subtle background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Accent glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
            E
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-foreground-secondary">
            Join EventApp and start discovering events
          </p>
        </div>

        {/* Clerk Authentication */}
        <div className="flex justify-center">
          <SignUp />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs leading-5 text-foreground-muted">
          Discover events, manage bookings, and keep your tickets in one place.
        </p>
      </div>
    </main>
  );
}