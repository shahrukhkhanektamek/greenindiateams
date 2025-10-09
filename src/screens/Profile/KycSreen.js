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

import { AppContext } from "../../Context/AppContext"
import appstyles, { colors } from "../../assets/app";
import { launchImageLibrary } from "react-native-image-picker";

const KycScreen = () => {
  const { Urls, postData, generateUniqueId, imageCheck } =
    useContext(AppContext);

  const [formData, setFormData] = useState({
    bankName: "",
    branchName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    passbookOrCheque: null,
    passbookOrChequePreview: "",
    panCardNumber: "",
    panCardImage: null,
    panCardImagePreview: "",
    aadharCardNumber: "",
    aadharFrontImage: null,
    aadharFrontImagePreview: "",
    aadharBackImage: null,
    aadharBackImagePreview: "",
    gstNumber: "",
    shopImage: null,
    shopImagePreview: "",
  });

  const fetchData = async () => {
    try {
      const response = await postData({}, Urls.serviceMankycDetail, "GET", 1, 1);
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          passbookOrChequePreview: imageCheck(response.data.passbookOrCheque),
          panCardImagePreview: imageCheck(response.data.panCardImage),
          aadharFrontImagePreview: imageCheck(response.data.aadharFrontImage),
          aadharBackImagePreview: imageCheck(response.data.aadharBackImage),
          shopImagePreview: imageCheck(response.data.shopImage),

          bankName: response.data.bankName,
          branchName: response.data.branchName,
          accountNumber: response.data.accountNumber,
          confirmAccountNumber: response.data.confirmAccountNumber,
          ifscCode: response.data.ifscCode,
          panCardNumber: response.data.panCardNumber,
          aadharCardNumber: response.data.aadharCardNumber,
          gstNumber: response.data.gstNumber,
        }));
      }
    } catch (error) {
      console.error("KYC fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
    if (!formData.bankName || !formData.accountNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const response = await postData(
        formData,
        Urls.serviceMankycUpdate,
        "POST",
        0,
        0,
        1
      );
      if (response.success) {
        Alert.alert("Success", "KYC Updated Successfully!");
      }
    } catch (error) {
      console.error("KYC submit error:", error);
    }
  };

  return (
    <ScrollView style={appstyles.container}>
      <Text style={[appstyles.brand, { fontSize: 22, marginVertical: 15 }]}>
        KYC Verification
      </Text>

      {/* Bank Details */}
      <Text style={appstyles.label}>Bank Name</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter Bank Name"
        value={formData.bankName}
        onChangeText={(v) => handleChange("bankName", v)}
      />

      <Text style={appstyles.label}>Branch Name</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter Branch Name"
        value={formData.branchName}
        onChangeText={(v) => handleChange("branchName", v)}
      />

      <Text style={appstyles.label}>Account Number</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter Account Number"
        value={formData.accountNumber}
        keyboardType="number-pad"
        onChangeText={(v) => handleChange("accountNumber", v)}
      />

      <Text style={appstyles.label}>Confirm Account Number</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Confirm Account Number"
        value={formData.confirmAccountNumber}
        keyboardType="number-pad"
        onChangeText={(v) => handleChange("confirmAccountNumber", v)}
      />

      <Text style={appstyles.label}>IFSC Code</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter IFSC Code"
        value={formData.ifscCode}
        onChangeText={(v) => handleChange("ifscCode", v)}
      />

      {/* Pan & Aadhaar */}
      <Text style={appstyles.label}>Pan Card Number</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter Pan Card Number"
        value={formData.panCardNumber}
        onChangeText={(v) => handleChange("panCardNumber", v)}
      />

      <Text style={appstyles.label}>Aadhaar Card Number</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter Aadhaar Card Number"
        value={formData.aadharCardNumber}
        onChangeText={(v) => handleChange("aadharCardNumber", v)}
      />

      <Text style={appstyles.label}>GST Number</Text>
      <TextInput
        style={appstyles.input}
        placeholder="Enter GST Number"
        value={formData.gstNumber}
        onChangeText={(v) => handleChange("gstNumber", v)}
      />

      {/* File Uploads */}
      {[
        { key: "passbookOrCheque", label: "Passbook/Cancel Cheque" },
        { key: "panCardImage", label: "Pan Card Image" },
        { key: "aadharFrontImage", label: "Aadhaar Front Image" },
        { key: "aadharBackImage", label: "Aadhaar Back Image" },
        { key: "shopImage", label: "Shop Image" },
      ].map((file) => (
        <View key={file.key} style={{ marginVertical: 10 }}>
          <Text style={appstyles.label}>{file.label}</Text>
          <TouchableOpacity
            style={[appstyles.card, { padding: 20, alignItems: "center" }]}
            onPress={() => handlePickImage(file.key)}
          >
            <Text style={{ color: colors.primary }}>
              Tap to Select {file.label}
            </Text>
          </TouchableOpacity>
          {formData[`${file.key}Preview`] && (
            <Image
              source={{ uri: formData[`${file.key}Preview`] }}
              style={{
                width: "100%",
                height: 150,
                marginTop: 10,
                borderRadius: 8,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      ))}

      <TouchableOpacity style={appstyles.loginBtn} onPress={handleSubmit}>
        <Text style={appstyles.loginBtnText}>Submit Verification</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default KycScreen;
