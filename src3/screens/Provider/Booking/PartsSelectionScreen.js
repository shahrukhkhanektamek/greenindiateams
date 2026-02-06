import React, { useState, useEffect, useContext, useRef, useMemo, useCallback, memo } from 'react';
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
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

// Memoized RateItem Component
const RateItem = memo(({ 
  rate, 
  serviceItemId, 
  groupTitle, 
  isSelected,
  quantity,
  addingPartId,
  buttonPressedId,
  handlePartSelect,
  openQuantityModal,
  handleQuantityChange,
  removePart
}) => {
  const key = `${rate._id}_${serviceItemId}`;
  const price = parseFloat(rate.serviceCharge?.price || 0);
  const labourCharge = parseFloat(rate.serviceCharge?.labourCharge || 0);
  const discountPrice = parseFloat(rate.serviceCharge?.discountPrice || 0);
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
          {/* {price > 0 && (
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mr2)}>
              Parts: ₹{price}
            </Text>
          )} */}
          
          {/* {labourCharge > 0 && (
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mr2)}>
              Labour: ₹{labourCharge}
            </Text>
          )} */}
          
        </View>
          {/* {discountPrice > 0 && (
            <Text style={clsx(styles.textSm, styles.textSuccess, styles.mr2)}>
              Discount: ₹{discountPrice}
            </Text>
          )} */}
        
        <Text style={clsx(styles.textSm, styles.fontBold, styles.textPrimary, styles.mt1)}>
          Unit Price: ₹{unitPrice}
        </Text>
        
        {isSelected && (
          <Text style={clsx(styles.textSm, styles.fontBold, styles.textSuccess, styles.mt1)}>
            Total: ₹{itemTotalPrice}
          </Text>
        )}
      </View>
      
      {isSelected ? (
        <View style={clsx(styles.flexRow, styles.itemsCenter)}>
          <View style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.bgWhite,
            styles.border,
            styles.borderGray300,
            styles.roundedFull,
            styles.p1,
            styles.mr2
          )}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(key, -1)}
              style={clsx(
                styles.w8,
                styles.h8,
                styles.bgGray200,
                styles.roundedFull,
                styles.itemsCenter,
                styles.justifyCenter
              )}
            >
              <Icon name="remove" size={16} color={colors.black} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => openQuantityModal(rate, serviceItemId, groupTitle)}
              style={clsx(styles.px3, styles.mx1)}
            >
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                {quantity}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuantityChange(key, 1)}
              style={clsx(
                styles.w8,
                styles.h8,
                styles.bgPrimary,
                styles.roundedFull,
                styles.itemsCenter,
                styles.justifyCenter
              )}
            >
              <Icon name="add" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* <TouchableOpacity
            onPress={() => removePart(key)}
            style={clsx(
              styles.w8,
              styles.h8,
              styles.bgDanger,
              styles.roundedFull,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.ml1
            )}
          >
            <Icon name="delete" size={16} color={colors.white} />
          </TouchableOpacity> */}
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => handlePartSelect(rate, serviceItemId, groupTitle)}
          disabled={isAdding || isButtonPressed}
          style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.px4,
            styles.py2,
            isButtonPressed ? styles.bgSuccess : (isAdding ? styles.bgGray400 : styles.bgPrimary),
            styles.roundedFull,
            (isAdding || isButtonPressed) && styles.opacity90
          )}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : isButtonPressed ? (
            <>
              <Icon name="check" size={18} color={colors.white} style={clsx(styles.mr1)} />
              <Text style={clsx(styles.textWhite, styles.textSm, styles.fontMedium)}>
                Added
              </Text>
            </>
          ) : (
            <>
              <Icon name="add" size={18} color={colors.white} style={clsx(styles.mr1)} />
              <Text style={clsx(styles.textWhite, styles.textSm, styles.fontMedium)}>
                Add
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

// Memoized RateGroupSection
const RateGroupSection = memo(({ 
  group, 
  serviceItemId, 
  selectedParts, 
  quantities,
  handlePartSelect,
  openQuantityModal,
  handleQuantityChange,
  removePart,
  addingPartId,
  buttonPressedId
}) => {
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
        const quantity = quantities[key] || 1;
        
        return (
          <RateItem
            key={`${rate._id}_${index}`}
            rate={rate}
            serviceItemId={serviceItemId}
            groupTitle={group.title}
            isSelected={isSelected}
            quantity={quantity}
            addingPartId={addingPartId}
            buttonPressedId={buttonPressedId}
            handlePartSelect={handlePartSelect}
            openQuantityModal={openQuantityModal}
            handleQuantityChange={handleQuantityChange}
            removePart={removePart}
          />
        );
      })}
    </View>
  );
});

