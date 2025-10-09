import React, { useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { AppContext } from "../Context/AppContext";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.75;

export default function CustomDrawer({ navigation, isOpen, onClose }) {

  const { userLoggedIn, setUserLoggedIn } = useContext(AppContext);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const MenuItem = ({ label, iconName, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={styles.menuItemContainer}
    >
      <View style={styles.menuItemContent}>
        <Icon name={iconName} size={22} color="#555" style={styles.menuIcon} />
        <Text style={styles.menuItem}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          pointerEvents={isOpen ? "auto" : "none"}
          style={[styles.overlay, { opacity: overlayOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/32.jpg",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Shahrukh</Text>
          <Text style={styles.profileEmail}>shahrukh@example.com</Text>
        </View>

        {/* Menu Items */}
        <MenuItem
          label="Home"
          iconName="home-outline"
          onPress={() => {
            navigation.navigate("Home");
            onClose();
          }}
        />
        <MenuItem
          label="Profile"
          iconName="person-outline"
          onPress={() => {
            navigation.navigate("Profile");
            onClose();
          }}
        />
        <MenuItem
          label="Settings"
          iconName="settings-outline"
          onPress={() => {
            navigation.navigate("Settings");
            onClose();
          }}
        />
        <MenuItem
          label="Logout"
          iconName="log-out-outline"
          onPress={() => {
            setUserLoggedIn(false)
            // handle logout
            onClose();
          }}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "black",
    zIndex: 999,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 1000,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
    color: "#777",
  },
  menuItemContainer: {
    paddingVertical: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItem: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
});
