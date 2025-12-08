import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import appstyles, { colors } from "../assets/app";

import { AppContext } from '../Context/AppContext';
import { useNavigation } from "@react-navigation/native";

const OtpScreen = ({route}) => {

    const { mobile } = route.params;
    const { deviceId, handleLogout, setUserLoggedIn, Urls, postData, Toast, user, storage, setUser } = useContext(AppContext);
    const navigation = useNavigation(); 


  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next box automatically
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // const handleVerify = () => {
  //   const enteredOtp = otp.join("");
  //   console.log("Entered OTP:", enteredOtp);
  //   // navigation.navigate('Home');
  //   // Add your verify logic here
  // };
  
  
  
  
  
  const handleVerify = async () => {
      const enteredOtp = otp.join("");
      if (!enteredOtp) {
        Toast.show({ type: "error", text1: 'Please enter Otp' })
        return;
      }
      const filedata = {
        "mobile":mobile, 
        "otp":enteredOtp, 
      };
      const response = await postData(filedata, Urls.verifyOtp,"POST");
      if(response.success)
        {

          await storage.set("token", response?.token);
          await storage.set("user", JSON.stringify(response?.user));
          setUser(response?.user);
          setUserLoggedIn(true);

            // setUserLoggedIn(true);
          // navigation.navigate('Otp');
        }
  };

  return (
    <View style={[appstyles.container, { flex: 1 }]}> 
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[appstyles.welcome, { marginBottom: 10 }]}>
            Verify OTP 🔐
          </Text>
          <Text style={[appstyles.brand, { marginBottom: 30 }]}>
            Enter the 4-digit code sent to your mobile
          </Text>

          {/* OTP Boxes */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "80%" }}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                value={value}
                onChangeText={(text) => handleChange(text.replace(/[^0-9]/g, ""), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                style={{
                  width: 60,
                  height: 60,
                  textAlign: "center",
                  borderWidth: 2,
                  borderColor: value ? (colors.primary || "#4CAF50") : "#ccc",
                  borderRadius: 10,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#000",
                  backgroundColor: "#f9f9f9",
                }}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            style={[
              appstyles.loginBtn,
              { width: "80%", marginTop: 40, backgroundColor: colors.primary || "#4CAF50" },
            ]}
          >
            <Text style={appstyles.loginBtnText}>Verify OTP</Text>
          </TouchableOpacity>

          {/* Resend Option */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "#777" }}>
              Didn’t receive the code?{" "}
              <Text style={{ color: colors.primary || "#4CAF50", fontWeight: "600" }}>
                Resend
              </Text>
            </Text>
          </View>
        </ScrollView>
    </View>

  );
};

export default OtpScreen;
