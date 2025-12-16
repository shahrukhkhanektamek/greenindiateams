import React, { useContext, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { AppContext } from "../Context/AppContext";
import { useNavigation } from "@react-navigation/native";

export default function FooterBar() {
  const navigation = useNavigation();
  const { drawerOpen, setDrawerOpen } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("Shop");

  return (
    <View style={styles.bottomTab}>
      <TabItem
        icon="home-outline"
        label="Shop"
        active={activeTab === "Shop"}
        onPress={() => {setActiveTab("Shop");navigation.navigate('Home')}}
      />
      <TabItem
        icon="bag-handle-outline"
        label="Orders"
        active={activeTab === "Orders"}
        onPress={() => {setActiveTab("Orders");navigation.navigate('Order')}}
      />
      <TabItem
        icon="storefront-outline"
        label="Shop"
        active={activeTab === "Store"}
        onPress={() => {setActiveTab("Store");navigation.navigate('Shop')}}
      />
      <TabItem
        icon="cart-outline"
        label="Cart"
        active={activeTab === "Cart"}
        onPress={() => {setActiveTab("Cart");navigation.navigate('Cart')}}
      />
      <TabItem
        icon="person-outline"
        label="Profile"
        active={activeTab === "Profile"}
        onPress={() => {setActiveTab("Profile");navigation.navigate('Profile')}}
      />
    </View>
  );
}

function TabItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabItem, active && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={24} color={active ? "#4caf50" : "#888"} />
      <Text style={[styles.tabLabel, active && { color: "#4caf50" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomTab: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#e6f3e8",
  },
  tabLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },
});