// Memoized ServiceItemTabContent
const ServiceItemTabContent = memo(({ 
  serviceItem,
  searchQuery,
  isSearching,
  filteredRateGroups,
  selectedParts,
  quantities,
  handleSearchChange,
  handleSearchSubmit,
  clearSearch,
  handlePartSelect,
  openQuantityModal,
  handleQuantityChange,
  removePart,
  addingPartId,
  buttonPressedId
}) => {
  if (!serviceItem) return null;
  
  const selectedPartsForService = Object.values(selectedParts).filter(
    part => part.serviceItemId === serviceItem.id
  );
  
  return (
    <View style={clsx(styles.flex1)}>
      {/* Service Item Header */}
      <View style={clsx(styles.mb4, styles.p3, styles.bgWhite, styles.roundedLg, styles.shadowSm)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
          {serviceItem.name}
        </Text>
        <Text style={clsx(styles.textSm, styles.textMuted)}>
          Qty: {serviceItem.quantity} × ₹{serviceItem.price} = ₹{serviceItem.total}
        </Text>
      </View>
      
      {/* Search Bar for this Service Item */}
      <View style={clsx(styles.mb3)}>
        <View style={clsx(
          styles.flexRow,
          styles.itemsCenter,
          styles.bgGray100,
          styles.roundedFull,
          styles.px4,
          styles.py2
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
            onChangeText={(text) => handleSearchChange(serviceItem.id, text)}
            placeholderTextColor={colors.gray500}
            returnKeyType="search"
            onSubmitEditing={() => handleSearchSubmit(serviceItem.id)}
            blurOnSubmit={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => clearSearch(serviceItem.id)}
              style={clsx(styles.ml2)}
            >
              <Icon name="close" size={20} color={colors.gray500} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => handleSearchSubmit(serviceItem.id)}
            disabled={isSearching}
            style={clsx(
              styles.ml2,
              styles.px3,
              styles.py1,
              styles.bgPrimary,
              styles.roundedFull,
              isSearching && styles.opacity50
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
      
      {/* Selected Parts Summary for this Service */}
      {selectedPartsForService.length > 0 && (
        <View style={clsx(styles.mb3, styles.p3, styles.bgSuccessLight, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textSuccess, styles.mb2)}>
            Selected Parts for {serviceItem.name} ({selectedPartsForService.length})
          </Text>
          {selectedPartsForService.map((part, index) => {
            const quantity = quantities[part.key] || 1;
            const partTotal = part.unitPrice * quantity;
            return (
              <View key={part.key} style={clsx(
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.mb1
              )}>
                <Text style={clsx(styles.textSm, styles.textSuccessDark)} numberOfLines={1}>
                  {index + 1}. {part.description}
                </Text>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textSuccessDark)}>
                  ₹{partTotal}
                </Text>
              </View>
            );
          })}
        </View>
      )}
      
      {/* Available Parts */}
      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
        Available Parts:
      </Text>
      
      {isSearching ? (
        <View style={clsx(styles.py6, styles.itemsCenter)}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
            Searching parts...
          </Text>
        </View>
      ) : filteredRateGroups.length > 0 ? (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={[clsx(styles.maxH96), {marginBottom:50}]}
        >
          {filteredRateGroups.map((group, index) => (
            <RateGroupSection
              key={`${group._id || group.title}_${index}`}
              group={group}
              serviceItemId={serviceItem.id}
              selectedParts={selectedParts}
              quantities={quantities}
              handlePartSelect={handlePartSelect}
              openQuantityModal={openQuantityModal}
              handleQuantityChange={handleQuantityChange}
              removePart={removePart}
              addingPartId={addingPartId}
              buttonPressedId={buttonPressedId}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={clsx(styles.py6, styles.itemsCenter)}>
          <Icon name="search-off" size={48} color={colors.gray400} style={clsx(styles.mb2)} />
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
            {searchQuery ? 'No parts found matching your search' : 'No rate groups available for this service'}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              onPress={() => clearSearch(serviceItem.id)}
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
});

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
  const [searchQueries, setSearchQueries] = useState({});
  const [addingPartId, setAddingPartId] = useState(null);
  const [searchingServiceId, setSearchingServiceId] = useState(null);
  const [buttonPressedId, setButtonPressedId] = useState(null);
  const [tempQuantities, setTempQuantities] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [localSearchText, setLocalSearchText] = useState('');

  const searchTimeoutRef = useRef(null);
  const searchInputRefs = useRef({});
  const flatListRef = useRef(null);

  // Memoized initial amounts calculation
  const calculateInitialAmounts = useCallback(() => {
    try {
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

      const items = bookingItems.map((item, index) => ({
        id: item._id,
        serviceId: item.service?._id || item._id,
        name: item.service?.name || `Service Item ${index + 1}`,
        quantity: item.quantity || 1,
        price: item.salePrice || 0,
        total: (item.salePrice || 0) * (item.quantity || 1),
        index: index
      }));
      setServiceItems(items);
      
      const initialSearchQueries = {};
      bookingItems.forEach(item => {
        initialSearchQueries[item._id] = '';
      });
      setSearchQueries(initialSearchQueries);
      
    } catch (error) {
      console.error('Error calculating amounts:', error);
    }
  }, [bookingData]);

  useEffect(() => {
    calculateInitialAmounts();
    fetchRateGroups();
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    calculateTotalAmounts();
  }, [selectedParts, quantities]);

  useEffect(() => {
    if (rateGroups.length > 0) {
      setFilteredRateGroups(rateGroups);
    }
  }, [rateGroups]);

  const fetchRateGroups = async () => { 
    try {
      setLoading(true);
      
      const bookingItems = bookingData?.booking?.bookingItems || [];
      if (bookingItems.length === 0) {
        setLoading(false);
        return;
      }
      
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
    
    Object.values(selectedParts).forEach(part => {
      const quantity = quantities[part.key] || 1;
      partsTotal += (part.unitPrice || 0) * quantity;
    });
    
    setPartsAmount(partsTotal);
    setGrandTotal(originalAmount + partsTotal);
  };

  const handlePartSelect = async (rate, serviceItemId, groupTitle) => {
    const key = `${rate._id}_${serviceItemId}`;
    
    setButtonPressedId(key);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (selectedParts[key]) {
      openQuantityModal(rate, serviceItemId, groupTitle);
    } else {
      setAddingPartId(key);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const unitPrice = parseFloat(rate.unitPrice || 0);
      const price = parseFloat(rate.serviceCharge?.price || 0);
      const labourCharge = parseFloat(rate.serviceCharge?.labourCharge || 0);
      const discountPrice = parseFloat(rate.serviceCharge?.discountPrice || 0);
      
      const serviceItem = serviceItems.find(s => s.id === serviceItemId);
      
      setSelectedParts(prev => ({
        ...prev,
        [key]: {
          key: key,
          rateId: rate._id,
          description: rate.description,
          unitPrice: unitPrice,
          originalPrice: price,
          labourCharge: labourCharge,
          discountPrice: discountPrice,
          serviceItemId: serviceItem?.id,
          serviceId: serviceItem?.serviceId,
          serviceItemName: serviceItem?.name,
          groupTitle: groupTitle
        }
      }));
      
      setQuantities(prev => ({
        ...prev,
        [key]: 1
      }));
      
      setAddingPartId(null);
      setButtonPressedId(null);
      
      Toast.show({
        type: 'success',
        text1: 'Added',
        text2: 'Part added with quantity 1',
      });
    }
  };

  const handleQuantityChange = (partKey, increment) => {
    const currentQty = quantities[partKey] || 1;
    const newQty = currentQty + increment;
    
    if (newQty < 1) {
      removePart(partKey);
      return;
    }
    
    setQuantities(prev => ({
      ...prev,
      [partKey]: newQty
    }));
    
    Toast.show({
      type: 'info',
      text1: 'Updated',
      text2: `Quantity updated to ${newQty}`,
    });
  };

  const removePart = (partKey) => {
    if (!selectedParts[partKey]) return;
    
    const part = selectedParts[partKey];
    
    setSelectedParts(prev => {
      const newSelectedParts = { ...prev };
      delete newSelectedParts[partKey];
      return newSelectedParts;
    });
    
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[partKey];
      return newQuantities;
    });
    
    Toast.show({
      type: 'success',
      text1: 'Removed',
      text2: `${part.description} removed`,
    });
  };

  const openQuantityModal = (rate, serviceItemId, groupTitle) => {
    const key = `${rate._id}_${serviceItemId}`;
    const unitPrice = parseFloat(rate.unitPrice || 0);
    const price = parseFloat(rate.serviceCharge?.price || 0);
    const labourCharge = parseFloat(rate.serviceCharge?.labourCharge || 0);
    const discountPrice = parseFloat(rate.serviceCharge?.discountPrice || 0);
    
    const serviceItem = serviceItems.find(s => s.id === serviceItemId);
    
    setSelectedPartForQuantity({
      key: key,
      rateId: rate._id,
      description: rate.description,
      unitPrice: unitPrice,
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
    if (!selectedPartForQuantity) return;
    
    if (quantity < 1) {
      removePart(selectedPartForQuantity.key);
      Toast.show({
        type: 'info',
        text1: 'Removed',
        text2: 'Quantity set to 0, part removed',
      });
    } else {
      setQuantities(prev => ({
        ...prev,
        [selectedPartForQuantity.key]: quantity
      }));
      
      if (!selectedParts[selectedPartForQuantity.key]) {
        setSelectedParts(prev => ({
          ...prev,
          [selectedPartForQuantity.key]: selectedPartForQuantity
        }));
      }
      
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: `Quantity updated to ${quantity}`,
      });
    }
    
    setShowQuantityModal(false);
    setSelectedPartForQuantity(null);
  };

  // Optimized search handler with debouncing
  const handleSearchChange = useCallback((serviceItemId, text) => {
    // Update search query immediately for UI
    setSearchQueries(prev => ({
      ...prev,
      [serviceItemId]: text
    }));
    
    // Set local search text
    setLocalSearchText(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set searching state
    setSearchingServiceId(serviceItemId);
    
    // Debounce the actual search
    searchTimeoutRef.current = setTimeout(() => {
      filterRatesBySearch(serviceItemId, text);
    }, 300);
  }, []);

  const filterRatesBySearch = useCallback((serviceItemId, searchText) => {
    if (!searchText.trim()) {
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
  }, [rateGroups]);

  const handleSearchSubmit = (serviceItemId) => {
    const searchText = searchQueries[serviceItemId] || '';
    filterRatesBySearch(serviceItemId, searchText);
  };

  const clearSearch = (serviceItemId) => {
    setSearchQueries(prev => ({
      ...prev,
      [serviceItemId]: ''
    }));
    setLocalSearchText('');
    filterRatesBySearch(serviceItemId, '');
  };

  const submitPartsForApproval = async () => {
    try {
      setSubmitting(true);
      
      const partsData = Object.values(selectedParts).map(part => {
        const quantity = quantities[part.key] || 1;
        return {
          serviceItemId: part.serviceItemId,
          serviceId: part.serviceId,
          rateId: part.rateId,
          description: part.description,
          unitPrice: part.unitPrice,
          quantity: quantity,
          discount: part.discountPrice || 0,
          price: part.price || part.originalPrice || 0,
          labourCharge: part.labourCharge,
          totalPrice: part.unitPrice * quantity,
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
                    handleQuantitySubmit(Math.max(0, current - 1));
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
                    const num = parseInt(text) || 0;
                    if (num === 0) {
                      return;
                    }
                    setTempQuantities(prev => ({
                      ...prev,
                      [selectedPartForQuantity.key]: num
                    }));
                  }}
                  onBlur={() => {
                    const current = tempQuantities[selectedPartForQuantity.key];
                    if (current !== undefined && current > 0) {
                      handleQuantitySubmit(current);
                    }
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
              
              <View style={clsx(styles.mb3)}>
                <TouchableOpacity
                  onPress={() => {
                    handleQuantitySubmit(0);
                    Toast.show({
                      type: 'info',
                      text1: 'Removed',
                      text2: 'Part removed (quantity set to 0)',
                    });
                  }}
                  style={clsx(
                    styles.bgDangerLight,
                    styles.py2,
                    styles.roundedLg,
                    styles.itemsCenter
                  )}
                >
                  <Text style={clsx(styles.textDanger, styles.fontMedium)}>
                    Remove Part (Set Quantity to 0)
                  </Text>
                </TouchableOpacity>
              </View>
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

  // Memoized main render
  const renderServiceItemTabs = useMemo(() => {
    if (serviceItems.length <= 1) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={clsx(styles.bgWhite, styles.borderBottom, styles.borderGray)}
      >
        <View style={clsx(styles.flexRow)}>
          {serviceItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActiveTab(index)}
              style={clsx(
                styles.px4,
                styles.py3,
                index === activeTab ? styles.bgGray : styles.bgWhite,
                styles.borderBottom2,
                index === activeTab ? styles.borderPrimary : styles.borderTransparent
              )}
            >
              <Text style={clsx(
                styles.textBase,
                styles.fontMedium,
                index === activeTab ? styles.textPrimary : styles.textMuted
              )}>
                {item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
              </Text>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                <View style={clsx(
                  styles.w5,
                  styles.h5,
                  styles.roundedFull,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  index === activeTab ? styles.bgPrimary : styles.bgGray400,
                  styles.mr1
                )}>
                  <Text style={clsx(styles.textXs, styles.textWhite)}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={clsx(styles.textXs, styles.textMuted)}>
                  ₹{item.total}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }, [serviceItems, activeTab]);

  const renderAmountSummary = useMemo(() => {
    const allSelectedParts = Object.values(selectedParts);
    
    return (
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
          
          {allSelectedParts.length > 0 && (
            <View style={clsx(styles.mb2, styles.mt2, styles.pt2, styles.borderTop, styles.borderGray300)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Selected Parts ({allSelectedParts.length}):
              </Text>
              {allSelectedParts.map((part, index) => {
                const quantity = quantities[part.key] || 1;
                const partTotal = part.unitPrice * quantity;
                const serviceItem = serviceItems.find(s => s.id === part.serviceItemId);
                return (
                  <View key={part.key} style={clsx(
                    styles.flexRow,
                    styles.justifyBetween,
                    styles.itemsCenter,
                    styles.mb2
                  )}>
                    <View style={clsx(styles.flex1)}>
                      <Text style={clsx(styles.textSm, styles.textBlack)} numberOfLines={1}>
                        {index + 1}. {part.description}
                      </Text>
                      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                        <Text style={clsx(styles.textXs, styles.textMuted)}>
                          Qty: {quantity} × ₹{part.unitPrice}
                        </Text>
                        <View style={clsx(styles.mx2, styles.w1, styles.h1, styles.bgGray400, styles.roundedFull)} />
                        <Text style={clsx(styles.textXs, styles.textMuted)}>
                          {serviceItem?.name || 'Service'}
                        </Text>
                      </View>
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
            💡 Currently viewing: {serviceItems[activeTab]?.name}
          </Text>
        </View>
      </View>
    );
  }, [originalAmount, partsAmount, grandTotal, selectedParts, quantities, serviceItems, activeTab]);

  const currentServiceItem = useMemo(() => {
    return serviceItems[activeTab] || null;
  }, [serviceItems, activeTab]);

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

      <View style={clsx(styles.flex1)}>
        {/* Service Items Tabs */}
        {renderServiceItemTabs}
        
        {/* Amount Summary */}
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={clsx(styles.pb32)}
          keyboardShouldPersistTaps="handled"
        >
          <View style={clsx(styles.p4)}>
            {renderAmountSummary}

            {/* Service Item Tab Content */}
            <View style={clsx(styles.mt4)}>
              {currentServiceItem && (
                <ServiceItemTabContent
                  serviceItem={currentServiceItem}
                  searchQuery={searchQueries[currentServiceItem.id] || ''}
                  isSearching={searchingServiceId === currentServiceItem.id}
                  filteredRateGroups={filteredRateGroups}
                  selectedParts={selectedParts}
                  quantities={quantities}
                  handleSearchChange={handleSearchChange}
                  handleSearchSubmit={handleSearchSubmit}
                  clearSearch={clearSearch}
                  handlePartSelect={handlePartSelect}
                  openQuantityModal={openQuantityModal}
                  handleQuantityChange={handleQuantityChange}
                  removePart={removePart}
                  addingPartId={addingPartId}
                  buttonPressedId={buttonPressedId}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>

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