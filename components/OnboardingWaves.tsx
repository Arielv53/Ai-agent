import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg";

export default function OnboardingWaves() {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
      <Defs><LinearGradient id="wave" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#087abd" stopOpacity={0.32} />
        <Stop offset="1" stopColor="#032339" stopOpacity={0.04} />
      </LinearGradient></Defs>
      <Path d="M-80 680 C-30 220 240 260 460 410 L460 844 L-80 844Z" fill="url(#wave)" />
      <Path d="M-30 590 C70 270 260 210 430 370 M-30 670 C100 370 280 310 430 430 M-30 720 C100 490 270 420 430 510" fill="none" stroke="#1178ae" strokeWidth={0.7} opacity={0.4} />
    </Svg>
  </View>;
}
