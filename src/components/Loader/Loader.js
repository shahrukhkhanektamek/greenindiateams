import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
const Loader = ({ showHideLoader, setshowHideLoader }) => {

  const showLoader = showHideLoader;
  const setShowLoader = setshowHideLoader;
  const closeLoader = async() => {
    setShowLoader(false);
  };
  if (!showLoader) return null;

  return (
    <View style={[styles.loader]}>
        <View style={[styles.loaderContainer,]} >
        <TouchableOpacity style={[styles.closeBtn]} onPress={closeLoader}>
          <Icon name='times' color='#fff' />
        </TouchableOpacity>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loaderText}>Loading...</Text>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    loader:{
        position: "absolute",
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: "center",
        justifyContent: "center",
        elevation: 1,
        zIndex: 1000,
    },
  loaderContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  closeBtn:{
    color:'#fff',
    fontSize:15,
    position:'absolute',
    right:5,
    top:5,
  },
});

export default Loader;
