import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

const StatsCard = ({
  title,
  value,
  icon,
  color = colors.primary,
  trend = null, // 'up', 'down', or null
  trendValue = null,
  subtitle = null,
  onPress,
  compact = false,
  type = 'default', // 'default', 'outline', 'gradient'
}) => {
  const renderTrend = () => {
    if (!trend) return null;
    
    return (
      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
        <Icon 
          name={trend === 'up' ? 'arrow-upward' : 'arrow-downward'} 
          size={12} 
          color={trend === 'up' ? colors.success : colors.error} 
        />
        <Text style={clsx(
          styles.textXs,
          styles.fontMedium,
          styles.ml1,
          trend === 'up' ? styles.textSuccess : styles.textError
        )}>
          {trendValue}
        </Text>
      </View>
    );
  };

  const getCardStyle = () => {
    switch (type) {
      case 'outline':
        return clsx(
          styles.border,
          styles.borderPrimary,
          { borderColor: color }
        );
      case 'gradient':
        return {
          backgroundColor: color,
        };
      default:
        return clsx(styles.bgWhite);
    }
  };

  const getTextColor = () => {
    return type === 'gradient' ? colors.white : colors.text;
  };

  const getValueColor = () => {
    return type === 'gradient' ? colors.white : color;
  };

  return (
    <TouchableOpacity
      style={clsx(
        getCardStyle(),
        styles.roundedLg,
        styles.p4,
        compact ? styles.p3 : styles.p4,
        !compact && styles.shadowSm,
        onPress && styles.activeOpacity75
      )}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart)}>
        <View style={clsx(styles.flex1)}>
          <Text style={clsx(
            styles.textSm,
            styles.fontMedium,
            { color: type === 'gradient' ? colors.white : colors.textMuted },
            compact && styles.textXs
          )}>
            {title}
          </Text>
          
          <Text style={clsx(
            compact ? styles.text2xl : styles.text3xl,
            styles.fontBold,
            styles.mt1,
            { color: getValueColor() }
          )}>
            {value}
          </Text>
          
          {subtitle && (
            <Text style={clsx(
              styles.textSm,
              { color: type === 'gradient' ? colors.white : colors.textMuted },
              styles.mt1
            )}>
              {subtitle}
            </Text>
          )}
          
          {renderTrend()}
        </View>
        
        {icon && (
          <View style={clsx(
            styles.roundedFull,
            styles.p2,
            type === 'gradient' ? styles.bgWhite20 : { backgroundColor: `${color}20` }
          )}>
            <Icon 
              name={icon} 
              size={compact ? 20 : 24} 
              color={type === 'gradient' ? colors.white : color} 
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Specialized Stats Cards
export const EarningsStatsCard = ({ 
  amount, 
  period = 'today', 
  trend = 'up', 
  trendValue = '12%', 
  onPress 
}) => {
  const getPeriodText = () => {
    switch (period) {
      case 'today': return "Today's Earnings";
      case 'week': return "Weekly Earnings";
      case 'month': return "Monthly Earnings";
      default: return "Earnings";
    }
  };

  return (
    <StatsCard
      title={getPeriodText()}
      value={`₹${amount.toLocaleString()}`}
      icon="account-balance-wallet"
      color={colors.success}
      trend={trend}
      trendValue={trendValue}
      onPress={onPress}
    />
  );
};

export const JobsStatsCard = ({ 
  completed, 
  total, 
  pending = 0, 
  period = 'today', 
  onPress 
}) => {
  const getPeriodText = () => {
    switch (period) {
      case 'today': return "Today's Jobs";
      case 'week': return "Weekly Jobs";
      case 'month': return "Monthly Jobs";
      default: return "Jobs";
    }
  };

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <StatsCard
      title={getPeriodText()}
      value={`${completed}/${total}`}
      icon="assignment-turned-in"
      color={colors.primary}
      subtitle={`${completionRate}% completion rate`}
      onPress={onPress}
    />
  );
};

export const RatingStatsCard = ({ 
  rating, 
  reviews, 
  trend = 'up', 
  trendValue = '0.2', 
  onPress 
}) => {
  const getRatingColor = () => {
    if (rating >= 4.5) return colors.success;
    if (rating >= 4.0) return colors.warning;
    return colors.error;
  };

  return (
    <StatsCard
      title="Your Rating"
      value={rating.toFixed(1)}
      icon="star"
      color={getRatingColor()}
      trend={trend}
      trendValue={trendValue}
      subtitle={`${reviews} reviews`}
      onPress={onPress}
    />
  );
};

export const PerformanceStatsCard = ({ 
  metric, 
  value, 
  target, 
  unit = '', 
  onPress 
}) => {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
  const getColor = () => {
    if (percentage >= 90) return colors.success;
    if (percentage >= 70) return colors.warning;
    return colors.error;
  };

  return (
    <StatsCard
      title={metric}
      value={`${value}${unit}`}
      icon="trending-up"
      color={getColor()}
      subtitle={`${percentage}% of target (${target}${unit})`}
      compact
      onPress={onPress}
    />
  );
};

// Stats Card Grid
export const StatsCardGrid = ({ stats, columns = 2, onPress }) => {
  return (
    <View style={clsx(styles.flexRow, styles.flexWrap, styles.mxN2)}>
      {stats.map((stat, index) => (
        <View 
          key={index} 
          style={clsx({ width: `${100 / columns}%` }, styles.p2)}
        >
          <StatsCard {...stat} onPress={() => onPress && onPress(stat)} />
        </View>
      ))}
    </View>
  );
};

export default StatsCard;