import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const CompleteBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    bookingData,
    formattedData,
    loadBookingDetails
  } = route.params || {};
  
  const { Toast, Urls, postData } = useContext(AppContext);
  
  const [cashCollected, setCashCollected] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [additionalItems, setAdditionalItems] = useState([]);
  const [completingBooking, setCompletingBooking] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', price: '' });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddItem = () => {
    setAddItemModalVisible(true);
  };

  const addAdditionalItem = () => {
    if (!newItem.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter item name',
      });
      return;
    }
    
    if (!newItem.price || parseFloat(newItem.price) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter valid price',
      });
      return;
    }

    const item = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      quantity: parseInt(newItem.quantity) || 1,
      price: parseFloat(newItem.price) || 0,
    };

    setAdditionalItems(prev => [...prev, item]);
    setNewItem({ name: '', quantity: '1', price: '' });
    setAddItemModalVisible(false);
    
    Toast.show({
      type: 'success',
      text1: 'Item Added',
      text2: 'Additional item added successfully',
    });
  };

  const removeAdditionalItem = (id) => {
    setAdditionalItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotalAmount = () => {
    let total = formattedData?.originalBookingAmount || 0;
    additionalItems.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  };

  const calculateDueAmount = () => {
    const total = calculateTotalAmount();
    if (formattedData?.paymentStatus === 'Paid') {
      const additionalTotal = additionalItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      return additionalTotal;
    }
    return total;
  };

  const completeBooking = async () => {
    try {
      setCompletingBooking(true);
      
      const data = {
        bookingId: bookingData?._id,
        cashCollected: cashCollected,
        cashAmount: cashCollected ? parseFloat(cashAmount) : 0,
        additionalItems: additionalItems,
        totalAmount: calculateTotalAmount(),
        dueAmount: calculateDueAmount(),
      };

      const response = await postData(
        data,
        Urls.completeBooking,
        'POST'
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Booking Completed',
          text2: 'Booking has been completed successfully',
        });
        
        // Navigate back and refresh
        navigation.goBack();
        setTimeout(() => {
          if (loadBookingDetails) {
            loadBookingDetails();
          }
        }, 500);
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to complete booking',
        });
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete booking',
      });
    } finally {
      setCompletingBooking(false);
    }
  };

  // Initialize cash amount
  useEffect(() => {
    if (formattedData?.paymentStatus === 'Pending') {
      setCashAmount(formattedData.amount.toString());
    }
  }, [formattedData]);

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
      >
        <TouchableOpacity
          style={clsx(styles.flex1, styles.bgBlack50)}
          activeOpacity={1}
          onPress={handleBack}
        >
          <View style={clsx(styles.flex1, styles.justifyEnd)}>
            <ScrollView 
              style={clsx(styles.bgWhite, styles.roundedT3xl, styles.maxH80)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={clsx(styles.p6)}>
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
                  <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                    Complete Booking
                  </Text>
                  <TouchableOpacity 
                    onPress={handleBack}
                    disabled={completingBooking}
                  >
                    <Icon name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Payment Summary */}
                <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                    Payment Summary
                  </Text>
                  
                  <View style={clsx(styles.mb3)}>
                    <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                      <Text style={clsx(styles.textBase, styles.textBlack)}>Original Amount:</Text>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                        ₹{formattedData?.originalBookingAmount || 0}
                      </Text>
                    </View>
                    
                    {additionalItems.length > 0 && (
                      <>
                        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt3, styles.mb2)}>
                          Additional Items:
                        </Text>
                        {additionalItems.map(item => (
                          <View key={item.id} style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                            <Text style={clsx(styles.textSm, styles.textMuted)}>
                              {item.quantity}x {item.name}
                            </Text>
                            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                              ₹{item.price * item.quantity}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                    
                    <View style={clsx(styles.borderTop, styles.borderLight, styles.pt3, styles.mt3)}>
                      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                        <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>Total Amount:</Text>
                        <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                          ₹{calculateTotalAmount()}
                        </Text>
                      </View>
                      
                      <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                        <Text style={clsx(styles.textBase, styles.textMuted)}>Payment Status:</Text>
                        <Text style={clsx(
                          styles.textBase,
                          styles.fontMedium,
                          formattedData?.paymentStatus === 'Paid' ? styles.textSuccess : styles.textWarning
                        )}>
                          {formattedData?.paymentStatus}
                        </Text>
                      </View>
                      
                      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt2)}>
                        <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>Amount Due:</Text>
                        <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                          ₹{calculateDueAmount()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Cash Collection */}
                {calculateDueAmount() > 0 && (
                  <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                      Cash Collection
                    </Text>
                    
                    <TouchableOpacity
                      style={clsx(
                        styles.flexRow,
                        styles.itemsCenter,
                        styles.mb4,
                        styles.p3,
                        styles.roundedLg,
                        cashCollected ? styles.bgSuccessLight : styles.bgWhite,
                        styles.border,
                        cashCollected ? styles.borderSuccess : styles.borderLight
                      )}
                      onPress={() => setCashCollected(!cashCollected)}
                    >
                      <View style={clsx(
                        styles.w6,
                        styles.h6,
                        styles.border,
                        styles.roundedFull,
                        styles.itemsCenter,
                        styles.justifyCenter,
                        styles.mr3,
                        cashCollected ? styles.bgSuccess : styles.bgWhite,
                        cashCollected ? styles.borderSuccess : styles.borderGray
                      )}>
                        {cashCollected && <Icon name="check" size={16} color={colors.white} />}
                      </View>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                        Cash Collected
                      </Text>
                    </TouchableOpacity>
                    
                    {cashCollected && (
                      <View>
                        <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>
                          Amount Collected
                        </Text>
                        <TextInput
                          style={clsx(
                            styles.border,
                            styles.borderPrimary,
                            styles.roundedLg,
                            styles.p3,
                            styles.textBase,
                            styles.textBlack
                          )}
                          placeholder="Enter amount"
                          keyboardType="numeric"
                          value={cashAmount}
                          onChangeText={setCashAmount}
                          editable={!completingBooking}
                          selectTextOnFocus={false}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Additional Items */}
                <View style={clsx(styles.mb6)}>
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                      Additional Items
                    </Text>
                    <TouchableOpacity
                      style={clsx(
                        styles.flexRow,
                        styles.itemsCenter,
                        styles.px3,
                        styles.py2,
                        styles.bgPrimary,
                        styles.roundedFull
                      )}
                      onPress={handleAddItem}
                      disabled={completingBooking}
                    >
                      <Icon name="add" size={20} color={colors.white} />
                      <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                        Add Item
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {additionalItems.length === 0 ? (
                    <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.p4)}>
                      No additional items added
                    </Text>
                  ) : (
                    <View>
                      {additionalItems.map(item => (
                        <View key={item.id} style={clsx(
                          styles.flexRow,
                          styles.itemsCenter,
                          styles.justifyBetween,
                          styles.p3,
                          styles.bgWhite,
                          styles.roundedLg,
                          styles.mb2,
                          styles.shadowSm
                        )}>
                          <View style={clsx(styles.flex1)}>
                            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                              {item.quantity}x {item.name}
                            </Text>
                            <Text style={clsx(styles.textSm, styles.textMuted)}>
                              ₹{item.price} each
                            </Text>
                          </View>
                          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mr3)}>
                              ₹{item.price * item.quantity}
                            </Text>
                            <TouchableOpacity 
                              onPress={() => removeAdditionalItem(item.id)}
                              disabled={completingBooking}
                            >
                              <Icon name="delete" size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Complete Button */}
                <TouchableOpacity
                  style={clsx(
                    styles.bgSuccess,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    completingBooking && styles.opacity50
                  )}
                  onPress={completeBooking}
                  disabled={completingBooking}
                >
                  {completingBooking ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                      Complete Booking
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Add Item Modal */}
      {addItemModalVisible && (
        <View style={clsx(styles.absolute, styles.inset0, styles.bgBlack50, styles.justifyEnd)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={clsx(styles.flex1, styles.justifyEnd)}
          >
            <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  Add Additional Item
                </Text>
                <TouchableOpacity onPress={() => setAddItemModalVisible(false)}>
                  <Icon name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={clsx(styles.mb4)}>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>Item Name</Text>
                <TextInput
                  style={clsx(
                    styles.border,
                    styles.borderPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.textBase,
                    styles.textBlack
                  )}
                  placeholder="e.g., AC Gas, Spare Parts"
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                  selectTextOnFocus={false}
                />
              </View>

              <View style={clsx(styles.flexRow, styles.gap3, styles.mb4)}>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>Quantity</Text>
                  <TextInput
                    style={clsx(
                      styles.border,
                      styles.borderPrimary,
                      styles.roundedLg,
                      styles.p3,
                      styles.textBase,
                      styles.textBlack,
                      styles.textCenter
                    )}
                    placeholder="1"
                    keyboardType="numeric"
                    value={newItem.quantity}
                    onChangeText={(text) => setNewItem({...newItem, quantity: text})}
                    selectTextOnFocus={false}
                  />
                </View>
                
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>Price (₹)</Text>
                  <TextInput
                    style={clsx(
                      styles.border,
                      styles.borderPrimary,
                      styles.roundedLg,
                      styles.p3,
                      styles.textBase,
                      styles.textBlack,
                      styles.textCenter
                    )}
                    placeholder="0"
                    keyboardType="numeric"
                    value={newItem.price}
                    onChangeText={(text) => setNewItem({...newItem, price: text})}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={clsx(
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.p4,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={addAdditionalItem}
              >
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
};

export default CompleteBookingScreen;