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
            Last Updated: January 2026
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            By entering your mobile number and verifying OTP, you agree to our Terms & Conditions and Privacy Policy. You consent to the collection and use of your mobile number and basic details for account verification, service booking, communication, and support related to our door-to-door home services across Delhi NCR.
          </Text>

          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            We do not store OTPs or sell your personal data. Information is shared only with verified service partners when required to complete your service. Your data is stored securely and retained only as necessary for service, legal, or operational purposes. You may withdraw consent or request data correction or deletion at any time.
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4)}>
            Our services are available only to users above 18 years of age. By proceeding, you confirm your acceptance of data processing in accordance with applicable Indian laws, including the Digital Personal Data Protection (DPDP) Act, 2023.
          </Text>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt2, styles.mb-3)}>
            Confirmation Statement
          </Text>
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb-4, styles.mt1)}>
            You have successfully verified your mobile number. By continuing, you confirm that the information provided by you is correct and verified, and you agree to our Terms & Conditions and Privacy Policy.
          </Text>
        
         
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsConditionsScreen;