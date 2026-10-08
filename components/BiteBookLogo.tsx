import Svg, { Circle, G, Path } from "react-native-svg";

export default function BiteBookLogo({ width = 108, height = 126 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 140" accessibilityLabel="BiteBook: a fish on a slightly opened book">
      <G fill="none" stroke="#11c8ff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        {/* Slightly opened cover, spine, and visible page edges. */}
        <Path d="M20 30 L87 7 L87 18 M24 33 L94 16 L94 26 M28 37 L103 25 L103 32" />
        <Path d="M20 30 Q22 38 35 41 L112 26 L112 120 L35 136 Q22 134 20 126 Z" />
        <Path d="M35 41 L35 136 M20 30 L20 126" />
        {/* Fish is centered on the front cover. */}
        <Path d="M61 77 Q73 64 91 76 Q101 82 98 88 Q86 103 72 99 L66 106 L66 97 L58 91 L48 96 L52 84 L48 75 Z" />
        <Path d="M72 70 L70 62 L83 70 M88 75 Q82 85 87 97" />
      </G>
      <Circle cx={92} cy={83} r={2} fill="#11c8ff" />
    </Svg>
  );
}

