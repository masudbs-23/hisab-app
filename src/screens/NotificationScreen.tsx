import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

interface Notification {
  id: string;
  type: 'info' | 'promo' | 'update' | 'ad';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const NotificationScreen = ({navigation}: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'promo',
      title: 'বিশেষ অফার!',
      message: 'এই মাসে হিসাব প্রিমিয়ামে ৫০% ছাড়! আপনার আর্থিক পরিচালনা আরও সহজ করুন।',
      time: '২ ঘন্টা আগে',
      isRead: false,
      icon: 'gift',
      iconColor: '#FF6B6B',
      iconBg: '#FFE5E5',
    },
    {
      id: '2',
      type: 'update',
      title: 'নতুন ফিচার যুক্ত হয়েছে',
      message: 'এখন আপনি প্রোফাইল ছবি আপলোড করতে পারবেন এবং আরও অনেক কিছু!',
      time: '৫ ঘন্টা আগে',
      isRead: false,
      icon: 'sparkles',
      iconColor: '#4A90E2',
      iconBg: '#E3F2FD',
    },
    {
      id: '3',
      type: 'ad',
      title: 'হিসাব প্রিমিয়াম',
      message: 'অসীম লেনদেন, ক্লাউড ব্যাকআপ, এবং আরও অনেক ফিচার পান প্রিমিয়ামে!',
      time: '১ দিন আগে',
      isRead: true,
      icon: 'trophy',
      iconColor: '#F39C12',
      iconBg: '#FFF4E5',
    },
    {
      id: '4',
      type: 'info',
      title: 'লেনদেন সিঙ্ক সফল',
      message: 'আপনার শেষ ১০টি SMS লেনদেন সফলভাবে যুক্ত করা হয়েছে।',
      time: '২ দিন আগে',
      isRead: true,
      icon: 'checkmark-circle',
      iconColor: '#00b894',
      iconBg: '#E8F8F5',
    },
    {
      id: '5',
      type: 'promo',
      title: 'রেফার করুন এবং পান',
      message: 'বন্ধুকে রেফার করুন এবং উভয়েই পান ১ মাস ফ্রি প্রিমিয়াম!',
      time: '৩ দিন আগে',
      isRead: true,
      icon: 'people',
      iconColor: '#9B59B6',
      iconBg: '#F4ECF7',
    },
    {
      id: '6',
      type: 'ad',
      title: 'বাজেট প্ল্যানার টুল',
      message: 'নতুন বাজেট প্ল্যানার দিয়ে আপনার মাসিক খরচ পরিকল্পনা করুন।',
      time: '৫ দিন আগে',
      isRead: true,
      icon: 'calculator',
      iconColor: '#3498db',
      iconBg: '#EBF5FB',
    },
    {
      id: '7',
      type: 'info',
      title: 'স্বাগতম হিসাবে!',
      message: 'আপনার আর্থিক লেনদেন পরিচালনার জন্য সেরা অ্যাপ ব্যবহার করার জন্য ধন্যবাদ।',
      time: '১ সপ্তাহ আগে',
      isRead: true,
      icon: 'hand-left',
      iconColor: '#00b894',
      iconBg: '#E8F8F5',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? {...notif, isRead: true} : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({...notif, isRead: true})),
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'promo':
        return 'প্রচার';
      case 'ad':
        return 'বিজ্ঞাপন';
      case 'update':
        return 'আপডেট';
      case 'info':
        return 'তথ্য';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}>
            <Icon name="checkmark-done" size={20} color="#4A90E2" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={80} color="#b2bec3" />
            <Text style={styles.emptyTitle}>কোনো নোটিফিকেশন নেই</Text>
            <Text style={styles.emptySubtitle}>
              নতুন নোটিফিকেশন এখানে দেখা যাবে
            </Text>
          </View>
        ) : (
          <View style={styles.notificationList}>
            {notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadCard,
                ]}
                onPress={() => markAsRead(notification.id)}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.iconContainer,
                    {backgroundColor: notification.iconBg},
                  ]}>
                  <Icon
                    name={notification.icon}
                    size={24}
                    color={notification.iconColor}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text
                    style={styles.notificationMessage}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {notification.message}
                  </Text>

                  <View style={styles.notificationFooter}>
                    <View
                      style={[
                        styles.typeBadge,
                        notification.type === 'ad' && styles.adBadge,
                        notification.type === 'promo' && styles.promoBadge,
                      ]}>
                      <Text style={styles.typeBadgeText}>
                        {getNotificationTypeLabel(notification.type)}
                      </Text>
                    </View>
                    <Text style={styles.notificationTime}>
                      {notification.time}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Decorative Elements */}
      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 10,
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  notificationList: {
    padding: 15,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  unreadCard: {
    backgroundColor: '#f0f8ff',
    borderColor: '#4A90E2',
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adBadge: {
    backgroundColor: '#FFF4E5',
  },
  promoBadge: {
    backgroundColor: '#FFE5E5',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#636e72',
  },
  notificationTime: {
    fontSize: 12,
    color: '#b2bec3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#b2bec3',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#00b894',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#00a085',
    bottom: -75,
    left: -75,
  },
});

export default NotificationScreen;

