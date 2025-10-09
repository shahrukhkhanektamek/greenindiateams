import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert, 
} from "react-native"; 
import { AppContext } from "../../Context/AppContext";
import appstyles, { colors } from "../../assets/app";
import { launchImageLibrary } from "react-native-image-picker";
import Select2Multiple from "../../components/Select/Select2Multiple ";

const EditProfileScreen = () => {
  const { 
    Urls, 
    postData, 
    generateUniqueId, 
    imageCheck, 
    formatDate, 
    categoryListData 
  } = useContext(AppContext);

  const [formData, setFormData] = useState({
    categoryIds: [],
    name: "",
    email: "", 
    dob: "",
    experienceLevel: "",
    companyName: "",
    yearOfExperience: "",
    permanentAddress: "",
    currentAddress: "",
    referenceName1: "",
    referenceMobile1: "",
    referenceName2: "",
    referenceMobile2: "",
    profileImage: null,
    profileImagePreview: "",        
  });

  const fetchData = async () => {
    try {
      const response = await postData({}, Urls.serviceManProfileDetail, "GET", 1, 1);
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          profileImagePreview: imageCheck(response.data.profileImage),
          categoryIds: response.data.categoryIds,
          name: response.data.name,
          email: response.data.email,
          dob: response.data.dob,
          experienceLevel: response.data.experienceLevel,
          companyName: response.data.companyName,
          yearOfExperience: response.data.yearOfExperience,
          permanentAddress: response.data.permanentAddress,
          currentAddress: response.data.currentAddress,
          referenceName1: response.data.referenceName1,
          referenceMobile1: response.data.referenceMobile1,
          referenceName2: response.data.referenceName2,
          referenceMobile2: response.data.referenceMobile2,
        }));
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (selectedIds) => {
    setFormData((prev) => ({ ...prev, categoryIds: selectedIds }));
  };

  const handlePickImage = (key) => {
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
          setFormData((prev) => ({
            ...prev,
            [key]: asset,
            [`${key}Preview`]: asset.uri,
          }));
        }
      }
    );
  };

  const handleSubmit = async () => {
    // Simple validation
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const response = await postData(
        formData,
        Urls.serviceManProfileUpdate,
        "POST",
        0,
        0,
        1
      );
      if (response.success) {
        Alert.alert("Success", "Profile Updated Successfully!");
      }
    } catch (error) {
      console.error("Profile submit error:", error);
    }
  };

  return (
    <ScrollView style={appstyles.container}>
      <Text style={[appstyles.brand, { fontSize: 22, marginVertical: 15 }]}>
        Profile
      </Text>

      {/* Category Select */}
      <Text style={appstyles.label}>Category</Text>
      <Select2Multiple
        optionsList={categoryListData}
        value={formData.categoryIds}
        onChange={handleCategoryChange}
      />

      {/* Text Inputs */}
      {[
        { key: "name", label: "Name", keyboard: "default" },
        { key: "email", label: "Email", keyboard: "email-address" },
        { key: "dob", label: "Date of Birth", keyboard: "default" },
        { key: "experienceLevel", label: "Experience Level", keyboard: "default" },
        { key: "companyName", label: "Company Name", keyboard: "default" },
        { key: "yearOfExperience", label: "Year Of Experience", keyboard: "numeric" },
        { key: "permanentAddress", label: "Permanent Address", keyboard: "default" },
        { key: "currentAddress", label: "Current Address", keyboard: "default" },
        { key: "referenceName1", label: "Reference Name 1", keyboard: "default" },
        { key: "referenceMobile1", label: "Reference Mobile 1", keyboard: "phone-pad" },
        { key: "referenceName2", label: "Reference Name 2", keyboard: "default" },
        { key: "referenceMobile2", label: "Reference Mobile 2", keyboard: "phone-pad" },
      ].map((field) => (
        <View key={field.key} style={{ marginVertical: 8 }}>
          <Text style={appstyles.label}>{field.label}</Text>
          <TextInput
            style={appstyles.input}
            placeholder={`Enter ${field.label}`}
            value={
              field.key === "dob"
                ? (formData[field.key])
                : formData[field.key]
            }
            onChangeText={(v) => handleChange(field.key, v)}
            keyboardType={field.keyboard}
          />
        </View>
      ))}

      {/* Profile Image */}
      <View style={{ marginVertical: 10 }}>
        <Text style={appstyles.label}>Profile Image</Text>
        <TouchableOpacity
          style={[appstyles.card, { padding: 20, alignItems: "center" }]}
          onPress={() => handlePickImage("profileImage")}
        >
          <Text style={{ color: colors.primary }}>Tap to Select Profile Image</Text>
        </TouchableOpacity>
        {formData.profileImagePreview && (
          <Image
            source={{ uri: formData.profileImagePreview }}
            style={{ width: "100%", height: 150, marginTop: 10, borderRadius: 8 }}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={appstyles.loginBtn} onPress={handleSubmit}>
        <Text style={appstyles.loginBtnText}>Submit Profile</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default EditProfileScreen;
