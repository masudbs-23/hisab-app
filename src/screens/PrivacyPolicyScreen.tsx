import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const {height} = Dimensions.get('window');

const PrivacyPolicyScreen = ({navigation}: any) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>গোপনীয়তা নীতি</Text>
          <Text style={styles.paragraph}>
            হিসাব অ্যাপ আপনার আর্থিক লেনদেন পরিচালনা করতে সাহায্য করে। আমরা আপনার
            গোপনীয়তা এবং ডেটা সুরক্ষাকে অত্যন্ত গুরুত্ব দিই।
          </Text>
        </View>

        {/* SMS Permission */}
        <View style={styles.section}>
          <View style={styles.permissionHeader}>
            <Icon name="mail-outline" size={28} color="#4A90E2" />
            <Text style={styles.permissionTitle}>SMS পারমিশন</Text>
          </View>
          
          <Text style={styles.subtitle}>কেন আমরা SMS পারমিশন চাই?</Text>
          
          <View style={styles.bulletContainer}>
            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>স্বয়ংক্রিয় লেনদেন ট্র্যাকিং:</Text> আপনার
                  bKash, Nagad, বা ব্যাংক SMS থেকে স্বয়ংক্রিয়ভাবে লেনদেন তথ্য
                  সংগ্রহ করতে।
                </Text>
              </View>
            </View>

            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>সময় সাশ্রয়:</Text> ম্যানুয়ালি লেনদেন
                  এন্ট্রি করার প্রয়োজন নেই।
                </Text>
              </View>
            </View>

            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>সঠিক রেকর্ড:</Text> SMS থেকে সরাসরি ডেটা
                  নিয়ে নির্ভুল আর্থিক রেকর্ড রাখুন।
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Camera Permission */}
        <View style={styles.section}>
          <View style={styles.permissionHeader}>
            <Icon name="camera-outline" size={28} color="#4A90E2" />
            <Text style={styles.permissionTitle}>ক্যামেরা ও গ্যালারি পারমিশন</Text>
          </View>
          
          <Text style={styles.subtitle}>কেন আমরা ক্যামেরা পারমিশন চাই?</Text>
          
          <View style={styles.bulletContainer}>
            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>প্রোফাইল ছবি:</Text> আপনার প্রোফাইলে
                  ছবি যোগ করতে ক্যামেরা বা গ্যালারি ব্যবহার করুন।
                </Text>
              </View>
            </View>

            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>ব্যক্তিগতকরণ:</Text> আপনার অ্যাকাউন্ট
                  আরও ব্যক্তিগত করুন।
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Data Storage */}
        <View style={styles.section}>
          <View style={styles.permissionHeader}>
            <Icon name="shield-checkmark-outline" size={28} color="#00b894" />
            <Text style={styles.permissionTitle}>ডেটা সংরক্ষণ ও নিরাপত্তা</Text>
          </View>
          
          <View style={styles.bulletContainer}>
            <View style={styles.bulletPoint}>
              <Icon name="phone-portrait-outline" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>স্থানীয় সংরক্ষণ:</Text> সমস্ত ডেটা আপনার
                  ফোনে স্থানীয়ভাবে সংরক্ষিত থাকে।
                </Text>
              </View>
            </View>

            <View style={styles.bulletPoint}>
              <Icon name="cloud-offline-outline" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>কোনো ক্লাউড সার্ভার নেই:</Text> আমরা
                  কোনো বাহ্যিক সার্ভারে আপনার ডেটা পাঠাই না।
                </Text>
              </View>
            </View>

            <View style={styles.bulletPoint}>
              <Icon name="lock-closed-outline" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>সম্পূর্ণ গোপনীয়তা:</Text> আপনার আর্থিক
                  তথ্য শুধুমাত্র আপনার ডিভাইসে থাকে।
                </Text>
              </View>
            </View>

            <View style={styles.bulletPoint}>
              <Icon name="trash-outline" size={20} color="#00b894" />
              <View style={styles.bulletText}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>আপনার নিয়ন্ত্রণ:</Text> অ্যাপ আনইনস্টল
                  করলে সব ডেটা মুছে যাবে।
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>সর্বশেষ আপডেট: জানুয়ারি ২০২৫</Text>
          <Text style={styles.footerText}>হিসাব অ্যাপ v1.0.0</Text>
        </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2d3436',
  },
  bulletContainer: {
    marginTop: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  bulletText: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#b2bec3',
    marginBottom: 5,
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

export default PrivacyPolicyScreen;

