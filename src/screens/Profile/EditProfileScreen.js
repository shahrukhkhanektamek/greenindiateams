import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { AppContext } from "../../Context/AppContext";
import appstyles, { colors } from "../../assets/app";
import { launchImageLibrary } from "react-native-image-picker";
import Select2Multiple from "../../components/Select/Select2Multiple ";
import PageHeader from "../../components/PageHeader";

const EditProfileScreen = () => {
  const {
    Urls,
    postData,
    generateUniqueId,
    imageCheck,
    formatDate,
    categoryListData,
    Toast,
    storage,
  } = useContext(AppContext);

  // ---------- Individual States ----------
  const [categoryIds, setCategoryIds] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [yearOfExperience, setYearOfExperience] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [referenceName1, setReferenceName1] = useState("");
  const [referenceMobile1, setReferenceMobile1] = useState("");
  const [referenceName2, setReferenceName2] = useState("");
  const [referenceMobile2, setReferenceMobile2] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  // ---------- Refresh ----------
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  // ---------- Fetch Profile Data ----------
  const fetchData = async () => {
    try {
      const response = await postData({}, Urls.ProfileDetail, "GET", 1, 1);
      if (response.success) {
        const d = response.data;
        setCategoryIds(d.categoryIds || []);
        setName(d.name || "");
        setEmail(d.email || "");
        setDob(d.dob || "");
        setExperienceLevel(d.experienceLevel || "");
        setCompanyName(d.companyName || "");
        setYearOfExperience(d.yearOfExperience || "");
        setPermanentAddress(d.permanentAddress || "");
        setCurrentAddress(d.currentAddress || "");
        setReferenceName1(d.referenceName1 || "");
        setReferenceMobile1(d.referenceMobile1 || "");
        setReferenceName2(d.referenceName2 || "");
        setReferenceMobile2(d.referenceMobile2 || "");
        setProfileImagePreview();
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Image Picker ----------
  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.error("ImagePicker Error: ", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setProfileImage(asset);
          setProfileImagePreview(asset.uri);
        }
      }
    );
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    try {
      const filedata = {
        categoryIds,
        name,
        email,
        dob,
        experienceLevel,
        companyName,
        yearOfExperience,
        permanentAddress,
        currentAddress,
        referenceName1,
        referenceMobile1,
        referenceName2,
        referenceMobile2,
        profileImage,
      };

      const response = await postData(
        filedata,
        Urls.ProfileUpdate,
        "POST",
        0,
        0,
        1
      );

      if (response.success) {
        // Alert.alert("Success", "Profile Updated Successfully!");
      }
    } catch (error) {
      console.error("Profile submit error:", error);
    }
  };





  // const updateProfile = async () => {
  //   // if (!file) {
  //   //   Toast.show({ type: "error", text1: "Please select a profile image!" });
  //   //   return;
  //   // }

  //   // setLoading(true);

  //   const formData = new FormData();
  //   formData.append("categoryIds", "68c261a6bf22c75618817f7d");
  //   formData.append("name", "Shahrukhfasfsaf");
  //   formData.append("email", "shahrukh@gmail.com");
  //   formData.append("dob", "2000-01-01");
  //   formData.append("experienceLevel", "Experience");
  //   formData.append("companyName", "XYZ PVT LTD");
  //   formData.append("yearOfExperience", "3"); 
  //   formData.append("permanentAddress", "Delhi");
  //   formData.append("currentAddress", "Delhi");
  //   formData.append("referenceName1", "xyx");
  //   formData.append("referenceMobile1", "12345567890");
  //   formData.append("referenceName2", "abc");
  //   formData.append("referenceMobile2", "0987654321");

  //   // formData.append("profileImage", {
  //   //   uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
  //   //   type: file.type,
  //   //   name: file.fileName,
  //   // });

  //   try {
  //     const token = await storage.get("token");
  //     const response = await fetch("http://192.168.1.61:8080/api/v1/serviceman/profile", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //       body: formData,
  //     });

  //     const data = await response.json();
  //     console.log("Profile Update Response:", data);

  //     if (data.status === 200) {
  //       Toast.show({ type: "success", text1: data.message || "Profile updated successfully!" });
  //     } else {
  //       Toast.show({ type: "error", text1: data.message || "Profile update failed!" });
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     Toast.show({ type: "error", text1: "Something went wrong!" });
  //   } finally {
  //     // setLoading(false);
  //   }
  // };

  // ---------- Render ----------
  return (
    <>
      <PageHeader data={{ title: "Edit Profile" }} />

      <ScrollView
        style={[appstyles.container, { marginTop: 10 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[appstyles.card]}>
          {/* Category Select */}
          <Text style={appstyles.label}>Category</Text>
          <Select2Multiple
            optionsList={categoryListData}
            value={categoryIds}
            onChange={setCategoryIds}
          />

          {/* Text Inputs */}
          {[
            { label: "Name", value: name, setter: setName, keyboard: "default" },
            { label: "Email", value: email, setter: setEmail, keyboard: "email-address" },
            { label: "Date of Birth", value: dob, setter: setDob, keyboard: "default" },
            { label: "Experience Level", value: experienceLevel, setter: setExperienceLevel, keyboard: "default" },
            { label: "Company Name", value: companyName, setter: setCompanyName, keyboard: "default" },
            { label: "Year Of Experience", value: yearOfExperience, setter: setYearOfExperience, keyboard: "numeric" },
            { label: "Permanent Address", value: permanentAddress, setter: setPermanentAddress, keyboard: "default" },
            { label: "Current Address", value: currentAddress, setter: setCurrentAddress, keyboard: "default" },
            { label: "Reference Name 1", value: referenceName1, setter: setReferenceName1, keyboard: "default" },
            { label: "Reference Mobile 1", value: referenceMobile1, setter: setReferenceMobile1, keyboard: "phone-pad" },
            { label: "Reference Name 2", value: referenceName2, setter: setReferenceName2, keyboard: "default" },
            { label: "Reference Mobile 2", value: referenceMobile2, setter: setReferenceMobile2, keyboard: "phone-pad" },
          ].map((field, index) => (
            <View key={index} style={{ marginVertical: 0 }}>
              <Text style={appstyles.label}>{field.label}</Text>
              <TextInput
                style={appstyles.input}
                placeholder={`Enter ${field.label}`}
                value={field.value}
                onChangeText={field.setter}
                keyboardType={field.keyboard}
              />
            </View>
          ))}

          {/* Profile Image */}
          <View style={{ marginVertical: 10 }}>
            <Text style={appstyles.label}>Profile Image</Text>
            <TouchableOpacity
              style={[appstyles.card, { padding: 20, alignItems: "center" }]}
              onPress={handlePickImage}
            >
              <Text style={{ color: colors.primary }}>
                Tap to Select Profile Image
              </Text>
            </TouchableOpacity>
            {profileImagePreview ? (
              <Image
                source={{ uri: profileImagePreview }}
                style={{
                  width: "100%",
                  height: 150,
                  marginTop: 10,
                  borderRadius: 8,
                }}
                resizeMode="contain"
              />
            ) : null} 
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={appstyles.loginBtn} onPress={handleSubmit}>
          <Text style={appstyles.loginBtnText}>Submit Profile</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
};

export default EditProfileScreen;
