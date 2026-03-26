import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_URL = Platform.select({
  android: "http://10.0.2.2:8080/api",
  ios: "http://localhost:8080/api",
  default: "http://localhost:8080/api", // web
});

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? DEFAULT_URL;
