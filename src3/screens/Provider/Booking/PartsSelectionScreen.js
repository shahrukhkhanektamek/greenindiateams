import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const PartsSelectionScreen = ({ navigation, route }) => {
  const { bookingData, formattedData, loadBookingDetails } = route.params;
  const { Toast, Urls, postData, user, token } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serviceItems, setServiceItems] = useState([]);
  const [rateGroups, setRateGroups] = useState([]);
  const [filteredRateGroups, setFilteredRateGroups] = useState([]);
  const [selectedParts, setSelectedParts] = useState({});
  const [quantities, setQuantities] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [partsAmount, setPartsAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedPartForQuantity, setSelectedPartForQuantity] = useState(null);
  const [searchQueries, setSearchQueries] = useState({}); // Each service item has its own search query
  const [addingPartId, setAddingPartId] = useState(null); // To show loading on specific add button
  const [searchingServiceId, setSearchingServiceId] = useState(null); // To show searching state
  const [buttonPressedId, setButtonPressedId] = useState(null); // For button press feedback

  useEffect(() => {
    calculateInitialAmounts();
    fetchRateGroups();
  }, []);

  useEffect(() => {
    calculateTotalAmounts();
  }, [selectedParts, quantities]);

  useEffect(() => {
    // Initialize filtered rate groups
    if (rateGroups.length > 0) {
      setFilteredRateGroups(rateGroups);
    }
  }, [rateGroups]);

  const calculateInitialAmounts = () => {
    try {
      // Calculate original booking amount
      const bookingItems = bookingData?.booking?.bookingItems || [];
      let originalAmt = 0;
      
      bookingItems.forEach(item => {
        const itemPrice = item.salePrice || 0;
        const itemQuantity = item.quantity || 1;
        originalAmt += itemPrice * itemQuantity;
      });
      
      setOriginalAmount(originalAmt);
      setTotalAmount(originalAmt);
      setGrandTotal(originalAmt);

      // Prepare service items
      const items = bookingItems.map(item => ({
        id: item._id, // यह booking item का _id है (serviceItemId)
        serviceId: item.service?._id || item._id,
        name: item.service?.name || 'Service Item',
        quantity: item.quantity || 1,
        price: item.salePrice || 0,
        total: (item.salePrice || 0) * (item.quantity || 1)
      }));
      setServiceItems(items);
      
      // Initialize search queries for each service item
      const initialSearchQueries = {};
      bookingItems.forEach(item => {
        initialSearchQueries[item._id] = '';
      });
      setSearchQueries(initialSearchQueries);
      
    } catch (error) {
      console.error('Error calculating amounts:', error);
    }
  };

  const fetchRateGroups = async () => { 
    try {
      setLoading(true);
      
      // Get service category from booking
      const bookingItems = bookingData?.booking?.bookingItems || [];
      if (bookingItems.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get first service category (assuming single service for now)
      const serviceCategoryId = bookingItems[0]?.service?.categoryId;
      const servicesubCategoryId = bookingItems[0]?.service?.subCategoryId;
      
      if (!serviceCategoryId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Service category not found',
        });
        setLoading(false);
        return;
      }
      
      // Fetch rate groups for this category
      const response = await postData(
        {
          "category": serviceCategoryId,
          "subCategory": servicesubCategoryId,  
        }, 
        `${Urls.getRateGroups}`,
        'GET'
      );

      if (response?.success && response.data && response.data.length > 0) {
        const data = response.data[0];
        if (data.rateGroups && data.rateGroups.length > 0) {
          setRateGroups(data.rateGroups);
          setFilteredRateGroups(data.rateGroups);
        } else {
          Toast.show({
            type: 'info',
            text1: 'No Parts Found',
            text2: 'No rate groups available for this service',
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load rate groups',
        });
      }
    } catch (error) {
      console.error('Error fetching rate groups:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load rate groups',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmounts = () => {
    let partsTotal = 0;
    
    // Calculate parts amount from selected parts
    Object.values(selectedParts).forEach(part => {
      const quantity = quantities[part.key] || 1;
      // अब unitPrice का उपयोग करें
      partsTotal += (part.unitPrice || 0) * quantity;
    });
    
    setPartsAmount(partsTotal);
    setGrandTotal(originalAmount + partsTotal);
  };

  const handlePartSelect = async (rate, serviceItemId, groupTitle) => {
    const key = `${rate._id}_${serviceItemId}`;
    
    // Show button press feedback
    setButtonPressedId(key);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (selectedParts[key]) {
      // Remove part if already selected
      const newSelectedParts = { ...selectedParts };
      delete newSelectedParts[key];
      
      const newQuantities = { ...quantities };
      delete newQuantities[key];
      
      setSelectedParts(newSelectedParts);
      setQuantities(newQuantities);
      
      // Reset button press state
      setButtonPressedId(null);
      
      Toast.show({
        type: 'success',
        text1: 'Removed',
        text2: 'Part removed successfully',
      });
    } else {
      // Show adding state
      setAddingPartId(key);
      
      // Add a small delay to show "Adding..." state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate total price - अब unitPrice का उपयोग करें
      const price = parseFloat(rate.serviceCharge?.price || 0);
      const labourCharge = parseFloat(rate.serviceCharge?.labourCharge || 0);
      const discountPrice = parseFloat(rate.serviceCharge?.discountPrice || 0);
      // unitPrice का उपयोग करें (यह पहले से ही discount लगा हुआ price है)
      const unitPrice = parseFloat(rate.unitPrice || 0);
      
      // Find service item to get its ID
      const serviceItem = serviceItems.find(s => s.id === serviceItemId);
      
      // Add part
      setSelectedParts(prev => ({
        ...prev,
        [key]: {
          key: key,
          rateId: rate._id,
          description: rate.description,
          unitPrice: unitPrice, // unitPrice का उपयोग करें
          originalPrice: price,
          labourCharge: labourCharge,
          discountPrice: discountPrice,
          serviceItemId: serviceItem?.id, // यह booking item का _id है
          serviceId: serviceItem?.serviceId, // यह service का _id है
          serviceItemName: serviceItem?.name,
          groupTitle: groupTitle
        }
      }));
      // Set default quantity
      setQuantities(prev => ({
        ...prev,
        [key]: 1
      }));
      
      // Hide loading states
      setAddingPartId(null);
      setButtonPressedId(null);
      
      Toast.show({
        type: 'success',
        text1: 'Added',
        text2: 'Part added successfully',
      });
    }
  };

  const handleQuantityChange = (partKey, increment) => {
    const currentQty = quantities[partKey] || 1;
    const newQty = currentQty + increment;
    
    if (newQty < 1) return;
    
    setQuantities(prev => ({
      ...prev,
      [partKey]: newQty
    }));
  };

  const openQuantityModal = (rate, serviceItemId, groupTitle) => {
    const key = `${rate._id}_${serviceItemId}`;
    const price = parseFloat(rate.serviceCharge?.price || 0);
    const labourCharge = parseFloat(rate.serviceCharge?.labourCharge || 0);
    const discountPrice = parseFloat(rate.serviceCharge?.discountPrice || 0);
    // unitPrice का उपयोग करें
    const unitPrice = parseFloat(rate.unitPrice || 0);
    
    // Find service item to get its ID
    const serviceItem = serviceItems.find(s => s.id === serviceItemId);
    
    setSelectedPartForQuantity({
      key: key,
      rateId: rate._id,
      description: rate.description,
      unitPrice: unitPrice, // unitPrice का उपयोग करें
      originalPrice: price,
      labourCharge: labourCharge,
      discountPrice: discountPrice,
      serviceItemId: serviceItem?.id,
      serviceId: serviceItem?.serviceId,
      serviceItemName: serviceItem?.name,
      groupTitle: groupTitle
    });
    setShowQuantityModal(true);
  };

  const handleQuantitySubmit = (quantity) => {
    if (!selectedPartForQuantity || quantity < 1) return;
    
    setQuantities(prev => ({
      ...prev,
      [selectedPartForQuantity.key]: quantity
    }));
    
    // Also update selectedParts if it doesn't exist yet
    if (!selectedParts[selectedPartForQuantity.key]) {
      setSelectedParts(prev => ({
        ...prev,
        [selectedPartForQuantity.key]: selectedPartForQuantity
      }));
    }
    
    Toast.show({
      type: 'success',
      text1: 'Updated',
      text2: 'Quantity updated successfully',
    });
    
    setShowQuantityModal(false);
    setSelectedPartForQuantity(null);
  };

  const getSelectedPartsForService = (serviceItemId) => {
    return Object.values(selectedParts).filter(
      part => part.serviceItemId === serviceItemId
    );
  };

  const getAllSelectedParts = () => {
    return Object.values(selectedParts);
  };

  const filterRatesBySearch = async (serviceItemId, searchText) => {
    // Update search query for this service item
    setSearchQueries(prev => ({
      ...prev,
      [serviceItemId]: searchText
    }));

    // Show searching state
    setSearchingServiceId(serviceItemId);

    // Add a small delay to show searching state
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!searchText.trim()) {
      // If search is empty, show all rate groups
      setFilteredRateGroups(rateGroups);
      setSearchingServiceId(null);
      return;
    }

    const filtered = rateGroups.map(group => {
      const filteredRates = group.rates?.filter(rate => 
        rate.description?.toLowerCase().includes(searchText.toLowerCase())
      ) || [];
      
      return {
        ...group,
        rates: filteredRates
      };
    }).filter(group => group.rates.length > 0);

    setFilteredRateGroups(filtered);
    setSearchingServiceId(null);
  };

  const handleSearchSubmit = (serviceItemId) => {
    const searchText = searchQueries[serviceItemId] || '';
    filterRatesBySearch(serviceItemId, searchText);
  };

  const submitPartsForApproval = async () => {
    try {
      setSubmitting(true);
      
      // Prepare data for submission - सही structure में data prepare करें
      const partsData = Object.values(selectedParts).map(part => {
        const quantity = quantities[part.key] || 1;
        return {
          serviceItemId: part.serviceItemId, // booking item का _id
          serviceId: part.serviceId, // service का _id (optional)
          rateId: part.rateId,
          description: part.description,
          unitPrice: part.unitPrice, // unitPrice का उपयोग करें
          quantity: quantity,
          labourCharge: part.labourCharge,
          totalPrice: part.unitPrice * quantity, // unitPrice का उपयोग करें
          groupTitle: part.groupTitle
        };
      });

      const requestData = {
        bookingId: bookingData?.bookingId,
        servicemanBookingId: bookingData?._id,
        originalAmount: originalAmount,
        additionalPartsAmount: partsAmount,
        totalAmount: grandTotal,
        parts: partsData,
        status: 'partstatusnew'
      };

      console.log('Submitting parts:', requestData);

      const response = await postData(
        requestData,
        `${Urls.submitPartsForApproval}`,
        'POST'
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Parts submitted for approval',
        });
        
        // Navigate back and refresh
        if (loadBookingDetails) {
          loadBookingDetails();
        }
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to submit parts',
        });
      }
    } catch (error) {
      console.error('Error submitting parts:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit parts',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const RateItem = ({ rate, serviceItemId, groupTitle, isSelected }) => {
    const key = `${rate._id}_${serviceItemId}`;
    const quantity = quantities[key] || (isSelected ? 1 : 0);
    const price = parseFloat(rate.serviceCharge?.price || 0);
    const labourCharge = parseFloat(rate.serviceCharge?.labourCharge || 0);
    const discountPrice = parseFloat(rate.serviceCharge?.discountPrice || 0);
    // unitPrice का उपयोग करें
    const unitPrice = parseFloat(rate.unitPrice || 0);
    const itemTotalPrice = unitPrice * quantity;
    const isAdding = addingPartId === key;
    const isButtonPressed = buttonPressedId === key;
    
    return (
      <View style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.justifyBetween,
        styles.p3,
        styles.mb2,
        isSelected ? styles.bgPrimaryLight : styles.bgGray50,
        styles.roundedLg,
        styles.border,
        isSelected ? styles.borderPrimary : styles.borderGray300
      )}>
        <View style={clsx(styles.flex1)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
            {rate.description}
          </Text>
          
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
            {price > 0 && (
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mr2)}>
                Parts: ₹{price}
              </Text>
            )}
            
            {labourCharge > 0 && (
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mr2)}>
                Labour: ₹{labourCharge}
              </Text>
            )}
            
            {discountPrice > 0 && (
              <Text style={clsx(styles.textSm, styles.textSuccess, styles.mr2)}>
                Discount: ₹{discountPrice}
              </Text>
            )}
          </View>
          
          <Text style={clsx(styles.textXs, styles.fontBold, styles.textPrimary, styles.mt1)}>
            Unit Price: ₹{unitPrice}
          </Text>
        </View>
        
        {isSelected ? (
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <TouchableOpacity
              onPress={() => openQuantityModal(rate, serviceItemId, groupTitle)}
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.px3,
                styles.py1,
                styles.bgPrimary,
                styles.roundedFull,
                styles.mr2
              )}
            >
              <Text style={clsx(styles.textWhite, styles.textSm)}>
                {quantity} Qty
              </Text>
              <Icon name="edit" size={14} color={colors.white} style={clsx(styles.ml1)} />
            </TouchableOpacity>
            
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
              ₹{itemTotalPrice}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handlePartSelect(rate, serviceItemId, groupTitle)}
            disabled={isAdding || isButtonPressed}
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.px-3,
              styles.py-2,
              styles.w24,
              styles.h10,
              isButtonPressed ? styles.bgSuccess : (isAdding ? styles.bgGray400 : styles.bgPrimary),
              styles.roundedFull,
              (isAdding || isButtonPressed) && styles.opacity90
            )}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : isButtonPressed ? (
              <Text style={clsx(styles.textWhite, styles.textSm, styles.fontMedium)}>
                ✓
              </Text>
            ) : (
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <Icon name="add" size={18} color={colors.white} style={clsx(styles.mr1)} />
                <Text style={clsx(styles.textWhite, styles.textSm, styles.fontMedium)}>
                  Add
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const RateGroupSection = ({ group, serviceItemId }) => {
    if (!group.rates || group.rates.length === 0) {
      return null;
    }
    
    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb2)}>
          {group.title}
        </Text>
        
        {group.rates.map((rate, index) => {
          const key = `${rate._id}_${serviceItemId}`;
          const isSelected = !!selectedParts[key];
          
          return (
            <RateItem
              key={index}
              rate={rate}
              serviceItemId={serviceItemId}
              groupTitle={group.title}
              isSelected={isSelected}
            />
          );
        })}
      </View>
    );
  };

  const ServiceItemSection = ({ serviceItem }) => {
    const selectedPartsForService = getSelectedPartsForService(serviceItem.id);
    const searchQuery = searchQueries[serviceItem.id] || '';
    const isSearching = searchingServiceId === serviceItem.id;
    
    return (
      <View style={clsx(styles.mb6, styles.p3, styles.bgWhite, styles.roundedLg, styles.shadowSm)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              {serviceItem.name}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Qty: {serviceItem.quantity} × ₹{serviceItem.price} = ₹{serviceItem.total}
            </Text>
            <Text style={clsx(styles.textXs, styles.textMuted)}>
              Service Item ID: {serviceItem.id.substring(0, 8)}...
            </Text>
          </View>
        </View>
        
        {/* Search Bar for this Service Item */}
        <View style={clsx(styles.mb-3)}>
          <View style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.bgGray100,
            styles.roundedFull,
            styles.px4,
            styles.py2,
            styles.mb4
          )}>
            <Icon name="search" size={20} color={colors.gray500} />
            <TextInput
              style={clsx(
                styles.flex1,
                styles.ml2,
                styles.textBase,
                styles.textBlack
              )}
              placeholder="Search parts by name..."
              value={searchQuery}
              onChangeText={(text) => setSearchQueries(prev => ({...prev, [serviceItem.id]: text}))}
              placeholderTextColor={colors.gray500}
              returnKeyType="search"
              onSubmitEditing={() => handleSearchSubmit(serviceItem.id)}
              blurOnSubmit={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQueries(prev => ({...prev, [serviceItem.id]: ''}));
                  filterRatesBySearch(serviceItem.id, '');
                }}
                style={clsx(styles.ml2)}
              >
                <Icon name="close" size={20} color={colors.gray500} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => handleSearchSubmit(serviceItem.id)}
              disabled={isSearching || !searchQuery.trim()}
              style={clsx(
                styles.ml2,
                styles.px3,
                styles.py1,
                styles.bgPrimary,
                styles.roundedFull,
                (isSearching || !searchQuery.trim()) && styles.opacity50
              )}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={clsx(styles.textWhite, styles.textSm)}>
                  Search
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {selectedPartsForService.length > 0 && (
          <View style={clsx(styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Selected Parts:
            </Text>
            {selectedPartsForService.map((part, index) => {
              const quantity = quantities[part.key] || 1;
              return (
                <View key={index} style={clsx(
                  styles.flexRow,
                  styles.justifyBetween,
                  styles.itemsCenter,
                  styles.p2,
                  styles.bgGray50,
                  styles.rounded,
                  styles.mb1
                )}>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textSm, styles.textBlack)}>
                      • {part.description}
                    </Text>
                    <Text style={clsx(styles.textXs, styles.textMuted)}>
                      {part.groupTitle}
                    </Text>
                  </View>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                    {quantity} × ₹{part.unitPrice} = ₹{quantity * part.unitPrice}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          Available Parts (Rate Groups):
        </Text>
        
        {isSearching ? (
          <View style={clsx(styles.py6, styles.itemsCenter)}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
              Searching parts...
            </Text>
          </View>
        ) : filteredRateGroups.length > 0 ? (
          filteredRateGroups.map((group, index) => (
            <RateGroupSection
              key={index}
              group={group}
              serviceItemId={serviceItem.id}
            />
          ))
        ) : (
          <View style={clsx(styles.py6, styles.itemsCenter)}>
            <Icon name="search-off" size={48} color={colors.gray400} style={clsx(styles.mb2)} />
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
              {searchQuery ? 'No parts found matching your search' : 'No rate groups available for this service'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQueries(prev => ({...prev, [serviceItem.id]: ''}));
                  filterRatesBySearch(serviceItem.id, '');
                }}
                style={clsx(styles.mt2, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
              >
                <Text style={clsx(styles.textWhite, styles.textSm)}>
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const QuantityModal = () => (
    <Modal
      visible={showQuantityModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowQuantityModal(false);
        setSelectedPartForQuantity(null);
      }}
    >
      <View style={clsx(styles.flex1, styles.bgBlack50, styles.justifyCenter, styles.itemsCenter, styles.p4)}>
        <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.wFull)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb2)}>
            Enter Quantity
          </Text>
          
          {selectedPartForQuantity && (
            <>
              <Text style={clsx(styles.textBase, styles.textBlack, styles.mb1)}>
                {selectedPartForQuantity.description}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Category: {selectedPartForQuantity.groupTitle}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted, styles.mb2)}>
                Service Item: {selectedPartForQuantity.serviceItemName}
              </Text>
              
              <View style={clsx(styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Parts Price: ₹{selectedPartForQuantity.originalPrice}
                </Text>
                {selectedPartForQuantity.labourCharge > 0 && (
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Labour Charge: ₹{selectedPartForQuantity.labourCharge}
                  </Text>
                )}
                {selectedPartForQuantity.discountPrice > 0 && (
                  <Text style={clsx(styles.textSm, styles.textSuccess)}>
                    Discount: ₹{selectedPartForQuantity.discountPrice}
                  </Text>
                )}
                <Text style={clsx(styles.textSm, styles.fontBold, styles.textPrimary)}>
                  Unit Price: ₹{selectedPartForQuantity.unitPrice}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb4)}>
                <TouchableOpacity
                  onPress={() => {
                    const current = quantities[selectedPartForQuantity.key] || 1;
                    handleQuantitySubmit(Math.max(1, current - 1));
                  }}
                  style={clsx(
                    styles.w12,
                    styles.h12,
                    styles.bgGray200,
                    styles.roundedFull,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                >
                  <Icon name="remove" size={24} color={colors.black} />
                </TouchableOpacity>
                
                <TextInput
                  style={clsx(
                    styles.text2xl,
                    styles.fontBold,
                    styles.textBlack,
                    styles.textCenter,
                    styles.w20
                  )}
                  value={String(quantities[selectedPartForQuantity.key] || 1)}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    handleQuantitySubmit(num);
                  }}
                />
                
                <TouchableOpacity
                  onPress={() => {
                    const current = quantities[selectedPartForQuantity.key] || 1;
                    handleQuantitySubmit(current + 1);
                  }}
                  style={clsx(
                    styles.w12,
                    styles.h12,
                    styles.bgPrimary,
                    styles.roundedFull,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                >
                  <Icon name="add" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
              
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.textCenter, styles.mb4)}>
                Total: ₹{(selectedPartForQuantity.unitPrice * (quantities[selectedPartForQuantity.key] || 1))}
              </Text>
            </>
          )}
          
          <View style={clsx(styles.flexRow, styles.gap2)}>
            <TouchableOpacity
              onPress={() => {
                setShowQuantityModal(false);
                setSelectedPartForQuantity(null);
              }}
              style={clsx(
                styles.flex1,
                styles.bgGray200,
                styles.py3,
                styles.roundedLg,
                styles.itemsCenter
              )}
            >
              <Text style={clsx(styles.textBlack, styles.fontMedium)}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                if (selectedPartForQuantity) {
                  const current = quantities[selectedPartForQuantity.key] || 1;
                  handleQuantitySubmit(current);
                }
              }}
              style={clsx(
                styles.flex1,
                styles.bgSuccess,
                styles.py3,
                styles.roundedLg,
                styles.itemsCenter
              )}
            >
              <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading rate groups...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1)}>
      {/* Header */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt3, styles.pb4)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Add Parts
          </Text>
          <View style={clsx(styles.w6)} />
        </View>
        
        <Text style={clsx(styles.textWhite, styles.textBase)}>
          Booking ID: {formattedData?.bookingId}
        </Text>
        <Text style={clsx(styles.textWhite, styles.textSm, styles.opacity75)}>
          Service: {formattedData?.service}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={clsx(styles.pb8)}
      >
        {/* Amount Summary */}
        <View style={clsx(styles.p4)}>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.shadowSm,
            styles.mb4
          )}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Amount Summary
            </Text>
            
            <View style={clsx(styles.mb2)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb1)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  Original Service Amount:
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  ₹{originalAmount}
                </Text>
              </View>
              
              {/* Selected Parts List */}
              {getAllSelectedParts().length > 0 && (
                <View style={clsx(styles.mb2, styles.mt2, styles.pt2, styles.borderTop, styles.borderGray300)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Selected Parts:
                  </Text>
                  {getAllSelectedParts().map((part, index) => {
                    const quantity = quantities[part.key] || 1;
                    const partTotal = part.unitPrice * quantity;
                    return (
                      <View key={index} style={clsx(
                        styles.flexRow,
                        styles.justifyBetween,
                        styles.itemsCenter,
                        styles.mb2
                      )}>
                        <View style={clsx(styles.flex1)}>
                          <Text style={clsx(styles.textSm, styles.textBlack)} numberOfLines={1}>
                            {index + 1}. {part.description}
                          </Text>
                          <Text style={clsx(styles.textXs, styles.textMuted)}>
                            {part.groupTitle}
                          </Text>
                        </View>
                        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                          ₹{partTotal}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb1)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  Additional Parts Amount:
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                  + ₹{partsAmount}
                </Text>
              </View>
              
              <View style={clsx(
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.mt3,
                styles.pt3,
                styles.borderTop,
                styles.borderGray300
              )}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                  Grand Total:
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                  ₹{grandTotal}
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.mt3, styles.p3, styles.bgInfoLight, styles.rounded)}>
              <Text style={clsx(styles.textSm, styles.textInfo, styles.textCenter)}>
                💡 Amount will be sent for customer approval
              </Text>
            </View>
          </View>

          {/* Service Items */}
          {serviceItems.map((serviceItem, index) => (
            <ServiceItemSection
              key={index}
              serviceItem={serviceItem}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[
        clsx(
          styles.bgWhite,
          styles.px4,
          styles.py3,
          styles.borderTop,
          styles.borderLight,
          styles.flexRow,
          styles.justifyBetween,
          styles.itemsCenter
        ),
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      ]}>
        <TouchableOpacity
          style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.px4,
            styles.py3,
            styles.bgWhite,
            styles.border,
            styles.borderPrimary,
            styles.roundedLg,
            styles.flex1,
            styles.mx1
          )}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={20} color={colors.primary} style={clsx(styles.mr2)} />
          <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.px4,
            styles.py3,
            styles.bgSuccess,
            styles.roundedLg,
            styles.flex1,
            styles.mx1,
            (submitting || Object.keys(selectedParts).length === 0) && styles.opacity50
          )}
          onPress={submitPartsForApproval}
          disabled={submitting || Object.keys(selectedParts).length === 0}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Icon name="send" size={20} color={colors.white} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                Submit for Approval
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Quantity Modal */}
      <QuantityModal />
    </View>
  ); 
};

export default PartsSelectionScreen;