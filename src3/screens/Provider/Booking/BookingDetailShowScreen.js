import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const BookingDetailShowScreen = ({ navigation, route }) => {
  const bookingId = route.params.bookingId;
  
  const { Toast, Urls, postData, UploadUrl, imageCheck } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [partsAmount, setPartsAmount] = useState(0);
  const [originalServiceAmount, setOriginalServiceAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBookingDetails().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await postData(
        {},
        `${Urls.getBookingDetail}/${bookingId}`,
        'GET'
      );
  
      if (response?.success && response.data) {
        const data = response.data; // ✅ response data ko variable me lo
        setBookingData(data);
  
        // ✅ Directly data object se values lo, bookingData state se nahi
        const booking = data.booking || {};
        
        // Parts Amount
        setPartsAmount(booking.additionalPartAmount || 0);
        
        // Original Service Amount
        if(booking.amount > booking.additionalPartAmount) {
          setOriginalServiceAmount(booking.amount - (booking.additionalPartAmount || 0));
        } else {
          setOriginalServiceAmount((booking.additionalPartAmount || 0) - booking.amount);
        }
        
        // GST Amount
        setGstAmount(booking.gstAmount || 0);
        
        // Grand Total
        setGrandTotal(booking.payableAmount || 0);
  
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load booking details',
        });
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load booking details',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return colors.success;
      case 'accept':
        return colors.primary;
      case 'new':
        return colors.info;
      case 'upcoming':
        return colors.warning;
      case 'cancel':
      case 'reject':
        return colors.error;
      case 'ongoing':
        return colors.info;
      case 'partstatusnew':
      case 'partstatusconfirm':
        return colors.warning;
      case 'partstatusapprove':
        return colors.success;
      case 'partstatusreject':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'complete':
        return 'Completed';
      case 'accept':
        return 'Accepted';
      case 'new':
        return 'New';
      case 'upcoming':
        return 'Upcoming';
      case 'cancel':
        return 'Cancelled';
      case 'reject':
        return 'Rejected';
      case 'ongoing':
        return 'In Progress';
      case 'partstatusnew':
        return 'Parts Submitted';
      case 'partstatusconfirm':
        return 'Parts Confirmed';
      case 'partstatusapprove':
        return 'Parts Approved';
      case 'partstatusreject':
        return 'Parts Rejected';
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  const formatDateTime = (dateString, timeString) => {
    return `${formatDate(dateString)}${timeString ? ` at ${timeString}` : ''}`;
  };

  const renderHeader = () => {
    const data = bookingData;
    if (!data) return null;

    const status = data.status || '';
    const statusColor = getStatusColor(status);
    const statusLabel = getStatusLabel(status);
    const booking = data.booking || {};
    const user = data.user || {};

    return (
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt3, styles.pb4)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Booking Details
          </Text>
          <View style={clsx(styles.w10)} />
        </View>

        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)}>
              Booking ID
            </Text>
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              {booking.bookingId || `BK${data._id?.slice(-6)}`}
            </Text>
          </View>
          
          <View style={clsx(
            styles.px4,
            styles.py2,
            styles.roundedFull,
            { backgroundColor: statusColor + '20' }
          )}>
            <Text style={clsx(styles.fontBold, { color: statusColor })}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCustomerInfo = () => {
    const data = bookingData;
    if (!data) return null;

    const user = data.user || {};
    const profileImage = user.profileImage ? `${UploadUrl}${user.profileImage}` : null;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Customer Information
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <View style={[clsx(styles.roundedFull, styles.overflowHidden, styles.mr3), 
              { width: 70, height: 70, backgroundColor: colors.gray200 }
            ]}>
              {profileImage ? (
                <Image
                  source={{ uri: imageCheck(profileImage, 'user.png') }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View style={clsx(styles.flex1, styles.itemsCenter, styles.justifyCenter)}>
                  <Icon name="person" size={40} color={colors.gray500} />
                </View>
              )}
            </View>
            
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                {user.name || 'N/A'}
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted, styles.mt1)}>
                {user.mobile || 'N/A'}
              </Text>
              {user.email && (
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                  {user.email}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderBookingTimeline = () => {
    const data = bookingData;
    if (!data) return null;

    const timelineItems = [
      { label: 'Assigned', date: data.assignedDate, time: data.assignedTime, icon: 'assignment' },
      { label: 'Accepted', date: data.acceptDate, time: data.acceptTime, icon: 'thumb-up' },
      { label: 'Started', date: data.startDate, time: data.startTime, icon: 'play-arrow' },
      { label: 'Completed', date: data.endDate, time: data.endTime, icon: 'check-circle' },
      { label: 'Cancelled', date: data.cancelDate, time: data.cancelTime, icon: 'cancel' },
    ].filter(item => item.date);

    if (timelineItems.length === 0) return null;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Timeline
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          {timelineItems.map((item, index) => (
            <View key={index} style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              index < timelineItems.length - 1 && styles.mb3
            )}>
              <View style={[clsx(
                styles.w5,
                styles.h5,
                styles.roundedFull,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mr3
              ), { backgroundColor: colors.primary + '20' }]}>
                <Icon name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  {item.label}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  {formatDateTime(item.date, item.time)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAddress = () => {
    const data = bookingData;
    if (!data) return null;

    const address = data.booking?.addressId || {};
    if (!address.houseNumber && !address.landmark) return null;

    const fullAddress = `${address.houseNumber || ''} ${address.landmark || ''}`.trim();
    const hasCoordinates = address.lat && address.long;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Service Address
        </Text>
        
        <TouchableOpacity
          style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.shadowSm,
            styles.flexRow,
            styles.itemsCenter
          )}
          onPress={() => {
            if (hasCoordinates) {
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address.lat},${address.long}`);
            } else if (fullAddress) {
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`);
            }
          }}
          disabled={!hasCoordinates && !fullAddress}
        >
          <View style={[clsx(styles.roundedFull, styles.p3, styles.mr3), 
            { backgroundColor: colors.primary + '20' }
          ]}>
            <Icon name="location-on" size={24} color={colors.primary} />
          </View>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textBase, styles.textBlack)}>
              {fullAddress || 'Address not available'}
            </Text>
            {hasCoordinates && (
              <Text style={clsx(styles.textSm, styles.textPrimary, styles.mt1)}>
                Tap to open in maps
              </Text>
            )}
          </View>
          {(hasCoordinates || fullAddress) && (
            <Icon name="open-in-new" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderServiceItems = () => {
    const data = bookingData;
    if (!data) return null;

    const bookingItems = data.booking?.bookingItems || [];
    if (bookingItems.length === 0) return null;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Service Items
        </Text>
        
        {bookingItems.map((item, index) => {
          const service = item.service || {};
          const media = item.bookingMedia || [];
          const beforeMedia = media.filter(m => m.mediaTimeline === 1);
          const afterMedia = media.filter(m => m.mediaTimeline === 2);

          return (
            <View key={item._id || index} style={clsx(
              styles.bgWhite,
              styles.roundedLg,
              styles.p4,
              styles.shadowSm,
              styles.mb3
            )}>
              {/* Item Header */}
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
                  { backgroundColor: colors.primary + '20' }
                ]}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                    {index + 1}
                  </Text>
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {service.name || `Item ${index + 1}`}
                  </Text>
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                    <Text style={clsx(styles.textBase, styles.textPrimary, styles.fontBold)}>
                      ₹{item.salePrice || 0}
                    </Text>
                    <Text style={clsx(styles.textSm, styles.textMuted, styles.ml2)}>
                      Qty: {item.quantity || 1}
                    </Text>
                    {item.mrpPrice && item.mrpPrice > item.salePrice && (
                      <Text style={clsx(styles.textSm, styles.textMuted, styles.ml2, styles.lineThrough)}>
                        ₹{item.mrpPrice}
                      </Text>
                    )}
                  </View>
                </View>
                {item.isMediaUpload === 1 && (
                  <View style={clsx(styles.px2, styles.py1, styles.bgInfoLight, styles.rounded)}>
                    <Text style={clsx(styles.textSm, styles.textInfo)}>Media Required</Text>
                  </View>
                )}
              </View>

              {/* Before Media */}
              {beforeMedia.length > 0 && (
                <View style={clsx(styles.mb3)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                    Before Service Media
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {beforeMedia.map((media, idx) => (
                      <TouchableOpacity
                        key={media._id || idx}
                        style={clsx(styles.mr2)}
                        onPress={() => Linking.openURL(`${UploadUrl}${media.media}`)}
                      >
                        {media.mediaType === 'image' ? (
                          <Image
                            source={{ uri: `${UploadUrl}${media.media}` }}
                            style={{ width: 100, height: 100, borderRadius: 8 }}
                          />
                        ) : (
                          <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 8,
                            backgroundColor: colors.gray800,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icon name="play-circle-filled" size={40} color={colors.white} />
                            <Text style={clsx(styles.textWhite, styles.textXs, styles.mt1)}>Video</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* After Media */}
              {afterMedia.length > 0 && (
                <View>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                    After Service Media
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {afterMedia.map((media, idx) => (
                      <TouchableOpacity
                        key={media._id || idx}
                        style={clsx(styles.mr2)}
                        onPress={() => Linking.openURL(`${UploadUrl}${media.media}`)}
                      >
                        {media.mediaType === 'image' ? (
                          <Image
                            source={{ uri: `${UploadUrl}${media.media}` }}
                            style={{ width: 100, height: 100, borderRadius: 8 }}
                          />
                        ) : (
                          <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 8,
                            backgroundColor: colors.gray800,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icon name="play-circle-filled" size={40} color={colors.white} />
                            <Text style={clsx(styles.textWhite, styles.textXs, styles.mt1)}>Video</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* No Media Message */}
              {beforeMedia.length === 0 && afterMedia.length === 0 && (
                <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.py3)}>
                  No media uploaded for this item
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderParts = () => {
    const data = bookingData;
    if (!data) return null;

    const parts = data.parts || [];
    if (parts.length === 0) return null;

    // Group parts by service item
    const partsByItem = {};
    parts.forEach(part => {
      const itemId = part.serviceItemId || 'all';
      if (!partsByItem[itemId]) {
        partsByItem[itemId] = [];
      }
      partsByItem[itemId].push(part);
    });

    // Get service items for reference
    const bookingItems = data.booking?.bookingItems || [];
    const itemMap = {};
    bookingItems.forEach(item => {
      itemMap[item._id] = item.service?.name || 'Service Item';
    });

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Parts & Materials Used
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          {Object.keys(partsByItem).map((itemId, groupIndex) => {
            const itemParts = partsByItem[itemId];
            const itemName = itemMap[itemId] || (itemId === 'all' ? 'General Parts' : 'Service Item');

            return (
              <View key={itemId} style={groupIndex > 0 && clsx(styles.mt4, styles.pt4, styles.borderTop, styles.borderLight)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                  {itemName}
                </Text>
                
                {itemParts.map((part, idx) => (
                  <View key={part._id || idx} style={clsx(
                    styles.flexRow,
                    styles.justifyBetween,
                    styles.itemsCenter,
                    styles.p3,
                    styles.bgGray50,
                    styles.rounded,
                    styles.mb2
                  )}>
                    <View style={clsx(styles.flex1)}>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                        {part.description || 'Part'}
                      </Text>
                      {part.groupTitle && (
                        <Text style={clsx(styles.textSm, styles.textMuted)}>
                          {part.groupTitle}
                        </Text>
                      )}
                      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                        <Text style={clsx(styles.textSm, styles.textMuted)}>
                          Qty: {part.quantity || 1}
                        </Text>
                      </View>
                    </View>
                    <View style={clsx(styles.itemsEnd)}>
                      <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                        ₹{part.unitPrice*part.quantity || 0}
                      </Text>
                      
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

          {/* Total Parts Amount */}
          <View style={clsx(
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.mt4,
            styles.pt4,
            styles.borderTop,
            styles.borderLight
          )}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Total Parts Amount
            </Text>
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary)}>
              ₹{parseFloat(partsAmount, 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentDetails = () => {
    const data = bookingData;
    if (!data) return null;

    const booking = data.booking || {};
    
    const paymentDetails = [
      { label: 'Service Amount', value: originalServiceAmount || 0 },
      { label: 'Taxes & Fees', value: booking.gstAmount || 0, note: `(${booking.gstPercent || 0}%)` },
      { label: 'Parts Amount', value: (partsAmount || 0), highlight: true },
      { label: 'Discount', value: (booking.discountAmount || 0), highlight: true },
    ].filter(item => item.value !== 0);

    if (paymentDetails.length === 0 && !booking.payableAmount) return null;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Payment Details
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          {paymentDetails.map((item, index) => (
            <View key={index} style={clsx(
              styles.flexRow,
              styles.justifyBetween,
              styles.itemsCenter,
              index < paymentDetails.length - 1 && styles.mb2
            )}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                {item.label} {item.note || ''}
              </Text>
              <Text style={clsx(
                styles.textBase,
                styles.fontMedium,
                item.highlight && item.value < 0 ? styles.textSuccess : styles.textBlack
              )}>
                {item.value < 0 ? `- ₹${Math.abs(parseFloat(item.value, 2)).toFixed(2)}` : `₹${parseFloat(item.value, 2).toFixed(2)}`}
              </Text>
            </View>
          ))}

          <View style={clsx(
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.mt4,
            styles.pt4,
            styles.borderTop,
            styles.borderLight
          )}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Total Payable
            </Text>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
              ₹{parseFloat(booking.payableAmount || 0, 2).toFixed(2)}
            </Text>
          </View>

          <View style={clsx(
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.mt3,
            styles.p3,
            styles.bgInfoLight,
            styles.rounded
          )}>
            <View>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                Payment Status
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {booking.paymentMode === 'online' ? 'Online Payment' : 'Cash on Delivery'}
              </Text>
            </View>
            <View style={clsx(
              styles.px3,
              styles.py1,
              styles.roundedFull,
              { backgroundColor: booking.paymentStatus === 1 ? colors.success + '20' : colors.warning + '20' }
            )}>
              <Text style={clsx(
                styles.textSm,
                styles.fontBold,
                { color: booking.paymentStatus === 1 ? colors.success : colors.warning }
              )}>
                {booking.paymentStatus === 1 ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>

          {booking.cashColletedAmount > 0 && (
            <View style={clsx(
              styles.flexRow,
              styles.justifyBetween,
              styles.itemsCenter,
              styles.mt2,
              styles.p3,
              styles.bgSuccessLight,
              styles.rounded
            )}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                Cash Collected
              </Text>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textSuccess)}>
                ₹{parseFloat(booking.cashColletedAmount, 2).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderServicemanSelfie = () => {
    const data = bookingData;
    if (!data || !data.selfie) return null;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Serviceman Selfie
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm,
          styles.itemsCenter
        )}>
          <Image
            source={{ uri: `${UploadUrl}${data.selfie}` }}
            style={{ width: 200, height: 200, borderRadius: 12 }}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  const renderReview = () => {
    const data = bookingData;
    if (!data || !data.review) return null;

    const review = data.review;

    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Customer Review
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= (review.rating || 0) ? 'star' : 'star-border'}
                  size={24}
                  color={star <= (review.rating || 0) ? colors.warning : colors.gray400}
                />
              ))}
            </View>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.ml2)}>
              {review.rating || 0}/5
            </Text>
          </View>
          
          {review.comment && (
            <Text style={clsx(styles.textBase, styles.textBlack, styles.mt2)}>
              "{review.comment}"
            </Text>
          )}
          
          {review.createdAt && (
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
              {formatDate(review.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading booking details...
        </Text>
      </View>
    );
  }

  if (!bookingData) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4)}>
          Booking not found
        </Text>
        <TouchableOpacity
          style={clsx(
            styles.mt6,
            styles.px6,
            styles.py3,
            styles.bgPrimary,
            styles.roundedFull
          )}
          onPress={() => navigation.goBack()}
        >
          <Text style={clsx(styles.textWhite, styles.fontBold)}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.pb8)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderCustomerInfo()}
        {renderBookingTimeline()}
        {renderAddress()}
        {renderServiceItems()}
        {renderParts()}
        {renderPaymentDetails()}
        {renderServicemanSelfie()}
        {renderReview()}

        <View style={clsx(styles.h20)} />
      </ScrollView>
    </View>
  );
};

export default BookingDetailShowScreen;