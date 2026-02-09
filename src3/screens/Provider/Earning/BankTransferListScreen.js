import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';
import Header from '../../../components/Common/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BankTransferListScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  // API filter parameters
  const [apiFilters, setApiFilters] = useState({
    search: '',
    paymentStatus: '',
    paymentMode: '',
    dateRange: '',
    minAmount: '',
    maxAmount: '',
  });

  // Status tabs
  const statusTabs = [
    { id: '', label: 'All', status: '' },
    { id: 'success', label: 'Success', status: 'success' },
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'failed', label: 'Failed', status: 'failed' },
  ];

  // Payment mode tabs
  const paymentModeTabs = [
    { id: '', label: 'All Modes', mode: '' },
    { id: 'online', label: 'Online', mode: 'online' },
    { id: 'bank_transfer', label: 'Bank Transfer', mode: 'bank_transfer' },
    { id: 'upi', label: 'UPI', mode: 'upi' },
  ];

  // Date ranges
  const dateRanges = [
    { id: '', label: 'All Time', dateRange: '' },
    { id: 'today', label: 'Today', dateRange: 'today' },
    { id: 'week', label: 'This Week', dateRange: 'week' },
    { id: 'month', label: 'This Month', dateRange: 'month' },
    { id: 'year', label: 'This Year', dateRange: 'year' },
  ];

  // Amount ranges
  const amountRanges = [
    { id: '', label: 'All Amounts', minAmount: '', maxAmount: '' },
    { id: 'small', label: '₹0 - ₹1000', minAmount: '0', maxAmount: '1000' },
    { id: 'medium', label: '₹1000 - ₹5000', minAmount: '1000', maxAmount: '5000' },
    { id: 'large', label: '₹5000 - ₹10000', minAmount: '5000', maxAmount: '10000' },
    { id: 'xlarge', label: '₹10000+', minAmount: '10000', maxAmount: '' },
  ];

  const [activeStatusTab, setActiveStatusTab] = useState('');
  const [activePaymentModeTab, setActivePaymentModeTab] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: '',
    amountRange: '',
  });

  const fetchTransfers = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      if (isLoadMore) setLoadingMore(true);

      const params = {
        page,
        limit: 10,
      };

      // Add API filters
      if (apiFilters.search) params.search = apiFilters.search;
      if (apiFilters.paymentStatus) params.paymentStatus = apiFilters.paymentStatus;
      if (apiFilters.paymentMode) params.paymentMode = apiFilters.paymentMode;
      if (apiFilters.dateRange) params.dateRange = apiFilters.dateRange;
      if (apiFilters.minAmount) params.minAmount = apiFilters.minAmount;
      if (apiFilters.maxAmount) params.maxAmount = apiFilters.maxAmount;

      console.log('Fetching bank transfers with params:', params);

      const response = await postData(params, Urls.bankTransfers, 'GET', {
        showErrorMessage: false, 
        showSuccessMessage: false
      });

      if (response?.success) {
        const { data, totalRecords, currentPage, limit, totalPages } = response;
        
        // Calculate pagination flags
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;

        // Format the data
        const formattedTransfers = data.map(item => {
          // Format dates
          let formattedFromDate = '';
          let formattedToDate = '';
          let formattedCreatedAt = '';
          
          if (item.fromDate) {
            const fromDate = new Date(item.fromDate);
            formattedFromDate = fromDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }
          
          if (item.toDate) {
            const toDate = new Date(item.toDate);
            formattedToDate = toDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }
          
          if (item.createdAt) {
            const createdAt = new Date(item.createdAt);
            formattedCreatedAt = createdAt.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            
            // Add time if needed
            const createdTime = createdAt.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });
            formattedCreatedAt += ` ${createdTime}`;
          }

          // Generate transaction ID
          const transactionId = item._id ? `TR${item._id.slice(-8).toUpperCase()}` : 'N/A';

          return {
            id: item._id,
            transactionId,
            amount: item.amount || 0,
            fromDate: formattedFromDate,
            toDate: formattedToDate,
            paymentStatus: item.paymentStatus || 'pending',
            paymentMode: item.paymentMode || 'online',
            createdAt: formattedCreatedAt,
            originalData: item,
            rawDates: {
              fromDate: item.fromDate,
              toDate: item.toDate,
              createdAt: item.createdAt,
            }
          };
        });

        if (isLoadMore) {
          setTransfers(prev => [...prev, ...formattedTransfers]);
        } else {
          setTransfers(formattedTransfers);
        }

        setPagination({
          page: currentPage,
          limit,
          total: totalRecords,
          totalPages,
          hasPrevPage,
          hasNextPage,
        });

        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load bank transfers',
        });
        return { success: false };
      }
    } catch (error) {
      console.error('Error fetching bank transfers:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load bank transfers. Please try again.',
      });
      return { success: false };
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [apiFilters]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setApiFilters(prev => ({
        ...prev,
        search: searchQuery
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTransfers = async () => {
    await fetchTransfers(1, false);
  };

  const loadMoreTransfers = async () => {
    if (loadingMore || !pagination.hasNextPage) return;
    
    const nextPage = pagination.page + 1;
    await fetchTransfers(nextPage, true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransfers(1, false);
    setRefreshing(false);
    
    // Toast.show({
    //   type: 'success',
    //   text1: 'Refreshed',
    //   text2: 'Bank transfers list updated',
    // });
  };

  const handleStatusTabChange = (tabId) => {
    setActiveStatusTab(tabId);
    const tab = statusTabs.find(t => t.id === tabId);
    setApiFilters(prev => ({
      ...prev,
      paymentStatus: tab?.status || ''
    }));
  };

  const handlePaymentModeTabChange = (tabId) => {
    setActivePaymentModeTab(tabId);
    const tab = paymentModeTabs.find(t => t.id === tabId);
    setApiFilters(prev => ({
      ...prev,
      paymentMode: tab?.mode || ''
    }));
  };

  const handleFilterApply = () => {
    const dateFilter = dateRanges.find(dr => dr.id === selectedFilters.dateRange);
    const amountFilter = amountRanges.find(ar => ar.id === selectedFilters.amountRange);

    const newFilters = {
      ...apiFilters,
      dateRange: dateFilter?.dateRange || '',
      minAmount: amountFilter?.minAmount || '',
      maxAmount: amountFilter?.maxAmount || '',
    };

    setApiFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleFilterReset = () => {
    setActiveStatusTab('');
    setActivePaymentModeTab('');
    setSelectedFilters({
      dateRange: '',
      amountRange: '',
    });
    
    setApiFilters({
      search: '',
      paymentStatus: '',
      paymentMode: '',
      dateRange: '',
      minAmount: '',
      maxAmount: '',
    });
    
    setSearchQuery('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'success': return colors.success + '20';
      case 'pending': return colors.warning + '20';
      case 'failed': return colors.error + '20';
      default: return colors.gray + '20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'success': return 'Success';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'online': return 'credit-card';
      case 'bank_transfer': return 'account-balance';
      case 'upi': return 'smartphone';
      default: return 'payment';
    }
  };

  const getPaymentModeLabel = (mode) => {
    switch (mode) {
      case 'online': return 'Online Payment';
      case 'bank_transfer': return 'Bank Transfer';
      case 'upi': return 'UPI';
      default: return mode?.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') || 'Payment';
    }
  };

  const renderTransferCard = ({ item: transfer }) => {
    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.mb3,
          styles.shadowSm
        )}
        // onPress={() => navigation.navigate('BankTransferDetail', { transfer: transfer.originalData })}
        activeOpacity={0.7}
      >
        {/* Top Section - Transaction ID & Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
              { backgroundColor: getStatusBgColor(transfer.paymentStatus) }]}>
              <Icon 
                name={getPaymentModeIcon(transfer.paymentMode)} 
                size={20} 
                color={getStatusColor(transfer.paymentStatus)} 
              />
            </View>
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb1)} 
                numberOfLines={1}>
                {getPaymentModeLabel(transfer.paymentMode)}
              </Text>
              {/* <Text style={clsx(styles.textSm, styles.textMuted)}>
                ID: {transfer.transactionId}
              </Text> */}
            </View>
          </View>
          <View style={clsx(
            styles.px3,
            styles.py1,
            styles.roundedFull,
            { backgroundColor: getStatusBgColor(transfer.paymentStatus) }
          )}>
            <Text style={clsx(
              styles.textXs,
              styles.fontMedium,
              { color: getStatusColor(transfer.paymentStatus) }
            )} numberOfLines={1}>
              {getStatusLabel(transfer.paymentStatus)}
            </Text>
          </View>
        </View>

        {/* Amount Section */}
        <View style={clsx(styles.mb4)}>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
            Transfer Amount
          </Text>
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary)}>
            ₹{transfer.amount.toFixed(2)}
          </Text>
        </View>

        {/* Date Range Section */}
        <View style={clsx(styles.mb4, styles.bgGray50, styles.p3, styles.roundedMd)}>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>
            Period
          </Text>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
            <View>
              <Text style={clsx(styles.textXs, styles.textMuted)}>From</Text>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                {transfer.fromDate || 'N/A'}
              </Text>
            </View>
            <Icon name="arrow-forward" size={16} color={colors.textMuted} />
            <View>
              <Text style={clsx(styles.textXs, styles.textMuted)}>To</Text>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                {transfer.toDate || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section - Created Date & Action */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textXs, styles.textMuted)}>
              Transferred On
            </Text>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
              {transfer.createdAt}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabItem = (tab, activeTab, onPress, isStatusTab = true) => (
    <TouchableOpacity
      key={tab.id}
      style={clsx(
        styles.px3,
        styles.py2,
        styles.mr2,
        styles.roundedFull,
        activeTab === tab.id ? styles.bgPrimary : styles.bgGray100,
        { minWidth: 80 }
      )}
      onPress={() => onPress(tab.id)}
      activeOpacity={0.7}
    >
      <Text style={clsx(
        styles.textSm,
        styles.fontMedium,
        styles.textCenter,
        activeTab === tab.id ? styles.textWhite : styles.textBlack
      )} numberOfLines={1}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterOption = (filterType, options, title) => (
    <View style={clsx(styles.mb6)}>
      <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
        {title}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={clsx(styles.pb2)}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={clsx(
              styles.px3,
              styles.py2,
              styles.mr2,
              styles.roundedFull,
              selectedFilters[filterType] === option.id ? styles.bgPrimary : styles.bgGray100,
              { minWidth: 80 }
            )}
            onPress={() => setSelectedFilters({...selectedFilters, [filterType]: option.id})}
            activeOpacity={0.7}
          >
            <Text style={clsx(
              styles.textSm,
              styles.fontMedium,
              styles.textCenter,
              selectedFilters[filterType] === option.id ? styles.textWhite : styles.textBlack
            )} numberOfLines={1}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={clsx(styles.p4, styles.itemsCenter)}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
          Loading more transfers...
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading bank transfers...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Bank Transfers"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="filter-list"
        showProfile={false}
        onRightActionPress={() => setFilterModalVisible(true)}
      />

    

      {/* Transfers List */}
      <FlatList
        data={transfers}
        renderItem={renderTransferCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={clsx(styles.px4, styles.py3)}
        ListEmptyComponent={
          <View style={clsx(styles.itemsCenter, styles.justifyCenter, styles.py6, styles.px4)}>
            <Icon name="account-balance" size={80} color={colors.gray300} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4, styles.textCenter)}>
              No bank transfers found
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
              {searchQuery || apiFilters.paymentStatus || apiFilters.paymentMode 
                ? 'No transfers match your current filters'
                : 'No bank transfers available'
              }
            </Text>
            {(searchQuery || apiFilters.paymentStatus || apiFilters.paymentMode) && (
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.mt6,
                  styles.px4,
                  styles.py3,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={handleFilterReset}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={18} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml2)}>
                  Reset Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListHeaderComponent={
          transfers.length > 0 ? (
            <View style={clsx(styles.mb3)}>
              
              {(apiFilters.paymentStatus || apiFilters.paymentMode || apiFilters.search) && (
                <TouchableOpacity
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.mt2,
                    styles.selfStart,
                    styles.px3,
                    styles.py1,
                    styles.bgGray100,
                    styles.roundedFull
                  )}
                  onPress={handleFilterReset}
                  activeOpacity={0.7}
                >
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Clear filters
                  </Text>
                  <Icon name="close" size={14} color={colors.textMuted} style={clsx(styles.ml1)} />
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreTransfers}
        onEndReachedThreshold={0.3}
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
          <View style={clsx(styles.bgWhite, styles.p6, { height: 500 })}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Filter Transfers
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} activeOpacity={0.7}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={clsx(styles.flex1)}>
              {/* Date Range Filter */}
              {renderFilterOption('dateRange', dateRanges, 'Date Range')}

              {/* Amount Range Filter */}
              {renderFilterOption('amountRange', amountRanges, 'Amount Range')}

              {/* Action Buttons */}
              <View style={clsx(styles.flexRow, styles.gap3, styles.mt4, styles.mb6)}>
                <TouchableOpacity
                  style={clsx(
                    styles.flex1,
                    styles.border,
                    styles.borderPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                  onPress={handleFilterReset}
                  activeOpacity={0.7}
                >
                  <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                    Reset All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={clsx(
                    styles.flex1,
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                  onPress={handleFilterApply}
                  activeOpacity={0.7}
                >
                  <Text style={clsx(styles.textWhite, styles.fontBold)}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BankTransferListScreen;