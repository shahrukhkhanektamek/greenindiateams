// src/screens/MyAddressScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import appstyles, { colors } from "../assets/app";

export default function MyAddressScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([
    {
      id: "1",
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123, Green Park, New Delhi, India - 110016",
      type: "Home",
    },
    {
      id: "2",
      name: "John Doe",
      phone: "+91 9876543210",
      address: "Flat 202, Sky Tower, Mumbai, India - 400001",
      type: "Office",
    },
  ]);

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ScrollView
      style={[{ backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={() => console.log("Settings")}>
          <Icon name="settings-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* 🔹 Address List */}
      {addresses.map((item) => (
        <View key={item.id} style={appstyles.card}>
          <View style={styles.addressTop}>
            <Text style={styles.addressType}>{item.type}</Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate("AddAddress", { address: item })
                }
              >
                <Icon name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => deleteAddress(item.id)}
              >
                <Icon name="trash-outline" size={18} color="#f44336" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
          <Text style={styles.fullAddress}>{item.address}</Text>
        </View>
      ))}

      {/* 🔹 Add Address Button */}
      <TouchableOpacity
        style={appstyles.loginBtn}
        onPress={() => navigation.navigate("AddAddress")}
      >
        <Icon name="add-circle-outline" size={22} color={colors.white} />
        <Text style={[appstyles.loginBtnText, { marginLeft: 8 }]}>
          Add New Address
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: colors.white,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },

  addressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addressType: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: "600",
    overflow: "hidden",
  },
  actionBtn: {
    marginLeft: 10,
    backgroundColor: "#f6f6f6",
    padding: 6,
    borderRadius: 8,
  },
  name: { fontSize: 16, fontWeight: "700", color: colors.black },
  phone: { fontSize: 14, color: colors.grey, marginVertical: 4 },
  fullAddress: { fontSize: 14, color: "#444", lineHeight: 20 },
});
