import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';


const TermsConditionsScreen = ({ navigation }) => {
  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
        <Header
            title="Terms & Conditions"
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
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt4)}
      >
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
            Last Updated: December 2024
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            Please read these Terms and Conditions carefully before using the Green India Teams app.
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt-6, styles.mb-3)}>
            1. Acceptance of Terms
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            By accessing and using this app, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt-6, styles.mb-3)}>
            2. User Responsibilities
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            • You are responsible for maintaining the confidentiality of your account
            {'\n'}• You must provide accurate information
            {'\n'}• You agree to use the app only for lawful purposes
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt-6, styles.mb-3)}>
            3. Service Provider Terms
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            • Service providers must maintain professional conduct
            {'\n'}• Timely completion of services is expected
            {'\n'}• Quality standards must be maintained
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt-6, styles.mb-3)}>
            4. Payments
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            • All payments are processed securely
            {'\n'}• Service fees are non-refundable
            {'\n'}• Payment disputes must be reported within 24 hours
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt-6, styles.mb-3)}>
            5. Privacy
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            Your privacy is important to us. Please read our Privacy Policy.
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt-6, styles.mb-3)}>
            6. Limitation of Liability
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            We shall not be liable for any indirect, incidental, special, consequential or punitive damages.
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mt-6)}>
            For any questions about these Terms, please contact us at support@greenindiateams.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsConditionsScreen;