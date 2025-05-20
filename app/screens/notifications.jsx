import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format, formatDistanceToNow } from "date-fns";
import { useNotifications } from "../context/NotificationsContext";

const NotificationItem = ({ item, onPress, onLongPress, isSelected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isToday = (date) => {
    const today = new Date();
    const itemDate = new Date(date);
    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (date) => {
    if (isToday(date))
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    return format(new Date(date), "MMM d, yyyy");
  };

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    onPress(item);
  };

  const truncateMessage = (message) => {
    const maxLength = 50;
    if (message.length > maxLength && !isExpanded)
      return message.substring(0, maxLength) + "...";
    return message;
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadItem,
        isSelected && styles.selectedItem,
      ]}
      onPress={handlePress}
      onLongPress={() => onLongPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        <View
          style={[
            styles.iconBackground,
            { backgroundColor: item.color || "#3b82f6" },
          ]}
        >
          <Ionicons
            name={item.icon || "notifications-outline"}
            size={20}
            color="#fff"
          />
        </View>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text
          style={styles.notificationBody}
          numberOfLines={isExpanded ? 0 : 2}
        >
          {truncateMessage(item.message)}
        </Text>
        <Text style={styles.notificationTime}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [selectedItems, setSelectedItems] = useState([]);
  const router = useRouter();
  const {
    notifications,
    announcements,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setSelectedItems([]);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (item) => {
    if (selectedItems.length > 0) {
      toggleSelection(item);
    } else {
      markAsRead(item.id, activeTab === "announcements");
      if (item.action_url) router.push(item.action_url);
    }
  };

  const handleLongPress = (item) => {
    toggleSelection(item);
  };

  const toggleSelection = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    await deleteNotifications(selectedItems, activeTab === "announcements");
    setSelectedItems([]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#0f172a" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      {selectedItems.length > 0 ? (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete ({selectedItems.length})</Text>
        </TouchableOpacity>
      ) : unreadCount > 0 ? (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="bell-off" size={60} color="#cbd5e1" />
      <Text style={styles.emptyStateText}>
        No {activeTab === "notifications" ? "notifications" : "announcements"}{" "}
        yet
      </Text>
      <Text style={styles.emptyStateSubtext}>
        We'll notify you when something important happens
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={true} />
      {renderHeader()}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "notifications" && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab("notifications");
            setSelectedItems([]);
          }}
        >
          <Text
            
            style={[
              styles.tabText,
              activeTab === "notifications" && styles.activeTabText,
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "announcements" && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab("announcements");
            setSelectedItems([]);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "announcements" && styles.activeTabText,
            ]}
          >
            Announcements
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "notifications" ? notifications : announcements}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onPress={handleNotificationPress}
              onLongPress={handleLongPress}
              isSelected={selectedItems.includes(item.id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3b82f6"]}
            />
          }
          ListEmptyComponent={renderEmptyState()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginLeft: 16,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#ffffff",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 0,
    position: "relative",
  },
  unreadItem: {
    backgroundColor: "#f0f9ff",
  },
  notificationIconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    paddingRight: 24,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  unreadDot: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  selectedItem: {
    backgroundColor: "#e5e7eb",
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  deleteText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
  },
});

export default Notifications;
