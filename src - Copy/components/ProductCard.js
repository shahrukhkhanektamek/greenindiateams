import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ProductCard = ({ item }) => (
  <View style={styles.productCard}>
    <Image
      source={require("../assets/img/product/img1.jpg")}
      style={styles.productImage}
    />
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <Icon name="star" size={14} color="#f5b50a" />
        <Text style={styles.ratingText}>{item.rating}</Text>
        <Text style={styles.reviewText}>(15 ratings)</Text>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.discount}>10% OFF</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.cartBtnRow}>
        <TouchableOpacity style={styles.iconBtn}>
          <Icon name="heart-outline" size={20} color="#657792" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Icon name="cart-outline" size={20} color="#657792" />
        </TouchableOpacity>
      </View>

      {/* Quantity Selector */}
      <View style={styles.cartQtyRow}>
        <TouchableOpacity style={[styles.qtyBtn, styles.decreaseBtn]}>
          <Text style={styles.qtyText}>-</Text>
        </TouchableOpacity>
        <TextInput keyboardType="number-pad" style={styles.inputQty} />
        <TouchableOpacity style={[styles.qtyBtn, styles.increaseBtn]}>
          <Text style={styles.qtyText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default ProductCard;

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    width: "49%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,.1)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: { fontSize: 12, color: "#333", marginLeft: 4 },
  reviewText: { fontSize: 12, color: "#888", marginLeft: 4 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: { fontSize: 16, fontWeight: "700", color: "#333", marginRight: 6 },
  discount: { fontSize: 12, color: "#4caf50", fontWeight: "600" },
  cartBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  cartQtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#657792",
    justifyContent: "center",
    alignItems: "center",
  },
  decreaseBtn: {
    marginRight: 4,
  },
  increaseBtn: {
    marginLeft: 4,
  },
  qtyText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  inputQty: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: "#657792",
    borderRadius: 8,
    textAlign: "center",
    color: "#333",
  },
});
