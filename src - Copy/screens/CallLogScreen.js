import React from "react";
import { View, Text, FlatList } from "react-native";
import appstyles, { colors } from "../assets/app"; // Ensure correct path

export default function CallLogScreen({ route }) {
  const { number } = route.params;

  // Sample call logs
  const callLogs = [
    { id: '1', date: '01/10/2025', type: 'called' },
    { id: '2', date: '02/10/2025', type: 'missed' },
    { id: '3', date: '03/10/2025', type: 'received' },
    { id: '4', date: '04/10/2025', type: 'missed' },
    { id: '5', date: '05/10/2025', type: 'called' },
  ];

  // Color based on call type
  const getCallColor = (type) => {
    switch (type) {
      case 'missed': return colors.primaryDark; // dark gold for missed
      case 'received': return '#4CAF50'; // green for received
      case 'called': return colors.primary; // gold for outgoing
      default: return colors.grey;
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        appstyles.card,
        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      ]}
    >
      <Text style={[appstyles.value, { color: getCallColor(item.type) }]}>
        {item.date}
      </Text>
      <Text style={[appstyles.value, { color: getCallColor(item.type), fontWeight: '600' }]}>
        {item.type.toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View style={appstyles.container}>
      <Text style={appstyles.brand}>Call Log for {number}</Text>

      <FlatList
        data={callLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 15 }}
      />
    </View>
  );
}
