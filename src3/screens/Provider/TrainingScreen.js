import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Video } from 'expo-av';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';

const TrainingScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [videoRefs, setVideoRefs] = useState({});

  const categories = [
    { id: 'all', label: 'All Courses', icon: 'apps' },
    { id: 'technical', label: 'Technical', icon: 'engineering' },
    { id: 'safety', label: 'Safety', icon: 'security' },
    { id: 'customer', label: 'Customer Service', icon: 'people' },
    { id: 'business', label: 'Business Skills', icon: 'business' },
  ];

  const trainingCourses = [
    {
      id: '1',
      title: 'AC Repair Masterclass',
      category: 'technical',
      duration: '4h 30m',
      lessons: 12,
      level: 'Advanced',
      instructor: 'Expert Technician',
      rating: 4.8,
      students: 2450,
      thumbnail: 'https://picsum.photos/400/300?random=ac',
      completed: true,
      progress: 100,
      certificate: true,
    },
    {
      id: '2',
      title: 'Advanced Plumbing Techniques',
      category: 'technical',
      duration: '3h 15m',
      lessons: 8,
      level: 'Intermediate',
      instructor: 'Master Plumber',
      rating: 4.7,
      students: 1890,
      thumbnail: 'https://picsum.photos/400/300?random=plumbing',
      completed: false,
      progress: 65,
      certificate: false,
    },
    {
      id: '3',
      title: 'Customer Service Excellence',
      category: 'customer',
      duration: '2h 30m',
      lessons: 6,
      level: 'Beginner',
      instructor: 'Service Expert',
      rating: 4.9,
      students: 3250,
      thumbnail: 'https://picsum.photos/400/300?random=customer',
      completed: true,
      progress: 100,
      certificate: true,
    },
    {
      id: '4',
      title: 'Electrical Safety Protocols',
      category: 'safety',
      duration: '1h 45m',
      lessons: 5,
      level: 'Intermediate',
      instructor: 'Safety Officer',
      rating: 4.6,
      students: 2100,
      thumbnail: 'https://picsum.photos/400/300?random=safety',
      completed: false,
      progress: 30,
      certificate: false,
    },
    {
      id: '5',
      title: 'Business Growth Strategies',
      category: 'business',
      duration: '3h 00m',
      lessons: 7,
      level: 'Advanced',
      instructor: 'Business Coach',
      rating: 4.8,
      students: 1560,
      thumbnail: 'https://picsum.photos/400/300?random=business',
      completed: false,
      progress: 0,
      certificate: false,
    },
    {
      id: '6',
      title: 'Tool Maintenance Guide',
      category: 'technical',
      duration: '2h 15m',
      lessons: 5,
      level: 'Beginner',
      instructor: 'Tool Expert',
      rating: 4.5,
      students: 1780,
      thumbnail: 'https://picsum.photos/400/300?random=tools',
      completed: true,
      progress: 100,
      certificate: true,
    },
  ];

  const certificates = [
    {
      id: 'cert1',
      course: 'AC Repair Masterclass',
      date: '2024-01-10',
      certificateId: 'UC-CERT-2024-001',
      downloadUrl: 'https://example.com/cert1.pdf',
    },
    {
      id: 'cert2',
      course: 'Customer Service Excellence',
      date: '2024-01-05',
      certificateId: 'UC-CERT-2024-002',
      downloadUrl: 'https://example.com/cert2.pdf',
    },
    {
      id: 'cert3',
      course: 'Tool Maintenance Guide',
      date: '2023-12-20',
      certificateId: 'UC-CERT-2023-125',
      downloadUrl: 'https://example.com/cert3.pdf',
    },
  ];

  const recommendedCourses = [
    {
      id: 'rec1',
      title: 'Smart Home Installation',
      duration: '3h 45m',
      category: 'technical',
    },
    {
      id: 'rec2',
      title: 'Conflict Resolution Skills',
      duration: '2h 00m',
      category: 'customer',
    },
    {
      id: 'rec3',
      title: 'Digital Payment Mastery',
      duration: '1h 30m',
      category: 'business',
    },
  ];

  const trainingStats = {
    completedCourses: 3,
    totalCourses: 6,
    totalHours: 17,
    certificates: 3,
    skillLevel: 'Intermediate',
  };

  const filteredCourses = selectedCategory === 'all'
    ? trainingCourses
    : trainingCourses.filter(course => course.category === selectedCategory);

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity
      style={clsx(
        styles.bgWhite,
        styles.roundedLg,
        styles.overflowHidden,
        styles.mb3,
        styles.shadow
      )}
      onPress={() => navigation.navigate('CourseDetail', { course: item })}
    >
      <View style={clsx(styles.flexRow)}>
        {/* Course Thumbnail */}
        <Image
          source={{ uri: item.thumbnail }}
          style={clsx({ width: 120, height: '100%' })}
          resizeMode="cover"
        />
        
        <View style={clsx(styles.flex1, styles.p4)}>
          {/* Course Header */}
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb2)}>
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                {item.title}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                {item.instructor} • {item.level}
              </Text>
            </View>
            
            {item.completed && (
              <View style={clsx(
                styles.bgSuccessLight,
                styles.roundedFull,
                styles.px2,
                styles.py1
              )}>
                <Icon name="check-circle" size={14} color={colors.success} />
              </View>
            )}
          </View>

          {/* Course Stats */}
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4)}>
              <Icon name="schedule" size={14} color={colors.textMuted} />
              <Text style={clsx(styles.textSm, styles.textMuted, styles.ml1)}>
                {item.duration}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4)}>
              <Icon name="menu-book" size={14} color={colors.textMuted} />
              <Text style={clsx(styles.textSm, styles.textMuted, styles.ml1)}>
                {item.lessons} lessons
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={clsx(styles.textSm, styles.textMuted, styles.ml1)}>
                {item.rating}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {item.completed ? 'Completed' : 'Progress'}
              </Text>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                {item.progress}%
              </Text>
            </View>
            <View style={clsx(styles.bgGray, styles.roundedFull, styles.overflowHidden)}>
              <View style={clsx(
                item.completed ? styles.bgSuccess : styles.bgPrimary,
                styles.h2,
                styles.roundedFull,
                { width: `${item.progress}%` }
              )} />
            </View>
            
            {!item.completed && (
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.mt3,
                  styles.px3,
                  styles.py2,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={() => navigation.navigate('CoursePlayer', { course: item })}
              >
                <Icon name="play-arrow" size={16} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  {item.progress === 0 ? 'Start Course' : 'Continue'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Training Center"
        subtitle="Upskill and grow your career"
        showBack
        onBackPress={() => navigation.goBack()}
        type="white"
        rightAction
        rightActionIcon="school"
        onRightActionPress={() => navigation.navigate('MyCertificates')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Training Stats */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
              <View>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                  Your Training Progress
                </Text>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  Skill Level: {trainingStats.skillLevel}
                </Text>
              </View>
              <View style={clsx(
                styles.bgPrimaryLight,
                styles.roundedFull,
                styles.px3,
                styles.py1
              )}>
                <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                  {trainingStats.completedCourses}/{trainingStats.totalCourses}
                </Text>
              </View>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                  {trainingStats.completedCourses}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Completed
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                  {trainingStats.totalHours}h
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Total Hours
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWarning)}>
                  {trainingStats.certificates}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Certificates
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
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.px4,
                  styles.py2,
                  styles.mr3,
                  styles.roundedFull,
                  selectedCategory === category.id ? styles.bgPrimary : styles.bgGray
                )}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? colors.white : colors.text} 
                />
                <Text style={clsx(
                  styles.fontMedium,
                  styles.ml2,
                  selectedCategory === category.id ? styles.textWhite : styles.textBlack
                )}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Course */}
        <View style={clsx(styles.mx4, styles.mb4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Featured Course
          </Text>
          
          <TouchableOpacity
            style={clsx(
              styles.bgWhite,
              styles.roundedLg,
              styles.overflowHidden,
              styles.shadow
            )}
            onPress={() => navigation.navigate('CourseDetail', { 
              course: trainingCourses.find(c => c.id === '2') 
            })}
          >
            <Image
              source={{ uri: 'https://picsum.photos/400/300?random=featured' }}
              style={clsx(styles.w100, { height: 200 })}
              resizeMode="cover"
            />
            
            <View style={clsx(styles.p4)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb2)}>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                    Advanced Plumbing Techniques
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted, styles.mt1)}>
                    Master complex plumbing repairs and installations
                  </Text>
                </View>
                
                <View style={clsx(
                  styles.bgWarningLight,
                  styles.roundedFull,
                  styles.px3,
                  styles.py1
                )}>
                  <Text style={clsx(styles.textWarning, styles.fontBold)}>
                    Popular
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.p3,
                  styles.bgPrimary,
                  styles.roundedLg
                )}
              >
                <Icon name="play-circle" size={24} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold, styles.ml2)}>
                  Start Free Preview
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* My Courses */}
        <View style={clsx(styles.mx4, styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              My Courses
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllCourses')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredCourses.slice(0, 3)}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Certificates */}
        <View style={clsx(styles.mx4, styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              My Certificates
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MyCertificates')}
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
            {certificates.map((cert) => (
              <TouchableOpacity
                key={cert.id}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.p4,
                  styles.mr3,
                  styles.shadow,
                  { width: 280 }
                )}
                onPress={() => navigation.navigate('CertificateView', { certificate: cert })}
              >
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                  <View style={clsx(
                    styles.roundedFull,
                    styles.p3,
                    styles.mr3,
                    styles.bgSuccessLight
                  )}>
                    <Icon name="verified" size={24} color={colors.success} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                      {cert.course}
                    </Text>
                    <Text style={clsx(styles.textSm, styles.textMuted)}>
                      Issued: {cert.date}
                    </Text>
                  </View>
                </View>
                
                <View style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyBetween,
                  styles.mt3
                )}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    ID: {cert.certificateId}
                  </Text>
                  <TouchableOpacity
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.px3,
                      styles.py1,
                      styles.bgPrimary,
                      styles.roundedFull
                    )}
                  >
                    <Icon name="download" size={16} color={colors.white} />
                    <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Courses */}
        <View style={clsx(styles.mx4, styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Recommended For You
          </Text>
          
          {recommendedCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.bgWhite,
                styles.roundedLg,
                styles.p4,
                styles.mb3,
                styles.shadow
              )}
              onPress={() => navigation.navigate('CourseDetail', { course })}
            >
              <View style={clsx(
                styles.roundedFull,
                styles.p3,
                styles.mr3,
                styles.bgPrimaryLight
              )}>
                <Icon name="play-circle" size={24} color={colors.primary} />
              </View>
              
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {course.title}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                  {course.duration} • {course.category}
                </Text>
              </View>
              
              <Icon name="chevron-right" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}

          {/* Training Benefits */}
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Benefits of Training
            </Text>
            
            <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
              <Icon name="trending-up" size={20} color={colors.success} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Higher Earnings
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Certified partners earn 25% more
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
              <Icon name="star" size={20} color={colors.warning} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Better Ratings
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Trained partners get 4.8+ average rating
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsStart)}>
              <Icon name="workspace-premium" size={20} color={colors.primary} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Priority Jobs
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Get access to premium jobs first
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TrainingScreen;