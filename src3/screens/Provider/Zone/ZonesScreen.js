import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const { width, height } = Dimensions.get('window');

const ZonesScreen = ({ navigation }) => {
  const { Toast, Urls, postData, user } = useContext(AppContext);
  const mapRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  
  // Modal states
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  
  // Map region state
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139, // Default Delhi coordinates
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Fetch zones data from API
  const fetchZonesData = async () => {
    try {
      setLoading(true);
      
      const response = await postData(
        {},
        `${Urls.zonesList}`,
        'GET'
      );

      if (response?.success && response.data) {
        // Extract zones array from response.data
        const zonesArray = response.data.zones || [];
        setZones(zonesArray);
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load zones data',
        });
        
        // Sample data for demo using your API structure
        const sampleData = getSampleData();
        setZones(sampleData.zones);
      }
      
    } catch (error) {
      console.error('Fetch zones data error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to connect to server',
      });
      
      const sampleData = getSampleData();
      setZones(sampleData.zones);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sample data for demo based on your API response
  const getSampleData = () => {
    const sampleZones = [
      {
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [77.18548239135744, 28.62243170149782],
              [77.20381330212545, 28.602177136176376],
              [77.21965532972112, 28.608746839380597],
              [77.20351916028753, 28.640088431292877],
              [77.18548239135744, 28.62243170149782]
            ]
          ]
        },
        "_id": "694a85d1634d44bc6125476b",
        "name": "DC Zone",
        "status": true,
        "__v": 0
      },
      {
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [77.2120040740967, 28.623798365609144],
              [77.20024526977541, 28.629750120959834],
              [77.18977392578127, 28.61837368707317],
              [77.21251905822756, 28.607372784195547],
              [77.2120040740967, 28.623798365609144]
            ]
          ]
        },
        "_id": "694a8650634d44bc61254772",
        "name": "AB Zone",
        "status": true,
        "__v": 0
      },
      {
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [77.1700, 28.5900],
              [77.1800, 28.5800],
              [77.1900, 28.5850],
              [77.1850, 28.6000],
              [77.1700, 28.5900]
            ]
          ]
        },
        "_id": "694a8650634d44bc61254773",
        "name": "Central Zone",
        "status": false,
        "__v": 0
      }
    ];
    
    return {
      zones: sampleZones,
    };
  };

  // Calculate center of polygon for map region
  const calculatePolygonCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return { latitude: 28.6139, longitude: 77.2090 };
    
    let latSum = 0;
    let lngSum = 0;
    const polygonCoords = coordinates[0]; // First array contains the polygon coordinates
    
    for (let i = 0; i < polygonCoords.length - 1; i++) {
      lngSum += polygonCoords[i][0];
      latSum += polygonCoords[i][1];
    }
    
    return {
      latitude: latSum / (polygonCoords.length - 1),
      longitude: lngSum / (polygonCoords.length - 1)
    };
  };

  // Format coordinates for MapView Polygon
  const formatCoordinatesForMap = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return [];
    
    return coordinates[0].map(coord => ({
      latitude: coord[1],
      longitude: coord[0]
    }));
  };

