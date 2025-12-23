import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const WalletScreen = ({ navigation }) => {
  const { Toast, Urls, postData, user } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'credit', 'debit'
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Pagination states from API response
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });
  
  // Wallet summary states from API
  const [walletSummary, setWalletSummary] = useState({
    balance: 0,
    totalCreditPoints: 0,
    totalTransactions: 0,
  });

  // Fetch wallet data from API
  const fetchWalletData = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Prepare API parameters
      const currentPage = isLoadMore ? pagination.page + 1 : 1;
      const params = {
        type: filter === 'all' ? 'all' : filter,
        period: selectedPeriod,
        page: currentPage,
        limit: pagination.limit
      };
      
      // Call API to get wallet transactions and summary
      const response = await postData(
        params,
        `${Urls.walletHistory}`,
        'GET'
      );

      if (response?.success && response.data) {
        // Set transactions from API response
        if (isLoadMore) {
          // Append new data for load more
          setTransactions(prev => [...prev, ...(response.data || [])]);
        } else {
          // Set fresh data
          setTransactions(response.data || []);
        }
        
        // Set wallet summary from API response
        if (response.summary) {
          setWalletSummary(response.summary);
        }
        
        // Set pagination data from API response
        if (response.pagination) {
          setPagination({
            page: response.pagination.currentPage || currentPage,
            limit: response.pagination.limit || params.limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 1,
            hasPrevPage: response.pagination.hasPrevPage || false,
            hasNextPage: response.pagination.hasNextPage || false,
          });
        } else {
          // Set pagination from root level if not in pagination object
          setPagination({
            page: response.page || currentPage,
            limit: response.limit || params.limit,
            total: response.total || 0,
            totalPages: response.totalPages || 1,
            hasPrevPage: response.hasPrevPage || false,
            hasNextPage: response.hasNextPage || false,
          });
        }
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load wallet data',
        });
        
        // For demo, use sample data if API fails
        if (!isLoadMore) {
          const sampleData = getSampleData();
          setTransactions(sampleData.transactions);
          setWalletSummary(sampleData.summary);
          setPagination(sampleData.pagination);
        }
      }
      
    } catch (error) {
      console.error('Fetch wallet data error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to connect to server',
      });
      
      // For demo, use sample data
      if (!isLoadMore) {
        const sampleData = getSampleData();
        setTransactions(sampleData.transactions);
        setWalletSummary(sampleData.summary);
        setPagination(sampleData.pagination);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Sample data for demo (updated with pagination)
  const getSampleData = () => {
    const sampleTransactions = [
      {
        "_id": "694690004d9db9014826bae2",
        "providerId": "693fc8af129447368d022a26",
        "creditPoints": 100,
        "depositAmount": 1000,
        "depositStatus": "Paid",
        "dateOfDeposit": "2025-12-20T12:01:04.997Z",
        "paymentMode": "Online",
        "transactionType": "Credit",
        "transactionId": "mhjhg",
        "purpose": "Recharge",
        "status": true,
        "createdBy": "693c0e4a570a49d79868f38d",
        "updatedBy": null,
        "createdAt": "2025-12-20T12:01:04.999Z",
        "updatedAt": "2025-12-20T12:01:04.999Z",
        "__v": 0
      }
    ];
    
    const summary = {
      balance: 1300, // 1000 + 500 - 200
      totalCreditPoints: 150,
      totalTransactions: 3,
    };
    
    const paginationData = {
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
    };
    
    return {
      transactions: sampleTransactions,
      summary: summary,
      pagination: paginationData
    };
  };

  const handleAddCredit = () => {
    navigation.navigate('AddWallet', {
      onSuccess: () => {
        // Refresh wallet data after adding credit
        fetchWalletData();
      }
    });
  };

  const groupTransactionsByDate = () => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.dateOfDeposit || transaction.createdAt);
      const dateKey = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    // Convert to array for SectionList
    return Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date],
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchWalletData(true);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [filter, selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    if (status === 'Paid' || status === true) {
      return colors.success;
    }
    return colors.warning;
  };

  const getStatusText = (status) => {
    if (status === 'Paid' || status === true) {
      return 'Completed';
    }
    return 'Pending';
  };

  const getStatusIcon = (transactionType) => {
    switch (transactionType) {
      case 'Credit':
        return 'add-circle';
      case 'Debit':
        return 'remove-circle';
      default:
        return 'attach-money';
    }
  };

  const getTypeColor = (transactionType) => {
    switch (transactionType) {
      case 'Credit':
        return colors.success;
      case 'Debit':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const renderTransactionItem = ({ item }) => {
    const isCredit = item.transactionType === 'Credit';
    const statusColor = getStatusColor(item.depositStatus || item.status);

    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.p4,
          styles.roundedLg,
          styles.shadowSm,
          styles.mb3,
          styles.borderLeft4,
          isCredit ? styles.borderSuccess : styles.borderError
        )}
        onPress={() => handleViewTransaction(item)}
      >
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon 
              name={getStatusIcon(item.transactionType)} 
              size={24} 
              color={getTypeColor(item.transactionType)} 
              style={clsx(styles.mr3)}
            />
            <View>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {item.purpose || 'Wallet Transaction'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {item.transactionType} • {formatTime(item.dateOfDeposit || item.createdAt)}
              </Text>
            </View>
          </View>
          
          <View style={clsx(styles.itemsEnd)}>
            <Text style={clsx(
              styles.textBase,
              styles.fontBold,
              isCredit ? styles.textSuccess : styles.textError
            )}>
              {isCredit ? '+' : '-'}{formatCurrency(item.depositAmount)}
            </Text>
            
            {item.creditPoints > 0 && (
              <Text style={clsx(styles.textXs, styles.textPrimary, styles.mt1)}>
                +{item.creditPoints} Points
              </Text>
            )}
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
              <View style={clsx(
                styles.w2,
                styles.h2,
                styles.roundedFull,
                styles.mr1,
                { backgroundColor: statusColor }
              )} />
              <Text style={clsx(
                styles.textXs,
                styles.fontMedium,
                { color: statusColor }
              )}>
                {getStatusText(item.depositStatus || item.status)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mt2)}>
          <Text style={clsx(styles.textXs, styles.textMuted)}>
            Txn: {item.transactionId || item._id?.slice(-6)}
          </Text>
          
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon name="payment" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
            <Text style={clsx(styles.textXs, styles.textMuted)}>
              {item.paymentMode || 'Online'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleViewTransaction = (transaction) => {
    navigation.navigate('TransactionDetails', { transaction });
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={clsx(styles.mb3)}>
      <Text style={clsx(styles.textBase, styles.fontBold, styles.textMuted)}>
        {title}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!pagination.hasNextPage) {
      if (transactions.length === 0) {
        return null;
      }
      return (
        <View style={clsx(styles.py4, styles.itemsCenter)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            No more transactions to load
          </Text>
        </View>
      );
    }

    if (loadingMore) {
      return (
        <View style={clsx(styles.py4, styles.itemsCenter)}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
            Loading more...
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={clsx(
          styles.py3,
          styles.itemsCenter,
          styles.bgWhite,
          styles.roundedLg,
          styles.mt2,
          styles.shadowSm
        )}
        onPress={handleLoadMore}
      >
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
          Load More Transactions
        </Text>
        <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>
          Showing {transactions.length} of {pagination.total}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading wallet...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Wallet"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="settings"
        showProfile={false}
        onRightActionPress={() => navigation.navigate('Settings')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >

        {/* Wallet Balance Summary */}
        <View style={clsx(styles.mb6)}>
          <View style={clsx(styles.bgPrimary, styles.p4, styles.roundedLg, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb4)}>
              <View>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                  Wallet Balance
                </Text>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(walletSummary.balance)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.px4,
                  styles.py2,
                  styles.bgWhite,
                  styles.roundedFull,
                  styles.shadowSm
                )}
                onPress={handleAddCredit}
              >
                <Icon name="add" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                  Add Money
                </Text>
              </TouchableOpacity>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.pt-4, styles.borderTop, styles.borderWhite20)}>
              <View style={clsx(styles.itemsCenter, styles.flex1)}>
                <Text style={clsx(styles.textSm, styles.textWhite, styles.opacity75)}>
                  Credit Points
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {walletSummary.totalCreditPoints || 0}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter, styles.flex1)}>
                <Text style={clsx(styles.textSm, styles.textWhite, styles.opacity75)}>
                  Total Transactions
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {walletSummary.totalTransactions || 0}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter, styles.flex1)}>
                <Text style={clsx(styles.textSm, styles.textWhite, styles.opacity75)}>
                  Payment Mode
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  Online
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={clsx(styles.mb6)}>
          <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Filter by Type
            </Text>
            
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {[
                { key: 'all', label: 'All', icon: 'list' },
                { key: 'credit', label: 'Credits', icon: 'add-circle' },
                { key: 'debit', label: 'Debits', icon: 'remove-circle' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={clsx(
                    styles.px3,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    filter === item.key ? styles.bgPrimary : styles.bgGray
                  )}
                  onPress={() => setFilter(item.key)}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon 
                      name={item.icon} 
                      size={16} 
                      color={filter === item.key ? colors.white : colors.text}
                      style={clsx(styles.mr1)}
                    />
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      filter === item.key ? styles.textWhite : styles.textBlack
                    )}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt4, styles.mb3)}>
              Filter by Period
            </Text>
            
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={clsx(
                    styles.px3,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    selectedPeriod === item.key ? styles.bgSecondary : styles.bgGray
                  )}
                  onPress={() => setSelectedPeriod(item.key)}
                >
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    selectedPeriod === item.key ? styles.textWhite : styles.textBlack
                  )}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Recent Transactions ({pagination.total})
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Page {pagination.page} of {pagination.totalPages}
            </Text>
          </View>

          {transactions.length === 0 ? (
            <View style={clsx(styles.bgWhite, styles.p6, styles.roundedLg, styles.itemsCenter)}>
              <Icon name="receipt-long" size={48} color={colors.textMuted} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mt3, styles.mb-2)}>
                No transactions found
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                {filter !== 'all' ? `No ${filter} transactions` : 'No transactions for selected period'}
              </Text>
              <TouchableOpacity
                style={clsx(styles.mt4, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
                onPress={() => {
                  setFilter('all');
                  setSelectedPeriod('all');
                }}
              >
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <SectionList
                sections={groupTransactionsByDate()}
                keyExtractor={(item) => item._id}
                renderItem={renderTransactionItem}
                renderSectionHeader={renderSectionHeader}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={clsx(styles.pb2)}
              />
              
              {/* Load More Footer */}
              {renderFooter()}
            </>
          )}
        </View>

        {/* Help Section */}
        <View style={clsx(styles.mt6, styles.bgInfoLight, styles.p4, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo, styles.mb2)}>
            Wallet Information
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Credits are added when you deposit money
            {'\n'}• Debits include service commissions and charges
            {'\n'}• Credit points can be used for service bookings
            {'\n'}• All transactions are updated in real-time
            {'\n'}• For any discrepancy, contact support within 24 hours
          </Text>
          
          <TouchableOpacity
            style={clsx(styles.mt4, styles.flexRow, styles.itemsCenter)}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="support-agent" size={18} color={colors.info} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textInfo)}>
              Report Transaction Issue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View> 
  );
};

export default WalletScreen;