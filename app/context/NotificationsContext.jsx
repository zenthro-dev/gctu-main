import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const indexNumber = user.email.split("@")[0];
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("index_number", indexNumber)
        .single();
      if (studentError || !student) throw new Error("Student profile not found");

      // Fetch hidden notifications/announcements
      const { data: hiddenItems, error: hiddenError } = await supabase
        .from("hidden_notifications")
        .select("notification_id, is_announcement")
        .eq("user_id", user.id);
      if (hiddenError) throw hiddenError;

      const hiddenNotifIds = new Set(
        hiddenItems?.filter((h) => !h.is_announcement).map((h) => h.notification_id) || []
      );
      const hiddenAnnounIds = new Set(
        hiddenItems?.filter((h) => h.is_announcement).map((h) => h.notification_id) || []
      );

      // Fetch personal notifications
      let notificationsQuery = supabase
        .from("notifications")
        .select("*")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });

      if (hiddenNotifIds.size > 0) {
        notificationsQuery = notificationsQuery.not("id", "in", `(${Array.from(hiddenNotifIds).join(",")})`);
      }

      const { data: personalNotifs, error: personalError } = await notificationsQuery;
      if (personalError) throw personalError;

      // Fetch announcements
      let announcementsQuery = supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (hiddenAnnounIds.size > 0) {
        announcementsQuery = announcementsQuery.not("id", "in", `(${Array.from(hiddenAnnounIds).join(",")})`);
      }

      const { data: generalNotifs, error: generalError } = await announcementsQuery;
      if (generalError) throw generalError;

      // Fetch read statuses for announcements
      const { data: readStatuses, error: readError } = await supabase
        .from("announcement_reads")
        .select("announcement_id")
        .eq("user_id", user.id);
      if (readError) throw readError;

      const readAnnouncementIds = new Set(readStatuses?.map((r) => r.announcement_id) || []);

      setNotifications(personalNotifs || []);
      setAnnouncements(
        (generalNotifs || []).map((a) => ({
          ...a,
          read: readAnnouncementIds.has(a.id),
        }))
      );

      const unreadNotifs = (personalNotifs || []).filter((n) => !n.read).length;
      const unreadAnnouns = (generalNotifs || []).filter((a) => !readAnnouncementIds.has(a.id)).length;
      setUnreadCount(unreadNotifs + unreadAnnouns);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId, isAnnouncement = false) => {
    try {
      if (!isAnnouncement) {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notificationId);
        if (error) throw error;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      } else {
        const { error } = await supabase
          .from("announcement_reads")
          .upsert(
            { user_id: user.id, announcement_id: notificationId },
            { onConflict: ["user_id", "announcement_id"] }
          );
        if (error) throw error;

        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann.id === notificationId ? { ...ann, read: true } : ann
          )
        );
      }
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error.message);
    }
  };

  const markAllAsRead = async () => {
    if (!user || (notifications.length === 0 && announcements.length === 0))
      return;

    try {
      const unreadNotifIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id);
      if (unreadNotifIds.length > 0) {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .in("id", unreadNotifIds);
        if (error) throw error;
      }

      const unreadAnnounIds = announcements
        .filter((a) => !a.read)
        .map((a) => a.id);
      if (unreadAnnounIds.length > 0) {
        const readEntries = unreadAnnounIds.map((id) => ({
          user_id: user.id,
          announcement_id: id,
        }));
        const { error } = await supabase
          .from("announcement_reads")
          .upsert(readEntries, { onConflict: ["user_id", "announcement_id"] });
        if (error) throw error;
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setAnnouncements((prev) => prev.map((ann) => ({ ...ann, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error.message);
    }
  };

  const deleteNotifications = async (ids, isAnnouncement = false) => {
    try {
      const hiddenEntries = ids.map((id) => ({
        user_id: user.id,
        notification_id: id,
        is_announcement: isAnnouncement,
      }));
      const { error } = await supabase
        .from("hidden_notifications")
        .upsert(hiddenEntries, { onConflict: ["user_id", "notification_id", "is_announcement"] });
      if (error) throw error;

      if (!isAnnouncement) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      } else {
        setAnnouncements((prev) => prev.filter((a) => !ids.includes(a.id)));
      }
      setUnreadCount((prev) => Math.max(0, prev - ids.filter((id) => {
        const item = isAnnouncement
          ? announcements.find((a) => a.id === id)
          : notifications.find((n) => n.id === id);
        return item && !item.read;
      }).length));
    } catch (error) {
      console.error("Error hiding notifications:", error.message);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const notificationSubscription = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          const indexNumber = user.email.split("@")[0];
          const { data: student } = await supabase
            .from("students")
            .select("id")
            .eq("index_number", indexNumber)
            .single();
          if (payload.new.student_id === student?.id) {
            setNotifications((prev) => [payload.new, ...prev]);
            if (!payload.new.read) setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    const announcementSubscription = supabase
      .channel("public:announcements")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        (payload) => {
          setAnnouncements((prev) => [
            { ...payload.new, read: false },
            ...prev,
          ]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationSubscription);
      supabase.removeChannel(announcementSubscription);
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        announcements,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);