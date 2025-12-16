import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AppContext } from '../../Context/AppContext';

const Header = ({
  title,
  subtitle,
  showBack = false,
  showNotification = true,
  showProfile = true,
  rightAction,
  rightActionIcon,
  onBackPress,
  onNotificationPress,
  onProfilePress,
  onRightActionPress,
  backgroundColor = colors.primary,
  textColor = colors.white,
  type = 'default', // 'default', 'transparent', 'white'
}) => {
  
  const { setisheaderback, isheaderback } = useContext(AppContext);

  const getBackgroundColor = () => {
    switch (type) {
      case 'transparent':
        return 'transparent';
      case 'white':
        return colors.white;
      default:
        return backgroundColor;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'white':
        return colors.text;
      case 'transparent':
        return colors.text;
      default:
        return textColor;
    }
  };

  const getStatusBarStyle = () => {
    switch (type) {
      case 'white':
      case 'transparent':
        return 'dark-content';
      default:
        return 'light-content';
    }
  };

  return (
    <View>

      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt3, styles.pb0)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
          {showBack && (
            <>
              {isheaderback?
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Icon name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
              :null}
            </>
          )}
          <View style={clsx(styles.flexCol, styles.textCenter)}>
            {title && (
              <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text 
                style={clsx(
                  styles.textSm,
                  styles.textCenter,
                  styles.textWhite,
                  // { color: getTextColor(), opacity: 0.8 }
                )}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
          
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            {rightAction && (
              <TouchableOpacity
                onPress={onRightActionPress}
                style={clsx(styles.mr3)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon 
                  name={rightActionIcon || 'more-vert'} 
                  size={24} 
                  color={colors.white}
                />
              </TouchableOpacity>
            )}
            
            {showNotification && (
              <TouchableOpacity
                onPress={onNotificationPress}
                style={clsx(styles.mr3, styles.positionRelative)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon 
                  name="notifications" 
                  size={24} 
                  color={colors.white}
                />
                {/* Notification Badge */}
                <View style={clsx(
                  styles.positionAbsolute,
                  styles.top0,
                  styles.right0,
                  styles.bgError,
                  styles.roundedFull,
                  { width: 8, height: 8 }
                )} />
              </TouchableOpacity>
            )}
            
            {showProfile && (
              <TouchableOpacity
                onPress={onProfilePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={clsx(
                  styles.bgWhite,
                  styles.roundedFull,
                  styles.itemsCenter,
                  styles.centerAll,
                  { width: 36, height: 36 },
                  type !== 'default' && styles.border,
                  type !== 'default' && { borderColor: colors.border }
                )}>
                  <Icon 
                    name="person" 
                    size={20} 
                    color={type === 'default' ? colors.primary : colors.text} 
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>    
    </View>
  );
};

// Specialized Header Components
export const DashboardHeader = ({ 
  name, 
  rating, 
  onProfilePress, 
  onNotificationPress 
}) => {
  return (
    <View style={clsx(styles.bgPrimary, styles.px4, styles.pt12, styles.pb6)}>
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
        <View>
          <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)}>
            Welcome back,
          </Text>
          <Text style={clsx(styles.textWhite, styles.text2xl, styles.fontBold)}>
            {name}
          </Text>
          <Text style={clsx(styles.textWhite, styles.textSm, styles.opacity75, styles.mt1)}>
            {rating} ⭐
          </Text>
        </View>
        
      </View>
    </View>
  );
};

export const SearchHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onBackPress,
  placeholder = "Search jobs, customers..."
}) => {
  return (
    <View style={clsx(styles.bgWhite, styles.px4, styles.pt12, styles.pb4, styles.shadowSm)}>
      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
        <TouchableOpacity 
          onPress={onBackPress}
          style={clsx(styles.mr3)}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
          Search
        </Text>
      </View>
      
      <View style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.bgGray,
        styles.roundedFull,
        styles.px4,
        styles.py3
      )}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Icon name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const TabHeader = ({ 
  title, 
  tabs, 
  activeTab, 
  onTabChange,
  showFilter = false,
  onFilterPress 
}) => {
  return (
    <View style={clsx(styles.bgWhite, styles.px4, styles.pt12, styles.pb4, styles.shadowSm)}>
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
        <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
          {title}
        </Text>
        
        {showFilter && (
          <TouchableOpacity
            onPress={onFilterPress}
            style={clsx(styles.flexRow, styles.itemsCenter)}
          >
            <Icon name="filter-list" size={24} color={colors.primary} />
            <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.ml1)}>
              Filter
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {tabs && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mt2)}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={clsx(
                styles.px4,
                styles.py2,
                styles.mr3,
                styles.roundedFull,
                activeTab === tab.id ? styles.bgPrimary : styles.bgGray
              )}
              onPress={() => onTabChange(tab.id)}
            >
              <Text style={clsx(
                styles.fontMedium,
                activeTab === tab.id ? styles.textWhite : styles.textBlack
              )}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Header;