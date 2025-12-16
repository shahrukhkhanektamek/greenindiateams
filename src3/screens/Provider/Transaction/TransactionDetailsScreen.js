import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';

const TransactionDetailsScreen = ({ navigation, route }) => {
  const { transaction } = route.params;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const getTypeIcon = (type) => {
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

  const handleShareReceipt = async () => {
    try {
      const shareOptions = {
        message: `Transaction Receipt\n\nAmount: ${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\nDate: ${formatDate(transaction.date)}\nStatus: ${transaction.status}`,
        title: 'Transaction Receipt',
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Error', 'Could not share receipt');
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Report an issue with this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report',
          onPress: () => navigation.navigate('Support', { transactionId: transaction._id }),
        },
      ]
    );
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>

      <Header
          title="Transaction Detail"
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
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >
        {/* Transaction Card */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb6)}>
          <View style={clsx(styles.itemsCenter, styles.mb-4)}>
            <Icon 
              name={getTypeIcon(transaction.type)} 
              size={48} 
              color={getTypeColor(transaction.type)} 
              style={clsx(styles.mb-3)}
            />
            <Text style={clsx(
              styles.text2xl,
              styles.fontBold,
              transaction.type === 'credit' ? styles.textSuccess : styles.textError
            )}>
              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt-2)}>
              {transaction.description}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={clsx(
            styles.selfCenter,
            styles.px4,
            styles.py2,
            styles.roundedFull,
            styles.mb-4,
            { backgroundColor: getStatusColor(transaction.status) + '20' }
          )}>
            <Text style={clsx(
              styles.textBase,
              styles.fontBold,
              { color: getStatusColor(transaction.status) }
            )}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Transaction Details
          </Text>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.shadowSm, styles.overflowHidden)}>
            <View style={clsx(styles.p4, styles.borderBottom, styles.borderGrayLight)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Transaction ID
              </Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {transaction._id}
              </Text>
            </View>
            
            <View style={clsx(styles.p4, styles.borderBottom, styles.borderGrayLight)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Order ID
              </Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {transaction.orderId}
              </Text>
            </View>
            
            <View style={clsx(styles.p4, styles.borderBottom, styles.borderGrayLight)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Category
              </Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {transaction.category}
              </Text>
            </View>
            
            <View style={clsx(styles.p4, styles.borderBottom, styles.borderGrayLight)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Date & Time
              </Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {formatDate(transaction.date)}
              </Text>
            </View>
            
            <View style={clsx(styles.p4)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Transaction Type
              </Text>
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <Icon 
                  name={getTypeIcon(transaction.type)} 
                  size={20} 
                  color={getTypeColor(transaction.type)} 
                  style={clsx(styles.mr2)}
                />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Details (for withdrawals) */}
        {transaction.type === 'withdrawal' && transaction.bankName && (
          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
              Bank Details
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.shadowSm, styles.overflowHidden)}>
              <View style={clsx(styles.p4, styles.borderBottom, styles.borderGrayLight)}>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                  Bank Name
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {transaction.bankName}
                </Text>
              </View>
              
              <View style={clsx(styles.p4)}>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                  Account Number
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  ••••{transaction.accountLast4}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={clsx(styles.mb6)}>
          <TouchableOpacity
            style={clsx(
              styles.button,
              styles.flexRow,
              styles.justifyCenter,
              styles.itemsCenter,
              styles.mb3
            )}
            onPress={handleShareReceipt}
          >
            <Icon name="share" size={20} color={colors.white} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.buttonText)}>
              Share Receipt
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={clsx(
              styles.buttonOutline,
              styles.flexRow,
              styles.justifyCenter,
              styles.itemsCenter
            )}
            onPress={handleReportIssue}
          >
            <Icon name="report-problem" size={20} color={colors.error} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.buttonOutlineText)}>
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={clsx(styles.bgInfoLight, styles.p4, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo, styles.mb2)}>
            Need Help?
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Pending transactions will be updated once processed
            {'\n'}• Withdrawals take 2-3 business days
            {'\n'}• For any discrepancy, contact support within 24 hours
            {'\n'}• Keep transaction receipts for your records
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TransactionDetailsScreen;