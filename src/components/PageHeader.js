import React, { useContext, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { AppContext } from "../Context/AppContext";
import { useNavigation } from "@react-navigation/native";

import appstyles, { colors } from "../assets/app";

export default function PageHeader({data}) {
  const navigation = useNavigation();
  const { drawerOpen, setDrawerOpen } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("Shop");

  return (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Icon name="arrow-back" size={25} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-start",
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: colors.white,
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      alignItems:'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.primary,
      marginLeft:10
    },
});