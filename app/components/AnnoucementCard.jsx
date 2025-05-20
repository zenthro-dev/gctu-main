// Create AnnouncementCard component
const AnnouncementCard = ({ announcement }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/announcement-detail",
      params: { id: announcement.id },
    });
  };

  // Format date to display nicely
  const formattedDate = new Date(announcement.published_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.announcementCard,
        pressed && styles.pressedCard,
      ]}
      onPress={handlePress}
    >
      <View style={styles.announcementMeta}>
        <Text style={styles.announcementDate}>{formattedDate}</Text>
        {announcement.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{announcement.category}</Text>
          </View>
        )}
      </View>

      <Text style={styles.announcementTitle} numberOfLines={2}>
        {announcement.title}
      </Text>

      <Text style={styles.announcementPreview} numberOfLines={2}>
        {announcement.content}
      </Text>
    </Pressable>
  );
};

export default AnnouncementCard;