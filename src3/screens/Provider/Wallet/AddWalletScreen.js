import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const AddWalletScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { Toast, Urls, postData } = useContext(AppContext);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Service Payment');
  const [loading, setLoading] = useState(false);
  
  const { onSuccess } = route.params || {};

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        depositAmount: parseFloat(amount),       
        transactionId: "dasdfasfs",        
      };

      const response = await postData(
        data,
        Urls.addWalletCredit,
        'POST'
      );
 
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Credit Added',
          text2: 'Credit has been added to your wallet',
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to add credit',
        });
      }
    } catch (error) {
      console.error('Error adding credit:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to add credit',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Add Credit"
        showBack
        onBackPress={handleBack}
        showNotification={false}
        type="white"
      />

      <ScrollView 
        style={clsx(styles.flex1)}
        contentContainerStyle={clsx(styles.p6)}
        showsVerticalScrollIndicator={false}
      >
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mb2)}>
            Amount (₹)
          </Text>
          <TextInput
            style={clsx(
              styles.border,
              styles.borderPrimary,
              styles.roundedLg,
              styles.p4,
              styles.textXl,
              styles.fontBold,
              styles.textBlack,
              styles.textCenter
            )}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            maxLength={8}
          />
        </View>

           

        <TouchableOpacity
          style={clsx(
            styles.bgSuccess,
            styles.roundedLg,
            styles.p4,
            styles.itemsCenter,
            styles.justifyCenter,
            loading && styles.opacity50
          )}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
              Add Credit
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddWalletScreen;