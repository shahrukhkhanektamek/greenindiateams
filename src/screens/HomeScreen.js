import React, { useContext, useState } from "react";
import { View, Text, FlatList, Modal, TouchableOpacity, Linking, ScrollView, TextInput, Image, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import appstyles, { colors } from "../assets/app";
import { AppContext } from "../Context/AppContext";

const { width } = Dimensions.get('window');

export default function HomeScreen() {

   const { handleLogout } = useContext(AppContext);

  // Dummy static data
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const types = [
    { id: 0, text: "New" },
    { id: 1, text: "Called" },
  ];

  const options = [
    { label: "All", value: false },
    { label: "Paid", value: 1 },
    { label: "Unpaid", value: 0 },
  ];

  const data = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "1234567890", leadStatus: 1, status_text: "New" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "9876543210", leadStatus: 0, status_text: "Called" },
  ];

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  const handleSelect = (item) => {
    setSelectedStatus(item.label);
    setIsDropdownVisible(false);
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <>
    
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/img/logo.png')} style={styles.logo} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.statusBtn, { backgroundColor: isOnline ? colors.primary : "#FF3B30" }]}>
            <View style={styles.statusDotContainer}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? "#00FF00" : "#FF0000" }]} />
            </View>
            <Text style={styles.statusText}>{isOnline ? "Online" : "Offline"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Icon name="log-out-outline" style={styles.menu} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[appstyles.container, { flex: 1 }]}>
        <ScrollView >
          {/* Tabs */}
          <View style={[styles.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
            <View style={[styles.col6, { width: '65%' }]}>
              <View style={styles.tabContainer}>
                {types.map((tab) => (
                  <TouchableOpacity key={tab.id} style={styles.tab}> 
                    <Text style={styles.tabText}>{tab.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.col6, { width: '30%' }]}>
              <View>
                <TouchableOpacity style={styles.tab} onPress={toggleDropdown}>
                  <Text style={styles.tabText}>{selectedStatus}</Text>
                </TouchableOpacity>
                {isDropdownVisible && (
                  <View style={styles.dropdownBox}>
                    {options.map((item) => (
                      <TouchableOpacity key={item.value.toString()} style={styles.dropdownItem} onPress={() => handleSelect(item)}>
                        <Text style={styles.dropdownText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Search Input */}
          <TextInput placeholder="Search Keyword..." style={[appstyles.input]} />

          {/* Lead Cards */}
          <View style={{ paddingBottom: 20 }}>
            {data.map((item) => (
              <View key={item.id} style={appstyles.card}>
                <View style={styles.row}>
                  <View style={styles.col8}>
                    <Text>{item.name}</Text>
                    <Text style={{ color: colors.primary }} onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                      {item.email}
                    </Text>
                    <Text style={styles.phone}>{item.phone}</Text>
                    <Text style={[styles.status_text, { backgroundColor: item.leadStatus === 1 ? 'lightgreen' : 'red' }]}>
                      {item.status_text}
                    </Text> 
                  </View>
                  <View style={styles.col4}>
                    <TouchableOpacity onPress={() => handleCall(item.phone)}>
                      <Icon name="call-outline" style={styles.iconCall} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${item.phone}`)}>
                      <Icon name="logo-whatsapp" style={styles.iconCallWhatsApp} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Modal */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={appstyles.modalOverlay}>
              <View style={appstyles.modalBox}>
                <Text style={appstyles.modalTitle}>Incoming Request</Text>
                <View style={appstyles.modalActions}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="call" style={styles.iconCallRed} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.black,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 150, height: 45, resizeMode: 'contain' },
  menu: { fontSize: 28, color: colors.white },
  statusBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDotContainer: { width: 10, height: 10, marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  iconCall: { backgroundColor: 'lightgreen', fontSize: 30, borderRadius: 50, padding: 5, width: 45, height: 45, borderWidth: 2, borderColor: 'lightgray' },
  iconCallRed: { backgroundColor: 'red', fontSize: 35, borderRadius: 50, padding: 5, width: 50, height: 50, borderWidth: 2, borderColor: 'lightgray' },
  iconCallWhatsApp: { backgroundColor: '#25D366', fontSize: 30, borderRadius: 50, padding: 5, width: 45, height: 45, borderWidth: 2, borderColor: 'lightgray', textAlign: 'center', textAlignVertical: 'center', marginTop: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  col8: { width: '85%' },
  col4: { width: '15%', alignItems: 'center', justifyContent: 'center' },
  col6: { width: '50%' },
  phone: { fontSize: 18, textAlign: 'left', color: colors.primaryDark, fontWeight: '600', marginTop: 4 },
  status_text: { width: 80, color: 'white', textAlign: 'center', borderRadius: 5 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#EEE', borderRadius: 25, overflow: 'hidden', marginBottom: 5 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  tabText: { color: colors.grey, fontWeight: '600', fontSize: 15 },
  dropdownBox: { position: "absolute", top: 50, right: 0, backgroundColor: "#fff", borderRadius: 8, elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, width: 120, zIndex: 999 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  dropdownText: { color: "#333", fontSize: 14 },
});
