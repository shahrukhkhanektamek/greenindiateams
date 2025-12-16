import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';

const ToolsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);

  const categories = [
    { id: 'all', label: 'All Tools', icon: 'apps' },
    { id: 'electrical', label: 'Electrical', icon: 'electrical-services' },
    { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
    { id: 'cleaning', label: 'Cleaning', icon: 'cleaning-services' },
    { id: 'painting', label: 'Painting', icon: 'format-paint' },
    { id: 'safety', label: 'Safety', icon: 'security' },
  ];

  const tools = [
    {
      id: '1',
      name: 'Digital Multimeter',
      category: 'electrical',
      brand: 'Fluke',
      price: 3499,
      rentalPrice: 199,
      rating: 4.7,
      reviews: 245,
      description: 'Professional digital multimeter for accurate electrical measurements',
      features: ['Auto-ranging', 'True RMS', 'Safety CAT III 1000V'],
      image: 'https://picsum.photos/400/300?random=multimeter',
      inStock: true,
      stockCount: 15,
      inCart: false,
      owned: false,
    },
    {
      id: '2',
      name: 'Pipe Wrench Set',
      category: 'plumbing',
      brand: 'RIDGID',
      price: 2899,
      rentalPrice: 149,
      rating: 4.5,
      reviews: 189,
      description: 'Heavy-duty pipe wrench set for professional plumbing work',
      features: ['Adjustable jaw', 'Non-slip grip', 'Durable construction'],
      image: 'https://picsum.photos/400/300?random=wrench',
      inStock: true,
      stockCount: 8,
      inCart: true,
      owned: false,
    },
    {
      id: '3',
      name: 'Industrial Vacuum Cleaner',
      category: 'cleaning',
      brand: 'Karcher',
      price: 12499,
      rentalPrice: 499,
      rating: 4.8,
      reviews: 312,
      description: 'Powerful industrial vacuum for deep cleaning services',
      features: ['HEPA filter', '500W motor', '10L capacity'],
      image: 'https://picsum.photos/400/300?random=vacuum',
      inStock: true,
      stockCount: 5,
      inCart: false,
      owned: true,
    },
    {
      id: '4',
      name: 'Paint Spray Gun',
      category: 'painting',
      brand: 'Wagner',
      price: 5899,
      rentalPrice: 299,
      rating: 4.6,
      reviews: 167,
      description: 'Professional paint spray gun for smooth painting finish',
      features: ['Adjustable flow', 'Easy cleanup', 'Lightweight'],
      image: 'https://picsum.photos/400/300?random=spray',
      inStock: false,
      stockCount: 0,
      inCart: false,
      owned: false,
    },
    {
      id: '5',
      name: 'Safety Kit',
      category: 'safety',
      brand: '3M',
      price: 2499,
      rentalPrice: 99,
      rating: 4.9,
      reviews: 423,
      description: 'Complete safety kit for all types of service work',
      features: ['Safety goggles', 'Gloves', 'Mask', 'Ear protection'],
      image: 'https://picsum.photos/400/300?random=safety',
      inStock: true,
      stockCount: 25,
      inCart: false,
      owned: true,
    },
    {
      id: '6',
      name: 'AC Gauges Set',
      category: 'electrical',
      brand: 'Yellow Jacket',
      price: 7899,
      rentalPrice: 399,
      rating: 4.8,
      reviews: 198,
      description: 'Professional AC refrigerant gauges for HVAC technicians',
      features: ['Dual pressure', 'Temperature sensor', 'Hose set'],
      image: 'https://picsum.photos/400/300?random=gauges',
      inStock: true,
      stockCount: 12,
      inCart: false,
      owned: false,
    },
  ];

  const myTools = tools.filter(tool => tool.owned);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const featuredTools = [
    {
      id: 'featured1',
      name: 'Tool Rental Membership',
      description: 'Unlimited tool rentals for ₹2999/month',
      icon: 'card-membership',
      color: colors.primary,
    },
    {
      id: 'featured2',
      name: 'Tool Insurance',
      description: 'Protect your tools with our insurance plan',
      icon: 'shield',
      color: colors.success,
    },
    {
      id: 'featured3',
      name: 'Tool Maintenance',
      description: 'Professional maintenance for your tools',
      icon: 'build',
      color: colors.warning,
    },
  ];

  const toolServices = [
    {
      id: 'service1',
      title: 'Tool Repair',
      description: 'Get your tools repaired by experts',
      icon: 'handyman',
    },
    {
      id: 'service2',
      title: 'Tool Calibration',
      description: 'Precision calibration services',
      icon: 'tune',
    },
    {
      id: 'service3',
      title: 'Tool Certification',
      description: 'Get your tools certified',
      icon: 'verified',
    },
  ];

  const handleAddToCart = (tool) => {
    if (tool.inCart) {
      setCartItems(cartItems.filter(item => item.id !== tool.id));
      Alert.alert('Removed from Cart', `${tool.name} removed from cart`);
    } else {
      setCartItems([...cartItems, tool]);
      Alert.alert('Added to Cart', `${tool.name} added to cart`);
    }
  };

  const handleRentTool = (tool) => {
    navigation.navigate('RentTool', { tool });
  };

  const handleBuyTool = (tool) => {
    navigation.navigate('BuyTool', { tool });
  };

  const renderToolCard = ({ item }) => (
    <View style={clsx(
      styles.bgWhite,
      styles.roundedLg,
      styles.overflowHidden,
      styles.mb3,
      styles.shadow
    )}>
      {/* Tool Image */}
      <Image
        source={{ uri: item.image }}
        style={clsx(styles.w100, { height: 180 })}
        resizeMode="cover"
      />
      
      {/* Tool Badges */}
      <View style={clsx(styles.positionAbsolute, styles.top2, styles.right2, styles.flexRow)}>
        {item.owned && (
          <View style={clsx(
            styles.bgSuccess,
            styles.roundedFull,
            styles.px2,
            styles.py1,
            styles.mr2
          )}>
            <Text style={clsx(styles.textXs, styles.textWhite)}>
              Owned
            </Text>
          </View>
        )}
        {!item.inStock && (
          <View style={clsx(
            styles.bgError,
            styles.roundedFull,
            styles.px2,
            styles.py1
          )}>
            <Text style={clsx(styles.textXs, styles.textWhite)}>
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      <View style={clsx(styles.p4)}>
        {/* Tool Info */}
        <View style={clsx(styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb2)}>
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                {item.name}
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                {item.brand}
              </Text>
            </View>
            
            <View style={clsx(styles.itemsEnd)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.ml1)}>
                  {item.rating}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.ml1)}>
                  ({item.reviews})
                </Text>
              </View>
            </View>
          </View>

          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>
            {item.description}
          </Text>

          {/* Features */}
          <View style={clsx(styles.flexRow, styles.flexWrap)}>
            {item.features.slice(0, 2).map((feature, index) => (
              <View
                key={index}
                style={clsx(
                  styles.bgGray,
                  styles.roundedFull,
                  styles.px2,
                  styles.py1,
                  styles.mr2,
                  styles.mb2
                )}
              >
                <Text style={clsx(styles.textXs, styles.textMuted)}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
              ₹{item.price.toLocaleString()}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Buy
            </Text>
          </View>
          
          <View style={clsx(styles.itemsCenter)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textSuccess)}>
              ₹{item.rentalPrice}/day
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Rent
            </Text>
          </View>
          
          <View>
            <Text style={clsx(styles.textBase, styles.fontMedium, item.inStock ? styles.textSuccess : styles.textError)}>
              {item.inStock ? `${item.stockCount} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={clsx(styles.flexRow)}>
          {item.owned ? (
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.flex1,
                styles.p3,
                styles.bgSuccessLight,
                styles.roundedLg,
                styles.mr2
              )}
              onPress={() => navigation.navigate('ToolDetail', { tool: item })}
            >
              <Icon name="visibility" size={16} color={colors.success} />
              <Text style={clsx(styles.textSuccess, styles.fontMedium, styles.ml1)}>
                View Details
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.flex1,
                  styles.p3,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.mr2
                )}
                onPress={() => handleRentTool(item)}
                disabled={!item.inStock}
              >
                <Icon name="calendar-today" size={16} color={colors.primary} />
                <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.ml1)}>
                  Rent Now
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.flex1,
                  styles.p3,
                  item.inCart ? styles.bgError : styles.bgPrimary,
                  styles.roundedLg
                )}
                onPress={() => handleAddToCart(item)}
                disabled={!item.inStock}
              >
                <Icon 
                  name={item.inCart ? 'remove-shopping-cart' : 'add-shopping-cart'} 
                  size={16} 
                  color={colors.white} 
                />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  {item.inCart ? 'Remove' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Tools & Equipment"
        subtitle="Rent or buy professional tools"
        showBack
        onBackPress={() => navigation.goBack()}
        type="white"
        rightAction
        rightActionIcon="shopping-cart"
        onRightActionPress={() => navigation.navigate('Cart')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Tools Summary */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
              <View>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                  My Tools Inventory
                </Text>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  {myTools.length} tools • ₹{myTools.reduce((sum, tool) => sum + tool.price, 0).toLocaleString()} value
                </Text>
              </View>
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.px3,
                  styles.py2,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={() => navigation.navigate('MyTools')}
              >
                <Icon name="inventory" size={16} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                  {myTools.length}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Owned Tools
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                  3
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Rented Tools
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWarning)}>
                  2
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Maintenance Due
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Selector */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={clsx(styles.mb4)}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={clsx(
                  styles.itemsCenter,
                  styles.mr4
                )}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={clsx(
                  styles.roundedFull,
                  styles.p3,
                  styles.mb2,
                  selectedCategory === category.id ? 
                  styles.bgPrimary : 
                  styles.bgGray
                )}>
                  <Icon 
                    name={category.icon} 
                    size={24} 
                    color={selectedCategory === category.id ? colors.white : colors.text} 
                  />
                </View>
                <Text style={clsx(
                  styles.textSm,
                  styles.fontMedium,
                  selectedCategory === category.id ? styles.textPrimary : styles.textMuted
                )}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Tools & Services */}
        <View style={clsx(styles.mx4, styles.mb4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Featured Services
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={clsx(styles.mb4)}
          >
            {featuredTools.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.p4,
                  styles.mr3,
                  styles.shadow,
                  { width: 280 }
                )}
                onPress={() => navigation.navigate('ServiceDetail', { service })}
              >
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                  <View style={clsx(
                    styles.roundedFull,
                    styles.p3,
                    styles.mr3,
                    { backgroundColor: `${service.color}20` }
                  )}>
                    <Icon name={service.icon} size={24} color={service.color} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                      {service.name}
                    </Text>
                    <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                      {service.description}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    styles.mt2,
                    styles.px3,
                    styles.py2,
                    { backgroundColor: service.color },
                    styles.roundedFull
                  )}
                >
                  <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                    Learn More
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tool Services */}
        <View style={clsx(styles.mx4, styles.mb4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Tool Services
          </Text>
          
          <View style={clsx(styles.flexRow, styles.flexWrap, styles.mxN2)}>
            {toolServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.p4,
                  styles.mb3,
                  styles.shadow,
                  { width: '48%', marginHorizontal: '1%' }
                )}
                onPress={() => navigation.navigate('ToolService', { service })}
              >
                <View style={clsx(styles.itemsCenter)}>
                  <View style={clsx(
                    styles.roundedFull,
                    styles.p3,
                    styles.mb3,
                    styles.bgPrimaryLight
                  )}>
                    <Icon name={service.icon} size={24} color={colors.primary} />
                  </View>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb1, styles.textCenter)}>
                    {service.title}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                    {service.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tools Marketplace */}
        <View style={clsx(styles.mx4, styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Tools Marketplace
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllTools')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={tools.slice(0, 3)}
            renderItem={renderToolCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <View style={clsx(styles.mx4, styles.mb6)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                  Your Cart ({cartItems.length})
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                  ₹{cartTotal.toLocaleString()}
                </Text>
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
                onPress={() => navigation.navigate('Checkout')}
              >
                <Icon name="shopping-cart" size={24} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold, styles.ml2)}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>
              
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Free delivery on orders above ₹5000
              </Text>
            </View>
          </View>
        )}

        {/* Tool Tips */}
        <View style={clsx(styles.mx4, styles.mb6)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Tool Maintenance Tips
            </Text>
            
            <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
              <Icon name="clean-hands" size={20} color={colors.primary} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Clean After Use
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Always clean tools after use to prevent corrosion
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
              <Icon name="storage" size={20} color={colors.success} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Proper Storage
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Store tools in dry, organized places
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsStart)}>
              <Icon name="update" size={20} color={colors.warning} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Regular Calibration
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Calibrate measuring tools every 6 months
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ToolsScreen;