const handleZonePress = (zone) => {

    // return true;
  console.log('Zone pressed:', zone.name);
  console.log('Zone geometry:', zone.geometry);
  
  // Validate zone data
  if (!zone || !zone.geometry || !zone.geometry.coordinates) {
    Toast.show({
      type: 'error',
      text1: 'Invalid Zone Data',
      text2: 'Zone coordinates are missing or invalid',
    });
    return;
  }
  
  const polygonCoords = zone.geometry.coordinates;
  console.log('Polygon coordinates:', polygonCoords);
  
  // Check if coordinates array is valid
  if (!Array.isArray(polygonCoords) || polygonCoords.length === 0) {
    Toast.show({
      type: 'error',
      text1: 'Invalid Coordinates',
      text2: 'Zone polygon coordinates are empty',
    });
    return;
  }
  
  const firstRing = polygonCoords[0];
  if (!Array.isArray(firstRing) || firstRing.length < 3) {
    Toast.show({
      type: 'error',
      text1: 'Invalid Polygon',
      text2: 'Polygon must have at least 3 points',
    });
    return;
  }
  
  // Calculate center
  let center;
  try {
    center = calculatePolygonCenter(polygonCoords);
    console.log('Calculated center:', center);
    
    // Validate center coordinates
    if (!center || isNaN(center.latitude) || isNaN(center.longitude)) {
      throw new Error('Invalid center coordinates');
    }
    
    console.log('Center is valid:', center.latitude, center.longitude);
    
  } catch (error) {
    console.error('Error calculating center:', error);
    center = { latitude: 28.6139, longitude: 77.2090 }; // Default fallback
    Toast.show({
      type: 'error',
      text1: 'Using Default Location',
      text2: 'Unable to calculate zone center',
    });
  }
  
  // Set selected zone and show modal
  setSelectedZone(zone);
  setShowMapModal(true);
  
  // Use requestAnimationFrame for better timing
  requestAnimationFrame(() => {
    // Small delay to ensure modal is fully rendered
    setTimeout(() => {
      console.log('Animating to region:', center);
      
      if (mapRef.current) {
        // Check if animateToRegion method exists
        if (typeof mapRef.current.animateToRegion === 'function') {
          mapRef.current.animateToRegion({
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 1000);
        } else {
          console.warn('animateToRegion method not found on mapRef');
          // Try alternative method
          if (typeof mapRef.current.fitToCoordinates === 'function') {
            const formattedCoords = formatCoordinatesForMap(polygonCoords);
            if (formattedCoords.length > 0) {
              mapRef.current.fitToCoordinates(formattedCoords, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }
          }
        }
      } else {
        console.warn('mapRef is not available');
      }
    }, 2000); // Reduced delay
  });
};

  const onRefresh = () => {
    setRefreshing(true);
    fetchZonesData();
  };

  const handleMapReady = () => {
    setMapLoading(false);
  };

  const getStatusColor = (status) => {
    return status ? colors.success : colors.error;
  };

  const getStatusText = (status) => {
    return status ? 'Active' : 'Inactive';
  };

  const getStatusIcon = (status) => {
    return status ? 'check-circle' : 'cancel';
  };

  const renderZoneCard = ({ item }) => {
    const isActive = item.status === true;
    const polygonCoords = item.geometry?.coordinates;
    const coordinates = polygonCoords ? polygonCoords[0] : [];
    const center = calculatePolygonCenter(polygonCoords);
    
    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.p4,
          styles.roundedLg,
          styles.shadowSm,
          styles.mb3,
          styles.borderLeft4,
          isActive ? styles.borderSuccess : styles.borderError
        )}
        onPress={() => handleZonePress(item)}
      >
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb2)}>
          <View style={clsx(styles.flex1)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon 
                name="location-on" 
                size={20} 
                color={isActive ? colors.primary : colors.textMuted} 
                style={clsx(styles.mr2)}
              />
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                {item.name}
              </Text>
            </View>
            
          
            
            {center && (
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                <Icon name="gps-fixed" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Center: {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon 
              name={getStatusIcon(item.status)} 
              size={20} 
              color={getStatusColor(item.status)} 
            />
          </View>
        </View>
        
        <View style={clsx(styles.justifyStart, styles.itemsStart, styles.pt0, styles.borderGray)}>          
          <View style={clsx(styles.itemsCenter, styles.flex1)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Status
            </Text>
            <Text style={clsx(
              styles.textSm,
              styles.fontMedium,
              isActive ? styles.textSuccess : styles.textError
            )}>
              {getStatusText(item.status)}
            </Text>
          </View>          
        </View>
      </TouchableOpacity>
    );
  };

  // Zone Details Modal
const renderZoneDetailsModal = () => {
  if (!selectedZone) return null;

  const polygonCoords = selectedZone.geometry?.coordinates;
  const coordinates = polygonCoords ? formatCoordinatesForMap(polygonCoords) : [];
  const center = calculatePolygonCenter(polygonCoords);
  const isActive = selectedZone.status === true;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showMapModal}
      onRequestClose={() => setShowMapModal(false)}
    >
      <View style={clsx(styles.flex1, styles.bgSurface)}>
        <Header
          title={selectedZone.name}
          showBack
          onBackPress={() => setShowMapModal(false)}
          showNotification={false}
          type="white"
          rightAction={false}
          showProfile={false}
        />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={clsx(styles.pb6)}
        >
          {/* Map Section */}
          <View style={clsx(styles.h80, styles.relative)}>
            {mapLoading && (
              <View style={clsx(
                styles.absolute,
                styles.inset0,
                styles.bgGrayLight,
                styles.justifyCenter,
                styles.itemsCenter,
                styles.z10
              )}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
                  Loading map...
                </Text>
              </View>
            )}
            
            {/* Safe check for coordinates before rendering MapView */}
            {coordinates.length > 0 ? (
              <MapView
                ref={mapRef}
                style={clsx(styles.flex1)}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: center?.latitude || 28.6139,
                  longitude: center?.longitude || 77.2090,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                onMapReady={handleMapReady}
                showsUserLocation={false} // Temporarily disable to avoid permission issues
                showsMyLocationButton={false}
                loadingEnabled={true}
                loadingIndicatorColor={colors.primary}
                loadingBackgroundColor={colors.bgSurface}
              >
                {/* Polygon for the zone */}
                <Polygon
                  coordinates={coordinates}
                  strokeWidth={2}
                  strokeColor={isActive ? colors.success : colors.error}
                  fillColor={isActive ? colors.success20 : colors.error20}
                />
                
                {/* Marker for the center - only if center is valid */}
                {center && !isNaN(center.latitude) && !isNaN(center.longitude) && (
                  <Marker
                    coordinate={center}
                    title={selectedZone.name}
                    description={`Zone Center (${coordinates.length} points)`}
                    pinColor={isActive ? colors.success : colors.error}
                  />
                )}
              </MapView>
            ) : (
              <View style={clsx(styles.flex1, styles.bgGrayLight, styles.justifyCenter, styles.itemsCenter)}>
                <Icon name="error-outline" size={48} color={colors.error} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textError, styles.mt3)}>
                  Unable to load zone coordinates
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.mt2, styles.px4)}>
                  The zone polygon data is incomplete or corrupted.
                </Text>
              </View>
            )}
            
            <View style={clsx(
              styles.absolute,
              styles.bottom4,
              styles.left0,
              styles.right4,
              styles.bgWhite,
              styles.p3,
              styles.roundedLg,
              styles.shadowLg
            )}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                <View>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    Zone Center
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Lat: {center?.latitude?.toFixed(6) || 'N/A'}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Long: {center?.longitude?.toFixed(6) || 'N/A'}
                  </Text>
                </View>
                
                <View style={clsx(styles.itemsEnd)}>
                  <View style={clsx(
                    styles.px3,
                    styles.py1,
                    styles.roundedFull,
                    isActive ? styles.bgSuccessLight : styles.bgErrorLight
                  )}>
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      isActive ? styles.textSuccess : styles.textError
                    )}>
                      {getStatusText(selectedZone.status)}
                    </Text>
                  </View>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                    Points: {coordinates.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Zone Details Section */}
          <View style={clsx(styles.p4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Zone Details
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
              <View style={clsx(styles.mb4)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                  <Icon name="location-on" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    {selectedZone.name}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
                  <Icon name="info" size={16} color={colors.textMuted} style={clsx(styles.mr2, styles.mt1)} />
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Zone ID: {selectedZone._id}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.mb4)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  Geometry Information
                </Text>
                
                <View style={clsx(styles.bgGrayLight, styles.p3, styles.roundedLg)}>
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
                    <Text style={clsx(styles.textSm, styles.textMuted)}>
                      Type:
                    </Text>
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                      {selectedZone.geometry?.type || 'Polygon'}
                    </Text>
                  </View>
                  
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
                    <Text style={clsx(styles.textSm, styles.textMuted)}>
                      Total Points:
                    </Text>
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                      {coordinates.length}
                    </Text>
                  </View>
                  
                  <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                    <Text style={clsx(styles.textSm, styles.textMuted)}>
                      Coordinates:
                    </Text>
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                      [{polygonCoords?.[0]?.length || 0}]
                    </Text>
                  </View>
                </View>
              </View>
              
              {polygonCoords?.[0]?.length > 0 && (
                <View style={clsx(styles.mb4)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Zone Coordinates (First 3 points)
                  </Text>
                  
                  <View style={clsx(styles.bgGrayLight, styles.p3, styles.roundedLg)}>
                    {polygonCoords[0].slice(0, 3).map((coord, index) => (
                      <View key={index} style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                        <Text style={clsx(styles.textSm, styles.textMuted)}>
                          Point {index + 1}:
                        </Text>
                        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                          {coord[1].toFixed(6)}, {coord[0].toFixed(6)}
                        </Text>
                      </View>
                    ))}
                    {polygonCoords[0].length > 3 && (
                      <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt1)}>
                        ... and {polygonCoords[0].length - 3} more points
                      </Text>
                    )}
                  </View>
                </View>
              )}
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <View>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb1)}>
                    Zone Status
                  </Text>
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon 
                      name={getStatusIcon(selectedZone.status)} 
                      size={16} 
                      color={getStatusColor(selectedZone.status)} 
                      style={clsx(styles.mr1)}
                    />
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      isActive ? styles.textSuccess : styles.textError
                    )}>
                      {getStatusText(selectedZone.status)}
                    </Text>
                  </View>
                </View>
                
                <View>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb1)}>
                    Version
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    v{selectedZone.__v || 0}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Actions */}
            <View style={clsx(styles.mt4, styles.flexRow, styles.spaceX2)}>
             
              
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.p3,
                  styles.bgWhite,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.itemsCenter
                )}
                onPress={() => setShowMapModal(false)}
              >
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

  useEffect(() => {
    fetchZonesData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading zones...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Assigned Zones"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="refresh"
        showProfile={false}
        onRightActionPress={onRefresh}
      />

      <View style={clsx(styles.flex1)}>
        <FlatList
          data={zones}
          renderItem={renderZoneCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={clsx(styles.p4, styles.pb6)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={() => (
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Your Assigned Zones ({zones.length})
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={clsx(styles.py10, styles.itemsCenter)}>
              <Icon name="location-off" size={64} color={colors.textMuted} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mt3, styles.mb2)}>
                No zones assigned yet
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.px4)}>
                You haven't been assigned to any zones. Please contact your administrator.
              </Text>
            </View>
          )}
        />
      </View>

      {/* Zone Details Modal with Map */}
      {renderZoneDetailsModal()}
    </View>
  );
};

export default ZonesScreen;