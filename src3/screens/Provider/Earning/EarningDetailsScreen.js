import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';

const EarningDetailsScreen = ({ navigation, route }) => {
  const { earning } = route.params;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const earningSlabs = [
    {
      hours: earning.earningHour1,
      price: earning.earningPrice1,
      label: 'Basic Service',
    },
    {
      hours: earning.earningHour2,
      price: earning.earningPrice2,
      label: 'Standard Service',
    },
    {
      hours: earning.earningHour3,
      price: earning.earningPrice3,
      label: 'Premium Service',
    },
    {
      hours: earning.earningHour4,
      price: earning.earningPrice4,
      label: 'Extended Service',
    },
  ];

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      {/* Header */}
      <View style={clsx(styles.bgWhite, styles.px4, styles.pt12, styles.pb4, styles.shadowSm)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
          <TouchableOpacity 
            style={clsx(styles.mr3)}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
            Earning Details
          </Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt4)}
      >
        {/* Category Info */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb6)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
            <Icon name="category" size={24} color={colors.primary} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.ml3)}>
              {earning.category.name}
            </Text>
          </View>
          
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb3)}>
            {earning.category.fullDescription}
          </Text>
          
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon name="check-circle" size={16} color={colors.success} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textSm, styles.textSuccess)}>
              Active Category
            </Text>
          </View>
        </View>

        {/* Earning Slabs */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Earning Slabs
          </Text>
          
          {earningSlabs.map((slab, index) => (
            <View 
              key={index} 
              style={clsx(
                styles.bgWhite,
                styles.p4,
                styles.roundedLg,
                styles.shadowSm,
                styles.mb4,
                index === earningSlabs.length - 1 ? styles.mb0 : styles.mb4
              )}
            >
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  {slab.label}
                </Text>
                <View style={clsx(styles.px3, styles.py1, styles.bgPrimaryLight, styles.roundedFull)}>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                    {slab.hours} Hours
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                <View>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Earning Amount
                  </Text>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                    {formatCurrency(slab.price)}
                  </Text>
                </View>
                
                <View>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Per Hour Rate
                  </Text>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    {formatCurrency(slab.price / slab.hours)}/hr
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Information */}
        <View style={clsx(styles.bgGray, styles.p4, styles.roundedLg, styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
            Additional Information
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Created On
            </Text>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              {new Date(earning.createdAt).toLocaleDateString('en-IN')}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Last Updated
            </Text>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              {new Date(earning.updatedAt).toLocaleDateString('en-IN')}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Category ID
            </Text>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              {earning.categoryId}
            </Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={clsx(styles.bgPrimaryLight, styles.p4, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb3)}>
            Earnings Summary
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              Total Potential Earnings
            </Text>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
              {formatCurrency(earning.earningPrice1 + earning.earningPrice2 + earning.earningPrice3 + earning.earningPrice4)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              Average Hourly Rate
            </Text>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
              {formatCurrency(
                (earning.earningPrice1 + earning.earningPrice2 + earning.earningPrice3 + earning.earningPrice4) /
                (earning.earningHour1 + earning.earningHour2 + earning.earningHour3 + earning.earningHour4)
              )}/hr
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              Highest Earning Slab
            </Text>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
              {formatCurrency(Math.max(earning.earningPrice1, earning.earningPrice2, earning.earningPrice3, earning.earningPrice4))}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EarningDetailsScreen;