"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-6">
      <SignUp
        appearance={{
          elements: {
            card: "bg-gray-900 border border-gray-800 text-white",
          },
        }}
      />
    </main>
  );
}