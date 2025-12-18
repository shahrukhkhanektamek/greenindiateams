// screens/AddItemScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';

const AddItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    setAdditionalItems,
    Toast // अगर Toast context से available है
  } = route.params || {};
  
  const [newItem, setNewItem] = useState({ 
    name: '', 
    quantity: '1', 
    price: '' 
  });
  const [addingItem, setAddingItem] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    
    if (!newItem.price || parseFloat(newItem.price) <= 0) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }

    try {
      setAddingItem(true);
      
      const item = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        quantity: parseInt(newItem.quantity) || 1,
        price: parseFloat(newItem.price) || 0,
      };

      // Callback function से item add करें
      if (setAdditionalItems) {
        setAdditionalItems(prev => [...prev, item]);
      }

      // Toast show करें अगर available है
      if (Toast) {
        Toast.show({
          type: 'success',
          text1: 'Item Added',
          text2: 'Additional item added successfully',
        });
      } else {
        Alert.alert('Success', 'Item added successfully');
      }
      
      // वापस navigate करें
      setTimeout(() => {
        navigation.goBack();
      }, 500);
      
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleQuantityChange = (text) => {
    // केवल numbers allow करें
    const numericValue = text.replace(/[^0-9]/g, '');
    setNewItem(prev => ({...prev, quantity: numericValue || '1'}));
  };

  const handlePriceChange = (text) => {
    // Decimal numbers allow करें
    const decimalValue = text.replace(/[^0-9.]/g, '');
    // केवल एक decimal point allow करें
    const parts = decimalValue.split('.');
    if (parts.length > 2) return;
    
    setNewItem(prev => ({...prev, price: decimalValue}));
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity
          style={clsx(styles.flex1, styles.bgBlack50)}
          activeOpacity={1}
          onPress={handleBack}
        >
          <View style={clsx(styles.flex1, styles.justifyEnd)}>
            <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
              {/* Header */}
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
                <View>
                  <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                    Add Additional Item
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Add extra items or services
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleBack}
                  disabled={addingItem}
                  style={clsx(
                    styles.w10,
                    styles.h10,
                    styles.roundedFull,
                    styles.bgGray50,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                >
                  <Icon name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={clsx(styles.mb6)}>
                {/* Item Name */}
                <View style={clsx(styles.mb4)}>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Item Name *
                  </Text>
                  <TextInput
                    style={clsx(
                      styles.border,
                      styles.borderPrimary,
                      styles.roundedLg,
                      styles.p3,
                      styles.textBase,
                      styles.textBlack,
                      styles.bgWhite
                    )}
                    placeholder="e.g., AC Gas, Spare Parts, Extra Labor"
                    placeholderTextColor={colors.gray500}
                    value={newItem.name}
                    onChangeText={(text) => setNewItem({...newItem, name: text})}
                    editable={!addingItem}
                    maxLength={50}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                  <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>
                    Enter the name of additional item or service
                  </Text>
                </View>

                {/* Quantity and Price Row */}
                <View style={clsx(styles.flexRow, styles.gap3, styles.mb4)}>
                  {/* Quantity */}
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                      Quantity
                    </Text>
                    <View style={clsx(styles.positionRelative)}>
                      <TextInput
                        style={clsx(
                          styles.border,
                          styles.borderPrimary,
                          styles.roundedLg,
                          styles.p3,
                          styles.textBase,
                          styles.textBlack,
                          styles.textCenter,
                          styles.bgWhite
                        )}
                        placeholder="1"
                        placeholderTextColor={colors.gray500}
                        keyboardType="number-pad"
                        value={newItem.quantity}
                        onChangeText={handleQuantityChange}
                        editable={!addingItem}
                        maxLength={3}
                      />
                      <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1, styles.textCenter)}>
                        Qty
                      </Text>
                    </View>
                  </View>
                  
                  {/* Price */}
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                      Price (₹) *
                    </Text>
                    <View style={clsx(styles.positionRelative)}>
                      <TextInput
                        style={clsx(
                          styles.border,
                          styles.borderPrimary,
                          styles.roundedLg,
                          styles.p3,
                          styles.textBase,
                          styles.textBlack,
                          styles.textCenter,
                          styles.bgWhite
                        )}
                        placeholder="0.00"
                        placeholderTextColor={colors.gray500}
                        keyboardType="decimal-pad"
                        value={newItem.price}
                        onChangeText={handlePriceChange}
                        editable={!addingItem}
                        maxLength={10}
                      />
                      <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1, styles.textCenter)}>
                        Amount
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Total Calculation Preview */}
                {(newItem.quantity && newItem.price) && (
                  <View style={clsx(
                    styles.mb4,
                    styles.p3,
                    styles.bgPrimaryLight,
                    styles.roundedLg,
                    styles.border,
                    styles.borderPrimary
                  )}>
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb1)}>
                      Total Amount Preview
                    </Text>
                    <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                      <Text style={clsx(styles.textBase, styles.textMuted)}>
                        {newItem.quantity} × ₹{parseFloat(newItem.price) || 0}
                      </Text>
                      <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                        ₹{(parseInt(newItem.quantity) || 1) * (parseFloat(newItem.price) || 0)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Add Button */}
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.p4,
                  styles.roundedLg,
                  styles.shadowSm,
                  addingItem ? [styles.bgGray300, styles.opacity50] : styles.bgPrimary
                )}
                onPress={handleAddItem}
                disabled={addingItem || !newItem.name.trim() || !newItem.price}
              >
                {addingItem ? (
                  <>
                    <ActivityIndicator size="small" color={colors.white} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textWhite, styles.fontBold)}>
                      Adding Item...
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="add-circle-outline" size={24} color={colors.white} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                      Add Item to Bill
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Instructions */}
              <View style={clsx(styles.mt6, styles.p4, styles.bgGray50, styles.roundedLg)}>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  💡 Tips:
                </Text>
                <Text style={clsx(styles.textXs, styles.textMuted)}>
                  • Enter accurate item name for billing{"\n"}
                  • Quantity should be in numbers only{"\n"}
                  • Price can include decimal points{"\n"}
                  • Item will be added to the final bill
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddItemScreen;