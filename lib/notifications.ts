import Notification from "@/database/notification.model";
import NotificationPreference from "@/database/notification-preference.model";

type NotificationPreferenceKey =
  | "bookingConfirmed"
  | "paymentSuccessful"
  | "ticketGenerated"
  | "eventUpdated"
  | "eventCancelled"
  | "eventReminder";

type CreateNotificationParams = {
  userId: string;
  type: string;
  title: string;
  message: string;
  preferenceKey?: NotificationPreferenceKey;
};

export async function createNotification({
  userId,
  type,
  title,
  message,
  preferenceKey,
}: CreateNotificationParams) {
  if (preferenceKey) {
    const preferences = await NotificationPreference.findOne({
      user: userId,
    }).lean();

    if (preferences && preferences[preferenceKey] === false) {
      return null;
    }
  }

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    read: false,
  });
}