import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';

const TransactionHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'credit', 'debit', 'withdrawal'
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'today', 'week', 'month'
  const [stats, setStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    totalWithdrawal: 0,
    netBalance: 0,
  });

  const [totalEarnings, setTotalEarnings] = useState({
      daily: 0,
      weekly: 0,
      monthly: 0,
      total: 0,
    });

  // Sample transaction data
  const sampleTransactions = [
    {
      _id: '1',
      type: 'credit',
      amount: 2500,
      description: 'Service Payment - AC Repair',
      date: '2024-12-10T10:30:00.000Z',
      status: 'completed',
      orderId: 'ORD-001',
      category: 'AC Home Appliance Repair',
    },
    {
      _id: '2',
      type: 'credit',
      amount: 1500,
      description: 'Service Payment - Plumbing',
      date: '2024-12-09T14:45:00.000Z',
      status: 'completed',
      orderId: 'ORD-002',
      category: 'Plumbing Services',
    },
    {
      _id: '3',
      type: 'debit',
      amount: 500,
      description: 'Commission Fee',
      date: '2024-12-09T15:00:00.000Z',
      status: 'completed',
      orderId: 'ORD-002',
      category: 'Commission',
    },
    {
      _id: '4',
      type: 'withdrawal',
      amount: 3000,
      description: 'Bank Transfer',
      date: '2024-12-08T09:15:00.000Z',
      status: 'processed',
      orderId: 'WTH-001',
      category: 'Withdrawal',
      bankName: 'HDFC Bank',
      accountLast4: '7890',
    },
    {
      _id: '5',
      type: 'credit',
      amount: 12000,
      description: 'Service Payment - Electrical Work',
      date: '2024-12-07T11:20:00.000Z',
      status: 'completed',
      orderId: 'ORD-003',
      category: 'Electrical Services',
    },
    {
      _id: '6',
      type: 'debit',
      amount: 1200,
      description: 'Commission Fee',
      date: '2024-12-07T11:30:00.000Z',
      status: 'completed',
      orderId: 'ORD-003',
      category: 'Commission',
    },
    {
      _id: '7',
      type: 'credit',
      amount: 8000,
      description: 'Service Payment - Kitchen Appliance',
      date: '2024-12-05T16:10:00.000Z',
      status: 'completed',
      orderId: 'ORD-004',
      category: 'Kitchen Appliances Repair',
    },
    {
      _id: '8',
      type: 'debit',
      amount: 800,
      description: 'Commission Fee',
      date: '2024-12-05T16:15:00.000Z',
      status: 'completed',
      orderId: 'ORD-004',
      category: 'Commission',
    },
    {
      _id: '9',
      type: 'withdrawal',
      amount: 5000,
      description: 'Bank Transfer',
      date: '2024-12-03T13:45:00.000Z',
      status: 'completed',
      orderId: 'WTH-002',
      category: 'Withdrawal',
      bankName: 'HDFC Bank',
      accountLast4: '7890',
    },
    {
      _id: '10',
      type: 'withdrawal',
      amount: 2000,
      description: 'Bank Transfer',
      date: '2024-12-01T10:00:00.000Z',
      status: 'pending',
      orderId: 'WTH-003',
      category: 'Withdrawal',
      bankName: 'HDFC Bank',
      accountLast4: '7890',
    },
  ];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter transactions based on selected period
      let filteredData = sampleTransactions;
      
      const now = new Date();
      if (selectedPeriod === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredData = sampleTransactions.filter(t => new Date(t.date) >= today);
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredData = sampleTransactions.filter(t => new Date(t.date) >= weekAgo);
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredData = sampleTransactions.filter(t => new Date(t.date) >= monthAgo);
      }
      
      // Filter by type
      if (filter !== 'all') {
        filteredData = filteredData.filter(t => t.type === filter);
      }
      
      setTransactions(filteredData);
      calculateStats(filteredData);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch transactions');
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (transactionData) => {
    let totalCredit = 0;
    let totalDebit = 0;
    let totalWithdrawal = 0;

    transactionData.forEach(transaction => {
      if (transaction.type === 'credit') {
        totalCredit += transaction.amount;
      } else if (transaction.type === 'debit') {
        totalDebit += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        totalWithdrawal += transaction.amount;
      }
    });

    setStats({
      totalCredit,
      totalDebit,
      totalWithdrawal,
      netBalance: totalCredit - totalDebit - totalWithdrawal,
    });
  };

  const groupTransactionsByDate = () => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
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
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
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
    switch (status) {
      case 'completed':
      case 'processed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (type, status) => {
    if (type === 'withdrawal') {
      if (status === 'pending') return 'pending';
      if (status === 'completed') return 'check-circle';
      return 'error';
    }
    
    switch (type) {
      case 'credit':
        return 'add-circle';
      case 'debit':
        return 'remove-circle';
      case 'withdrawal':
        return 'account-balance-wallet';
      default:
        return 'attach-money';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'credit':
        return colors.success;
      case 'debit':
        return colors.error;
      case 'withdrawal':
        return colors.warning;
      default:
        return colors.text;
    }
  };

  const renderTransactionItem = ({ item }) => {
    const isCredit = item.type === 'credit';
    const isWithdrawal = item.type === 'withdrawal';

    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.p4,
          styles.roundedLg,
          styles.shadowSm,
          styles.mb3,
          styles.borderLeft4,
          isCredit ? styles.borderSuccess : isWithdrawal ? styles.borderWarning : styles.borderError
        )}
        onPress={() => handleViewTransaction(item)}
      >
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon 
              name={getStatusIcon(item.type, item.status)} 
              size={24} 
              color={getTypeColor(item.type)} 
              style={clsx(styles.mr3)}
            />
            <View>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {item.description}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {item.category} • {formatTime(item.date)}
              </Text>
            </View>
          </View>
          
          <View style={clsx(styles.itemsEnd)}>
            <Text style={clsx(
              styles.textBase,
              styles.fontBold,
              isCredit ? styles.textSuccess : styles.textError
            )}>
              {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
              <View style={clsx(
                styles.w2,
                styles.h2,
                styles.roundedFull,
                styles.mr1,
                { backgroundColor: getStatusColor(item.status) }
              )} />
              <Text style={clsx(
                styles.textXs,
                styles.fontMedium,
                { color: getStatusColor(item.status) }
              )}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mt2)}>
          <Text style={clsx(styles.textXs, styles.textMuted)}>
            Order: {item.orderId}
          </Text>
          
          {item.bankName && (
            <Text style={clsx(styles.textXs, styles.textMuted)}>
              {item.bankName} ••••{item.accountLast4}
            </Text>
          )}
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

  const handleExportTransactions = () => {
    Alert.alert(
      'Export Transactions',
      'Select export format:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'PDF',
          onPress: () => {
            Alert.alert('Success', 'PDF will be generated and downloaded');
          },
        },
        {
          text: 'Excel',
          onPress: () => {
            Alert.alert('Success', 'Excel file will be generated and downloaded');
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>

        <Header
          title="Transaction History"
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

        <View style={clsx(styles.mb6)}>
          <View style={clsx(styles.bgPrimary, styles.p4, styles.roundedLg, styles.shadowSm)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite, styles.mb2)}>
              Total Earnings
            </Text>
            <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite, styles.mb4)}>
              {formatCurrency(totalEarnings.total)}
            </Text>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textXs, styles.textWhite)}>
                  Today
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(totalEarnings.daily)}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textXs, styles.textWhite)}>
                  This Week
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(totalEarnings.weekly)}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textXs, styles.textWhite)}>
                  This Month
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(totalEarnings.monthly)}
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
                { key: 'withdrawal', label: 'Withdrawals', icon: 'account-balance-wallet' },
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
              Transactions ({transactions.length})
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Sorted by Date
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
            <SectionList
              sections={groupTransactionsByDate()}
              keyExtractor={(item) => item._id}
              renderItem={renderTransactionItem}
              renderSectionHeader={renderSectionHeader}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={clsx(styles.pb2)}
            />
          )}
        </View>

        {/* Legend */}
        <View style={clsx(styles.mt6, styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
            Status Legend
          </Text>
          
          <View style={clsx(styles.flexRow, styles.flexWrap)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4, styles.mb2)}>
              <View style={clsx(styles.w3, styles.h3, styles.roundedFull, styles.bgSuccess, styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.textBlack)}>Completed</Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4, styles.mb2)}>
              <View style={clsx(styles.w3, styles.h3, styles.roundedFull, styles.bgWarning, styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.textBlack)}>Pending</Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <View style={clsx(styles.w3, styles.h3, styles.roundedFull, styles.bgError, styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.textBlack)}>Failed</Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={clsx(styles.mt6, styles.bgInfoLight, styles.p4, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo, styles.mb2)}>
            Need Help?
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Transaction details include service payments, commissions, and withdrawals
            {'\n'}• Withdrawals take 2-3 business days to process
            {'\n'}• For any discrepancy, contact support within 24 hours
            {'\n'}• Export your transaction history for record keeping
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

export default TransactionHistoryScreen;