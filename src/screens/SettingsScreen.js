// src/screens/SettingsScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import appstyles, { colors } from "../assets/app";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isNotificationOn, setIsNotificationOn] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => Alert.alert("Logged Out") },
    ]);
  };

  return (
    <ScrollView
      style={[{ backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.sectionCard}>
        <SettingItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <SettingItem
          icon="location-outline"
          label="My Addresses"
          onPress={() => navigation.navigate("MyAddress")}
        />
      </View>

      {/* App Settings Section */}
      <Text style={styles.sectionTitle}>App Settings</Text>
      <View style={styles.sectionCard}>
        <SettingSwitch
          icon="notifications-outline"
          label="Notifications"
          value={isNotificationOn}
          onValueChange={() => setIsNotificationOn(!isNotificationOn)}
        />
        <SettingSwitch
          icon="moon-outline"
          label="Dark Mode"
          value={isDarkMode}
          onValueChange={() => setIsDarkMode(!isDarkMode)}
        />
        <SettingItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => navigation.navigate("HelpSupport")}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#f44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ✅ Reusable Components */
const SettingItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Icon name={icon} size={22} color={colors.primary} />
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    <Icon name="chevron-forward" size={20} color={colors.grey} />
  </TouchableOpacity>
);

const SettingSwitch = ({ icon, label, value, onValueChange }) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <Icon name={icon} size={22} color={colors.primary} />
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={value ? colors.primary : "#ccc"}
    />
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingVertical: 18,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.grey,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  sectionCard: {
    ...appstyles.card,
    paddingHorizontal: 0,
    marginHorizontal: 15,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.black,
    fontWeight: "500",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f44336",
    marginLeft: 8,
  },
});
