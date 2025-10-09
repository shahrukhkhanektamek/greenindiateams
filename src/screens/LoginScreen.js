import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform, 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Swiper from "react-native-swiper";
import appstyles, { colors } from "../assets/app";
 

const { width } = Dimensions.get("window");

import { AppContext } from '../Context/AppContext';
import { useNavigation } from "@react-navigation/native";



const LoginScreen = () => {

  const { Toast, postData, Urls } = useContext(AppContext);
  const navigation = useNavigation();
  

  const [mobile, setmobile] = useState("");
  const handleLogin = async () => {
    if (!mobile) {
      Toast.show({ type: "error", text1: 'Please enter mobile' })
      return;
    }
    const filedata = {
      "mobile":mobile,
    };
  const response = await postData(filedata, Urls.login,"POST");
  if(response.success)
  {
    navigation.navigate('Otp',{mobile:mobile});
  }
};


  return (
    <View style={[appstyles.container, { flex: 1 }]}> 


      
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={[appstyles.logoHeader, { alignItems: "center", margin: 0 }]}>
            <Image
              source={require("../assets/img/logo.png")}
              style={[appstyles.logo]}
            />
          </View>

          {/* ✅ Image Slider Section */}
          <View
            style={{
              width: "100%",
              height: 200,
              borderRadius: 20,
              overflow: "hidden",
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              backgroundColor: "#fff",
              marginBottom: 20,
            }}
          >
            <Swiper
              autoplay
              autoplayTimeout={3}
              showsPagination={true}
              dotColor="#ccc"
              activeDotColor={colors.primary || "#4CAF50"}
            >
              <Image
                source={require("../assets/img/banner/slide1.jpg")}
                style={{ width: width, height: 200, resizeMode: "cover" }}
              />
              <Image
                source={require("../assets/img/banner/slide2.jpg")}
                style={{ width: width, height: 200, resizeMode: "cover" }}
              />
              <Image
                source={require("../assets/img/banner/slide3.jpg")}
                style={{ width: width, height: 200, resizeMode: "cover" }}
              />
            </Swiper>
          </View>

          {/* Card */}
          <View
            style={[
              appstyles.card,
              {
                width: "100%",
                alignItems: "center",
                paddingBottom: 40, // extra space for keyboard
              },
            ]}
          >
            <Text style={appstyles.welcome}>Welcome Back 👋</Text>
            <Text style={appstyles.brand}>Login to Green India</Text>

            {/* Email Input */}
            <TextInput
              style={[appstyles.input, { width: "100%" }]}
              placeholder="Enter Mobile"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              value={mobile}
              onChangeText={setmobile}
            />
 
            {/* Login Button */}
            <TouchableOpacity
              style={[appstyles.loginBtn, { width: "100%" }]}
              onPress={handleLogin}
            >
              <Text style={appstyles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          </View> 
        </ScrollView>
     
    </View>
  );
};

export default LoginScreen;
