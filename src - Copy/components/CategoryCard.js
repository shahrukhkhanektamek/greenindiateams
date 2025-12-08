import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const CategoryCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.imageWrapper}>
      <Image
        source={require('../assets/img/category/img1.jpg')}
        style={styles.categoryImage}
      />
    </View>
    <Text style={styles.categoryText} numberOfLines={1}>
      {item.title}
    </Text>
  </TouchableOpacity>
);

export default CategoryCard;

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 20,
    width: 100,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  categoryText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});
