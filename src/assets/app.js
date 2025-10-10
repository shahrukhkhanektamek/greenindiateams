// src/assets/app.js

import { StyleSheet } from "react-native";

const colors = {
  primary: "#024F31",      // Green India main color
  primaryDark: "#013D26",  // Dark green
  accent: "#007E4F",       // Fresh accent green
  black: "#111111",
  white: "#FFFFFF",
  grey: "#555555",
  background: "#E9F3EF",   // Light green-gray background
};

const appstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
  },

  logoHeader: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 180,
    height: 80,
    resizeMode: "contain",
    marginTop: 20,
    // marginBottom: -5,
    // backgroundColor: "#fff",
    // borderRadius: 10,
    // padding: 10,
    // elevation: 4,
    // shadowColor: "#000",

  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  welcome: {
    fontSize: 18,
    color: colors.grey,
    marginBottom: 5,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: colors.black,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    marginLeft: -40,
    marginTop:-10,
  }, 
  eyeIcon: {
    fontSize: 18,
    color: colors.grey,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  link: {
    color: colors.primary,
    fontWeight: "600",
  },

  loginBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  signupText: {
    textAlign: "center",
    color: colors.grey,
    fontSize: 14,
  },

  // ---- Modal ----
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: colors.primary,
    textAlign: "center",
  },
  detailBox: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    color: colors.grey,
    width: '100%',
  },
  value: {
    flex: 1,
    color: colors.black, 
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.black,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    marginLeft: 8,
  },
  btnText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
});

export { colors };
export default appstyles;
