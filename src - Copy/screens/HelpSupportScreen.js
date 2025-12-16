import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      q: "How can I track my order?",
      a: "Go to 'My Orders' in your profile and select the order to view tracking details.",
    },
    {
      q: "What is the return policy?",
      a: "You can return products within 7 days of delivery if the product is unused and in original packaging.",
    },
    {
      q: "How do I change my address?",
      a: "Go to 'My Address' in your profile to add, edit, or delete saved addresses.",
    },
    {
      q: "I forgot my password. What should I do?",
      a: "Use the 'Forgot Password' option on the login page to reset it.",
    },
  ];

  const toggleFAQ = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const openLink = (url) => Linking.openURL(url);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f6f8f5" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#777" style={{ marginHorizontal: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* FAQ Section */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      {faqs.map((item, index) => (
        <View key={index} style={styles.faqCard}>
          <TouchableOpacity onPress={() => toggleFAQ(index)} style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{item.q}</Text>
            <Icon
              name={expandedIndex === index ? "chevron-up" : "chevron-down"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          {expandedIndex === index && <Text style={styles.faqAnswer}>{item.a}</Text>}
        </View>
      ))}

      {/* Contact Support */}
      <Text style={styles.sectionTitle}>Need More Help?</Text>
      <View style={styles.contactContainer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => openLink("mailto:support@example.com")}
        >
          <Icon name="mail-outline" size={22} color="#4caf50" />
          <Text style={styles.contactText}>Email Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => openLink("tel:+911234567890")}
        >
          <Icon name="call-outline" size={22} color="#4caf50" />
          <Text style={styles.contactText}>Call Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => openLink("https://wa.me/911234567890")}
        >
          <Icon name="chatbubble-ellipses-outline" size={22} color="#4caf50" />
          <Text style={styles.contactText}>Live Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 25,
    marginBottom: 12,
    marginHorizontal: 15,
  },

  faqCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    lineHeight: 20,
  },

  contactContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  contactText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 10,
    fontWeight: "600",
  },
});
