import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';
import StatsCard, { PerformanceStatsCard } from '../../components/Common/StatsCard';

const PerformanceScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('rating');
  const [loading, setLoading] = useState(false);

  const periods = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'Last Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  const metrics = [
    { id: 'rating', label: 'Ratings', icon: 'star', color: colors.warning },
    { id: 'jobs', label: 'Jobs', icon: 'assignment', color: colors.primary },
    { id: 'earnings', label: 'Earnings', icon: 'account-balance-wallet', color: colors.success },
    { id: 'time', label: 'Time', icon: 'schedule', color: colors.secondary },
  ];

  // Performance Data
  const performanceData = {
    overall: {
      rating: 4.8,
      totalJobs: 1247,
      completedJobs: 1198,
      completionRate: 96,
      avgResponseTime: 24,
      customerSatisfaction: 98,
      earnings: 1254300,
      activeDays: 120,
    },
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      ratings: [4.7, 4.8, 4.9, 4.8, 4.7, 4.6, 4.8],
      jobs: [8, 10, 12, 9, 11, 6, 7],
      earnings: [3800, 4200, 5200, 4500, 3900, 4800, 3100],
      responseTimes: [22, 25, 20, 28, 24, 26, 23],
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      ratings: [4.6, 4.7, 4.8, 4.8, 4.9, 4.8],
      jobs: [168, 172, 180, 175, 185, 178],
      earnings: [112500, 118000, 125000, 120500, 128000, 122000],
    },
    serviceWise: [
      { name: 'AC Service', value: 45, color: colors.primary, legendFontColor: colors.text },
      { name: 'Cleaning', value: 25, color: colors.success, legendFontColor: colors.text },
      { name: 'Plumbing', value: 15, color: colors.warning, legendFontColor: colors.text },
      { name: 'Appliance', value: 10, color: colors.secondary, legendFontColor: colors.text },
      { name: 'Others', value: 5, color: colors.textLight, legendFontColor: colors.text },
    ],
    targets: {
      rating: 4.9,
      jobs: 200,
      earnings: 150000,
      completionRate: 98,
      responseTime: 20,
    },
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => {
      switch (selectedMetric) {
        case 'rating': return `rgba(255, 107, 107, ${opacity})`;
        case 'jobs': return `rgba(78, 205, 196, ${opacity})`;
        case 'earnings': return `rgba(76, 175, 80, ${opacity})`;
        case 'time': return `rgba(255, 152, 0, ${opacity})`;
        default: return `rgba(0, 0, 0, ${opacity})`;
      }
    },
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.white,
    },
  };

  const getChartData = () => {
    const data = selectedPeriod === 'week' ? performanceData.weekly : performanceData.monthly;
    
    return {
      labels: data.labels,
      datasets: [{
        data: data[selectedMetric === 'rating' ? 'ratings' : 
                  selectedMetric === 'jobs' ? 'jobs' : 
                  selectedMetric === 'earnings' ? 'earnings' : 
                  'responseTimes'],
        color: (opacity = 1) => chartConfig.color(opacity),
        strokeWidth: 2,
      }],
    };
  };

  const performanceStats = [
    {
      metric: 'Completion Rate',
      value: performanceData.overall.completionRate,
      target: performanceData.targets.completionRate,
      unit: '%',
      color: colors.primary,
      icon: 'check-circle',
    },
    {
      metric: 'Avg Response Time',
      value: performanceData.overall.avgResponseTime,
      target: performanceData.targets.responseTime,
      unit: 'min',
      color: colors.secondary,
      icon: 'schedule',
    },
    {
      metric: 'Customer Satisfaction',
      value: performanceData.overall.customerSatisfaction,
      target: 95,
      unit: '%',
      color: colors.success,
      icon: 'mood',
    },
    {
      metric: 'Active Days Streak',
      value: performanceData.overall.activeDays,
      target: 100,
      unit: 'days',
      color: colors.warning,
      icon: 'local-fire-department',
    },
  ];

  const achievements = [
    {
      id: '1',
      title: 'Perfect Week',
      description: 'Completed all jobs with 5-star ratings',
      icon: 'emoji-events',
      color: colors.warning,
      achieved: true,
      date: 'Last week',
    },
    {
      id: '2',
      title: 'Fast Responder',
      description: 'Average response time under 20 minutes',
      icon: 'flash-on',
      color: colors.success,
      achieved: true,
      date: 'This month',
    },
    {
      id: '3',
      title: 'Earnings Master',
      description: 'Earned over ₹1,00,000 in a month',
      icon: 'trending-up',
      color: colors.primary,
      achieved: false,
      progress: 85,
    },
    {
      id: '4',
      title: 'Customer Favorite',
      description: 'Maintain 4.9+ rating for 3 months',
      icon: 'favorite',
      color: colors.error,
      achieved: false,
      progress: 70,
    },
  ];

  const performanceTips = [
    {
      id: '1',
      title: 'Improve Response Time',
      description: 'Try to respond to job requests within 15 minutes',
      icon: 'timer',
    },
    {
      id: '2',
      title: 'Ask for Reviews',
      description: 'Politely ask satisfied customers for ratings',
      icon: 'rate-review',
    },
    {
      id: '3',
      title: 'Upsell Services',
      description: 'Offer additional services to increase earnings',
      icon: 'add-business',
    },
    {
      id: '4',
      title: 'Maintain Tools',
      description: 'Regular maintenance reduces job time',
      icon: 'build',
    },
  ];

  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Performance"
        subtitle="Track and improve your performance"
        showBack
        onBackPress={() => navigation.goBack()}
        type="white"
        rightAction
        rightActionIcon="leaderboard"
        onRightActionPress={() => navigation.navigate('Leaderboard')}
      />

      {loading ? (
        <View style={clsx(styles.flex1, styles.centerAll)}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={clsx(styles.pb6)}>
          {/* Overall Performance Score */}
          <View style={clsx(styles.mx4, styles.mt4)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
                <View>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    Overall Performance Score
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>
                    Based on multiple factors
                  </Text>
                </View>
                <View style={clsx(styles.bgPrimaryLight, styles.roundedFull, styles.px3, styles.py1)}>
                  <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                    {performanceData.overall.rating}/5.0
                  </Text>
                </View>
              </View>

              {/* Performance Score Breakdown */}
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <View style={clsx(styles.itemsCenter, styles.flex1)}>
                  <Text style={clsx(styles.text3xl, styles.fontBold, styles.textSuccess)}>
                    {performanceData.overall.completionRate}%
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Completion
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter, styles.flex1)}>
                  <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWarning)}>
                    {performanceData.overall.rating}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Rating
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter, styles.flex1)}>
                  <Text style={clsx(styles.text3xl, styles.fontBold, styles.textPrimary)}>
                    {performanceData.overall.avgResponseTime}m
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Response
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter, styles.flex1)}>
                  <Text style={clsx(styles.text3xl, styles.fontBold, styles.textSecondary)}>
                    {performanceData.overall.customerSatisfaction}%
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Satisfaction
                  </Text>
                </View>
              </View>

              {/* Performance Progress Bar */}
              <View style={clsx(styles.mt4)}>
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>
                    Performance Level
                  </Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                    Expert • 85/100
                  </Text>
                </View>
                <View style={clsx(styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
                  <View style={clsx(
                    styles.bgPrimary,
                    styles.h2,
                    styles.roundedFull,
                    { width: '85%' }
                  )} />
                </View>
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Beginner</Text>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Intermediate</Text>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Advanced</Text>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Expert</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Period Selector */}
          <View style={clsx(styles.mx4, styles.mt4)}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={clsx(styles.mb4)}
            >
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={clsx(
                    styles.px4,
                    styles.py2,
                    styles.mr3,
                    styles.roundedFull,
                    selectedPeriod === period.id ? styles.bgPrimary : styles.bgGray
                  )}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text style={clsx(
                    styles.fontMedium,
                    selectedPeriod === period.id ? styles.textWhite : styles.textBlack
                  )}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Metrics Selector */}
          <View style={clsx(styles.mx4, styles.mb4)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              {metrics.map((metric) => (
                <TouchableOpacity
                  key={metric.id}
                  style={clsx(
                    styles.itemsCenter,
                    styles.flex1
                  )}
                  onPress={() => setSelectedMetric(metric.id)}
                >
                  <View style={clsx(
                    styles.roundedFull,
                    styles.p3,
                    styles.mb2,
                    selectedMetric === metric.id ? 
                    { backgroundColor: metric.color } : 
                    { backgroundColor: `${metric.color}20` }
                  )}>
                    <Icon 
                      name={metric.icon} 
                      size={20} 
                      color={selectedMetric === metric.id ? colors.white : metric.color} 
                    />
                  </View>
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    selectedMetric === metric.id ? { color: metric.color } : styles.textMuted
                  )}>
                    {metric.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Performance Chart */}
          <View style={clsx(styles.mx4, styles.mb4)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend
              </Text>
              
              <LineChart
                data={getChartData()}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={clsx(styles.mt2)}
                fromZero={selectedMetric === 'rating'}
                yAxisSuffix={selectedMetric === 'earnings' ? '₹' : selectedMetric === 'time' ? 'm' : ''}
                yAxisInterval={1}
                segments={selectedMetric === 'rating' ? 4 : 5}
              />
            </View>
          </View>

          {/* Performance Stats Grid */}
          <View style={clsx(styles.mx4, styles.mb4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Key Metrics
            </Text>
            <View style={clsx(styles.flexRow, styles.flexWrap, styles.mxN2)}>
              {performanceStats.map((stat, index) => (
                <View key={index} style={clsx({ width: '50%' }, styles.p2)}>
                  <PerformanceStatsCard {...stat} />
                </View>
              ))}
            </View>
          </View>

          {/* Service Distribution */}
          <View style={clsx(styles.mx4, styles.mb4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Service Distribution
            </Text>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <PieChart
                data={performanceData.serviceWise}
                width={screenWidth}
                height={200}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>

          {/* Achievements */}
          <View style={clsx(styles.mx4, styles.mb4)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Achievements
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Achievements')}
              >
                <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={clsx(styles.mb2)}
            >
              {achievements.map((achievement) => (
                <View 
                  key={achievement.id} 
                  style={clsx(
                    styles.bgWhite,
                    styles.roundedLg,
                    styles.p4,
                    styles.mr3,
                    styles.shadow,
                    { width: 280 }
                  )}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                    <View style={clsx(
                      styles.roundedFull,
                      styles.p2,
                      styles.mr3,
                      { backgroundColor: `${achievement.color}20` }
                    )}>
                      <Icon name={achievement.icon} size={24} color={achievement.color} />
                    </View>
                    <View style={clsx(styles.flex1)}>
                      <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                        {achievement.title}
                      </Text>
                      <Text style={clsx(styles.textSm, styles.textMuted)}>
                        {achievement.description}
                      </Text>
                    </View>
                  </View>

                  {achievement.achieved ? (
                    <View style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.px3,
                      styles.py2,
                      styles.bgSuccessLight,
                      styles.roundedFull,
                      styles.selfStart
                    )}>
                      <Icon name="check" size={16} color={colors.success} />
                      <Text style={clsx(styles.textSuccess, styles.fontMedium, styles.ml1)}>
                        Achieved • {achievement.date}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                        <Text style={clsx(styles.textSm, styles.textMuted)}>
                          Progress
                        </Text>
                        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                          {achievement.progress}%
                        </Text>
                      </View>
                      <View style={clsx(styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
                        <View style={clsx(
                          styles.bgPrimary,
                          styles.h2,
                          styles.roundedFull,
                          { width: `${achievement.progress}%` }
                        )} />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Performance Comparison */}
          <View style={clsx(styles.mx4, styles.mb4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Performance Comparison
            </Text>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                    You
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Your Score
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                    Avg
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    City Average
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                    Top
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Top Performers
                  </Text>
                </View>
              </View>

              {[
                { metric: 'Rating', you: 4.8, avg: 4.5, top: 4.9 },
                { metric: 'Response Time', you: 24, avg: 32, top: 18 },
                { metric: 'Completion Rate', you: 96, avg: 92, top: 98 },
                { metric: 'Earnings/Job', you: 1499, avg: 1250, top: 1650 },
              ].map((item, index) => (
                <View key={index} style={clsx(styles.mb3)}>
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {item.metric}
                    </Text>
                  </View>
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mr2)}>
                        {item.you}{item.metric === 'Response Time' ? 'm' : item.metric === 'Earnings/Job' ? '₹' : ''}
                      </Text>
                      <View style={clsx(styles.flex1, styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
                        <View style={clsx(
                          styles.bgPrimary,
                          styles.h2,
                          styles.roundedFull,
                          { width: `${(item.you / item.top) * 100}%` }
                        )} />
                      </View>
                    </View>
                    <Text style={clsx(styles.textBase, styles.textMuted, styles.ml3, { width: 40 })}>
                      {item.avg}
                    </Text>
                    <Text style={clsx(styles.textBase, styles.textMuted, styles.ml3, { width: 40 })}>
                      {item.top}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Performance Tips */}
          <View style={clsx(styles.mx4, styles.mb6)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Tips to Improve
            </Text>
            
            {performanceTips.map((tip, index) => (
              <TouchableOpacity
                key={tip.id}
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.p4,
                  styles.mb3,
                  styles.shadow
                )}
                onPress={() => navigation.navigate('PerformanceTip', { tip })}
              >
                <View style={clsx(
                  styles.roundedFull,
                  styles.p3,
                  styles.mr3,
                  styles.bgPrimaryLight
                )}>
                  <Icon name={tip.icon} size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {tip.title}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                    {tip.description}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))}

            {/* Download Report */}
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p4,
                styles.bgPrimary,
                styles.roundedLg,
                styles.mt3
              )}
              onPress={() => navigation.navigate('DownloadReport')}
            >
              <Icon name="download" size={24} color={colors.white} />
              <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold, styles.ml2)}>
                Download Performance Report
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default PerformanceScreen;