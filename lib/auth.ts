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