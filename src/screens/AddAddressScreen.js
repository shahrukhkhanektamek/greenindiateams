// src/screens/AddAddressScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import appstyles, { colors } from "../assets/app";

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Home");
  const [address, setAddress] = useState("");

  const saveAddress = () => {
    if (!name || !phone || !address) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    Alert.alert("Success", "Address saved successfully!");
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[appstyles.container, { backgroundColor: colors.background }]}
    >
      {/* 🔹 Header */}
      <View style={[appstyles.rowBetween, { marginBottom: 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={[appstyles.brand, { fontSize: 20 }]}>Add Address</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🔹 Form */}
      <View style={{ marginHorizontal: 10 }}>
        <Text style={appstyles.label}>Full Name</Text>
        <TextInput
          style={appstyles.input}
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
        />

        <Text style={appstyles.label}>Phone Number</Text>
        <TextInput
          style={appstyles.input}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={appstyles.label}>Full Address</Text>
        <TextInput
          style={[appstyles.input, { height: 90, textAlignVertical: "top" }]}
          placeholder="House No, Street, City, Pincode"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={appstyles.label}>Address Type</Text>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          {["Home", "Office", "Other"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                appstyles.card,
                { paddingVertical: 8, paddingHorizontal: 16, marginRight: 10 },
                type === item && { backgroundColor: colors.primary },
              ]}
              onPress={() => setType(item)}
            >
              <Text
                style={[
                  { fontSize: 14, fontWeight: "600" },
                  type === item && { color: colors.white },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔹 Save Button */}
        <TouchableOpacity style={appstyles.loginBtn} onPress={saveAddress}>
          <Text style={appstyles.loginBtnText}>Save Address</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}
