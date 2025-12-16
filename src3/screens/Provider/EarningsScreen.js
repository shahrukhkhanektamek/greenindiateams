import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';

const EarningsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'withdraw', label: 'Withdraw' },
    { id: 'targets', label: 'Targets' },
  ];

  const earningsData = {
    today: { amount: 4250, jobs: 8, completed: 6, pending: 2 },
    week: { amount: 28500, jobs: 42, completed: 38, pending: 4 },
    month: { amount: 112500, jobs: 168, completed: 155, pending: 13 },
  };

  const transactions = [
    { id: '1', date: 'Today', time: '10:30 AM', jobId: 'UC-2024-001', amount: 1499, type: 'credit', status: 'completed' },
    { id: '2', date: 'Today', time: '12:45 PM', jobId: 'UC-2024-002', amount: 1999, type: 'credit', status: 'completed' },
    { id: '3', date: 'Yesterday', time: '3:15 PM', jobId: 'UC-2024-003', amount: 1299, type: 'credit', status: 'completed' },
    { id: '4', date: 'Yesterday', time: '5:30 PM', jobId: 'UC-2024-004', amount: 1799, type: 'credit', status: 'completed' },
    { id: '5', date: '2 days ago', time: '11:00 AM', jobId: 'UC-2024-005', amount: 1599, type: 'credit', status: 'completed' },
    { id: '6', date: '2 days ago', time: '2:00 PM', jobId: 'UC-2024-006', amount: 2499, type: 'credit', status: 'completed' },
    { id: '7', date: '3 days ago', time: '9:00 AM', amount: -2000, type: 'debit', status: 'withdrawn', description: 'Bank Transfer' },
  ];

  const currentData = earningsData[selectedPeriod] || earningsData.week;

  const renderTransaction = ({ item }) => (
    <View style={clsx(
      styles.flexRow,
      styles.itemsCenter,
      styles.justifyBetween,
      styles.p3,
      styles.bgWhite,
      styles.roundedLg,
      styles.mb2
    )}>
      <View style={clsx(styles.flexRow, styles.itemsCenter)}>
        <View style={clsx(
          styles.roundedFull,
          styles.p2,
          styles.mr3,
          item.type === 'credit' ? styles.bgSuccessLight : styles.bgErrorLight
        )}>
          <Icon 
            name={item.type === 'credit' ? 'arrow-downward' : 'arrow-upward'} 
            size={20} 
            color={item.type === 'credit' ? colors.success : colors.error} 
          />
        </View>
        <View>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
            {item.jobId ? `Job ${item.jobId}` : item.description}
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            {item.date} • {item.time}
          </Text>
        </View>
      </View>
      <View style={clsx(styles.itemsEnd)}>
        <Text style={clsx(
          styles.textLg,
          styles.fontBold,
          item.type === 'credit' ? styles.textSuccess : styles.textError
        )}>
          {item.type === 'credit' ? '+' : ''}₹{Math.abs(item.amount)}
        </Text>
        <Text style={clsx(styles.textXs, styles.textMuted)}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      {/* Header */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt6, styles.pb4)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
          <TouchableOpacity 
            style={clsx(styles.mr3)}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWhite)}>
            Earnings
          </Text>
        </View>

        {/* Period Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mt2)}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={clsx(
                styles.px4,
                styles.py2,
                styles.mr2,
                styles.roundedFull,
                selectedPeriod === period.id ? styles.bgWhite : styles.bgWhite20
              )}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text style={clsx(
                styles.fontMedium,
                selectedPeriod === period.id ? styles.textPrimary : styles.textWhite
              )}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Earnings Overview */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <View style={clsx(styles.itemsCenter, styles.mb4)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                Total Earnings ({selectedPeriod})
              </Text>
              <Text style={clsx(styles.text4xl, styles.fontBold, styles.textPrimary)}>
                ₹{currentData.amount.toLocaleString()}
              </Text>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  {currentData.jobs}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Total Jobs
                </Text>
              </View>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                  {currentData.completed}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Completed
                </Text>
              </View>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWarning)}>
                  {currentData.pending}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Pending
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mx4, styles.mt4)}
          contentContainerStyle={clsx(styles.pb2)}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={clsx(
                styles.px4,
                styles.py2,
                styles.mr3,
                styles.roundedFull,
                selectedTab === tab.id ? styles.bgPrimary : styles.bgGray
              )}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={clsx(
                styles.fontMedium,
                selectedTab === tab.id ? styles.textWhite : styles.textBlack
              )}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content based on selected tab */}
        {selectedTab === 'overview' && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            {/* Weekly Breakdown */}
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow, styles.mb4)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
                Weekly Breakdown
              </Text>
              {[
                { day: 'Mon', amount: 4200 },
                { day: 'Tue', amount: 3800 },
                { day: 'Wed', amount: 5200 },
                { day: 'Thu', amount: 4500 },
                { day: 'Fri', amount: 3900 },
                { day: 'Sat', amount: 4800 },
                { day: 'Sun', amount: 3100 },
              ].map((day, index) => (
                <View key={index} style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                  <Text style={clsx(styles.textBase, styles.textBlack, styles.mr3, { width: 40 })}>
                    {day.day}
                  </Text>
                  <View style={clsx(styles.flex1, styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
                    <View 
                      style={clsx(
                        styles.bgPrimary, 
                        styles.h2, 
                        styles.roundedFull,
                        { width: `${(day.amount / 6000) * 100}%` }
                      )} 
                    />
                  </View>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml3, { width: 60 })}>
                    ₹{day.amount}
                  </Text>
                </View>
              ))}
            </View>

            {/* Service-wise Earnings */}
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
                Service-wise Earnings
              </Text>
              {[
                { service: 'AC Service', percentage: 40, amount: 11400 },
                { service: 'Deep Cleaning', percentage: 25, amount: 7125 },
                { service: 'Plumbing', percentage: 20, amount: 5700 },
                { service: 'Appliance Repair', percentage: 15, amount: 4275 },
              ].map((item, index) => (
                <View key={index} style={clsx(styles.mb3)}>
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {item.service}
                    </Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                      ₹{item.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={clsx(styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
                    <View 
                      style={clsx(
                        index === 0 ? styles.bgPrimary : 
                        index === 1 ? styles.bgSuccess : 
                        index === 2 ? styles.bgWarning : 
                        styles.bgSecondary, 
                        styles.h2, 
                        styles.roundedFull,
                        { width: `${item.percentage}%` }
                      )} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'transactions' && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
                Recent Transactions
              </Text>
              <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.mt3,
                  styles.pt3,
                  styles.borderTop,
                  styles.borderGray
                )}
                onPress={() => Alert.alert('View All', 'Show all transactions')}
              >
                <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                  View All Transactions
                </Text>
                <Icon name="chevron-right" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedTab === 'withdraw' && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
                Withdraw Earnings
              </Text>
              
              <View style={clsx(styles.mb4)}>
                <Text style={clsx(styles.textBase, styles.textMuted, styles.mb2)}>
                  Available Balance
                </Text>
                <Text style={clsx(styles.text4xl, styles.fontBold, styles.textPrimary)}>
                  ₹18,250
                </Text>
              </View>

              <View style={clsx(styles.mb4)}>
                <Text style={clsx(styles.textBase, styles.textMuted, styles.mb2)}>
                  Quick Withdraw
                </Text>
                <View style={clsx(styles.flexRow, styles.flexWrap, styles.mb3)}>
                  {[1000, 2000, 5000, 10000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={clsx(
                        styles.px3,
                        styles.py2,
                        styles.mr2,
                        styles.mb2,
                        styles.border,
                        styles.borderPrimary,
                        styles.roundedFull
                      )}
                    >
                      <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                        ₹{amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.p4,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.mb3
                )}
                onPress={() => navigation.navigate('WithdrawMoney')}
              >
                <Icon name="account-balance-wallet" size={24} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold, styles.ml2)}>
                  Withdraw Money
                </Text>
              </TouchableOpacity>

              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Next withdrawal available in 2 days
              </Text>
            </View>
          </View>
        )}

        {selectedTab === 'targets' && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
                Monthly Targets
              </Text>
              
              {[
                { label: 'Earnings Target', current: 112500, target: 150000, color: colors.primary },
                { label: 'Jobs Target', current: 168, target: 200, color: colors.success },
                { label: 'Rating Target', current: 4.8, target: 4.9, color: colors.warning },
                { label: 'Completion Rate', current: 92, target: 95, color: colors.secondary },
              ].map((target, index) => (
                <View key={index} style={clsx(styles.mb4)}>
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {target.label}
                    </Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, { color: target.color })}>
                      {target.current} / {target.target}
                    </Text>
                  </View>
                  <View style={clsx(styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
                    <View 
                      style={clsx(
                        styles.h2, 
                        styles.roundedFull,
                        { 
                          width: `${(target.current / target.target) * 100}%`,
                          backgroundColor: target.color
                        }
                      )} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bank Details */}
        <View style={clsx(styles.mx4, styles.mt4, styles.mb6)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Bank Details
              </Text>
              <TouchableOpacity>
                <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={clsx(styles.bgGray, styles.roundedFull, styles.p2, styles.mr3)}>
                <Icon name="account-balance" size={24} color={colors.text} />
              </View>
              <View>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  HDFC Bank
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Account No: XXXX-XXXX-1234
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mt2
              )}
              onPress={() => navigation.navigate('BankDetails')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View Complete Details
              </Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EarningsScreen;