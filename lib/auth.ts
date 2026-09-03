import { currentUser } from "@clerk/nextjs/server";

import { connectToDatabase } from "@/database";

import User from "@/database/user.model";

export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  await connectToDatabase();

  const user = await User.findOne({
    clerkId: clerkUser.id,
  });

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      message: "Authentication required",
      user: null,
    };
  }

  if (user.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      message: "Admin access required",
      user,
    };
  }

  return {
    authorized: true,
    status: 200,
    message: "Authorized",
    user,
  };
}