import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const Shimmer = ({ style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E1E9EE', '#F2F2F2'],
  });

  return (
    <Animated.View style={[style, { backgroundColor }]} />
  );
};

const PageLoading = () => {
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* Header */}
      <View style={styles.row}>
        <Shimmer style={styles.avatar} />
        <View style={{ marginLeft: 12 }}>
          <Shimmer style={styles.lineShort} />
          <Shimmer style={styles.lineTiny} />
        </View>
      </View>

      {/* Cards */}
      <View style={styles.cardRow}>
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.card}>
            <Shimmer style={styles.iconCircle} />
            <Shimmer style={styles.lineFull} />
            <Shimmer style={styles.lineHalf} />
          </View>
        ))}
      </View>

      {/* Large block */}
      <Shimmer style={styles.largeBlock} />

      {/* List rows */}
      {[1, 2, 3].map((_, i) => (
        <View key={i} style={styles.row}>
          <Shimmer style={styles.avatarSmall} />
          <View style={{ marginLeft: 12 }}>
            <Shimmer style={styles.lineMid} />
            <Shimmer style={styles.lineTiny} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  lineShort: {
    width: 120,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  lineTiny: {
    width: 80,
    height: 10,
    borderRadius: 5,
  },
  lineFull: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  lineHalf: {
    width: '60%',
    height: 10,
    borderRadius: 5,
  },
  lineMid: {
    width: 180,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: (width - 64) / 3,
    height: 100,
    justifyContent: 'space-between',
    padding: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  largeBlock: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 24,
  },
});

export default PageLoading;
