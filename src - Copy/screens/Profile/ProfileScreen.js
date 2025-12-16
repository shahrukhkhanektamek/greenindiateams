// src/screens/ProfileScreen.js

import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../../Context/AppContext";
import appstyles, { colors } from "../../assets/app";

import PageHeader from '../../components/PageHeader';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userLoggedIn, setUserLoggedIn } = useContext(AppContext);

  return (
    <>
    <PageHeader data={{title:'My Profile'}} />
    <ScrollView
      style={[appstyles.container,{marginTop:10}]}
    >



      {/* 🔹 User Info */}
      <View style={[appstyles.card,{alignItems: "center"}]}>
        <Image
          source={require("../../assets/img/user.png")}
          style={styles.userImage}
        />
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userEmail}>johndoe@example.com</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Menu / Actions */}
      <View style={appstyles.card}>
        <MenuItem
          icon="cart-outline"
          label="My Orders"
          onPress={() => navigation.navigate("Orders")}
        />
        <MenuItem
          icon="location-outline"
          label="My Addresses"
          onPress={() => navigation.navigate("MyAddress")}
        />
        <MenuItem
          icon="heart-outline"
          label="Wishlist"
          onPress={() => navigation.navigate("Wishlist")}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => navigation.navigate("Help")}
        />
        <MenuItem
          icon="log-out-outline"
          label="Logout"
          onPress={() => setUserLoggedIn(false)}
          isLogout
        />
      </View>
    </ScrollView>
    </>
  );
}

// ✅ Reusable Menu Item
function MenuItem({ icon, label, onPress, isLogout }) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        isLogout && { borderTopWidth: 1, borderTopColor: "#eee" },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <Icon
          name={icon}
          size={22}
          color={isLogout ? "#f44336" : colors.primary}
        />
        <Text
          style={[
            styles.menuLabel,
            isLogout && { color: "#f44336" },
          ]}
        >
          {label}
        </Text>
      </View>
      {!isLogout && (
        <Icon name="chevron-forward" size={20} color="#999" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  

  userCard: {
    ...appstyles.card,
    alignItems: "center",
    marginHorizontal: 15,
    paddingVertical: 25,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
  },
  userEmail: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 15,
  },
  editBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },
  editText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },

  actionCard: {
    ...appstyles.card,
    paddingHorizontal: 0,
    marginHorizontal: 15,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
    marginLeft: 15,
  },
});
