import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { SvgXml } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type RoccoPose = 'idle' | 'happy' | 'thinking' | 'empty';

interface RoccoProps {
  pose: RoccoPose;
  size?: number;
  message?: string;
}

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// Rocco SVGs inlined for now - will import from shared when properly linked
const ROCCO_SVGS: Record<RoccoPose, string> = {
  idle: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="145" rx="45" ry="35" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <path d="M55 140 Q30 130 25 110 Q20 90 35 85" fill="none" stroke="#193857" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="70" cy="140" rx="12" ry="8" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <ellipse cx="130" cy="140" rx="12" ry="8" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <ellipse cx="100" cy="148" rx="28" ry="12" fill="#3173AD"/>
    <ellipse cx="100" cy="145" rx="25" ry="10" fill="#F4EEE0"/>
    <path d="M90 142 Q85 135 92 138 Q88 130 95 136" fill="#4CAF50"/>
    <circle cx="95" cy="140" r="4" fill="#E8926F"/>
    <ellipse cx="100" cy="75" rx="42" ry="38" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="65" cy="45" rx="15" ry="18" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="65" cy="45" rx="8" ry="10" fill="#E8926F"/>
    <ellipse cx="135" cy="45" rx="15" ry="18" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="135" cy="45" rx="8" ry="10" fill="#E8926F"/>
    <path d="M58 68 Q70 62 82 68 Q90 72 100 72 Q110 72 118 68 Q130 62 142 68 Q145 78 140 85 Q130 90 118 85 Q110 82 100 82 Q90 82 82 85 Q70 90 60 85 Q55 78 58 68" fill="#193857"/>
    <ellipse cx="78" cy="75" rx="8" ry="9" fill="#F4EEE0"/>
    <ellipse cx="122" cy="75" rx="8" ry="9" fill="#F4EEE0"/>
    <circle cx="80" cy="75" r="4" fill="#193857"/>
    <circle cx="124" cy="75" r="4" fill="#193857"/>
    <ellipse cx="100" cy="90" rx="6" ry="4" fill="#193857"/>
    <ellipse cx="68" cy="88" rx="8" ry="5" fill="#E8926F" opacity="0.6"/>
    <ellipse cx="132" cy="88" rx="8" ry="5" fill="#E8926F" opacity="0.6"/>
    <path d="M94 96 Q100 100 106 96" fill="none" stroke="#193857" stroke-width="2" stroke-linecap="round"/>
    <path d="M58 58 Q100 68 142 58 Q145 52 142 48 Q100 55 58 48 Q55 52 58 58" fill="#E8926F" stroke="#193857" stroke-width="2"/>
  </svg>`,
  happy: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="142" rx="45" ry="35" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <path d="M55 135 Q25 115 30 85 Q35 65 50 70" fill="none" stroke="#193857" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="70" cy="138" rx="12" ry="8" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <path d="M145 130 Q160 110 155 90" fill="none" stroke="#193857" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="155" cy="88" rx="10" ry="8" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <ellipse cx="95" cy="148" rx="26" ry="11" fill="#3173AD" transform="rotate(-5 95 148)"/>
    <path d="M165 75 L168 70 L171 75 L176 72 L171 75 L174 80 L171 75 L168 80 L165 75" fill="#E8926F"/>
    <circle cx="45" cy="60" r="3" fill="#E8926F"/>
    <ellipse cx="100" cy="72" rx="42" ry="38" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="62" cy="40" rx="15" ry="18" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="62" cy="40" rx="8" ry="10" fill="#E8926F"/>
    <ellipse cx="138" cy="40" rx="15" ry="18" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="138" cy="40" rx="8" ry="10" fill="#E8926F"/>
    <path d="M58 65 Q70 59 82 65 Q90 69 100 69 Q110 69 118 65 Q130 59 142 65 Q145 75 140 82 Q130 87 118 82 Q110 79 100 79 Q90 79 82 82 Q70 87 60 82 Q55 75 58 65" fill="#193857"/>
    <path d="M70 73 Q78 68 86 73" fill="none" stroke="#F4EEE0" stroke-width="3" stroke-linecap="round"/>
    <path d="M114 73 Q122 68 130 73" fill="none" stroke="#F4EEE0" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="100" cy="87" rx="6" ry="4" fill="#193857"/>
    <ellipse cx="68" cy="85" rx="9" ry="6" fill="#E8926F" opacity="0.7"/>
    <ellipse cx="132" cy="85" rx="9" ry="6" fill="#E8926F" opacity="0.7"/>
    <path d="M88 93 Q100 105 112 93" fill="none" stroke="#193857" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M58 55 Q100 65 142 55 Q145 49 142 45 Q100 52 58 45 Q55 49 58 55" fill="#E8926F" stroke="#193857" stroke-width="2"/>
  </svg>`,
  thinking: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="145" rx="45" ry="35" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <path d="M55 140 Q35 135 28 115 Q22 95 35 88" fill="none" stroke="#193857" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="60" cy="145" rx="10" ry="8" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <path d="M140 140 Q155 130 150 110 Q145 95 130 95" fill="none" stroke="#193857" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="128" cy="94" rx="8" ry="7" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <ellipse cx="102" cy="75" rx="42" ry="38" fill="#F4EEE0" stroke="#193857" stroke-width="3" transform="rotate(5 102 75)"/>
    <ellipse cx="68" cy="42" rx="15" ry="18" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="68" cy="42" rx="8" ry="10" fill="#E8926F"/>
    <ellipse cx="138" cy="48" rx="15" ry="18" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="138" cy="48" rx="8" ry="10" fill="#E8926F"/>
    <path d="M60 68 Q72 62 84 68 Q92 72 102 72 Q112 72 120 68 Q132 62 144 68 Q147 78 142 85 Q132 90 120 85 Q112 82 102 82 Q92 82 84 85 Q72 90 62 85 Q57 78 60 68" fill="#193857"/>
    <ellipse cx="80" cy="75" rx="8" ry="9" fill="#F4EEE0"/>
    <ellipse cx="124" cy="75" rx="8" ry="9" fill="#F4EEE0"/>
    <circle cx="82" cy="72" r="4" fill="#193857"/>
    <circle cx="126" cy="72" r="4" fill="#193857"/>
    <ellipse cx="102" cy="90" rx="6" ry="4" fill="#193857"/>
    <ellipse cx="70" cy="88" rx="8" ry="5" fill="#E8926F" opacity="0.6"/>
    <ellipse cx="134" cy="88" rx="8" ry="5" fill="#E8926F" opacity="0.6"/>
    <path d="M96 96 Q102 94 108 96" fill="none" stroke="#193857" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 58 Q102 68 144 58 Q147 52 144 48 Q102 55 60 48 Q57 52 60 58" fill="#E8926F" stroke="#193857" stroke-width="2"/>
    <circle cx="165" cy="55" r="5" fill="#3173AD" opacity="0.4"/>
    <circle cx="175" cy="45" r="6" fill="#3173AD" opacity="0.6"/>
    <circle cx="188" cy="32" r="8" fill="#3173AD" opacity="0.8"/>
  </svg>`,
  empty: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="145" rx="45" ry="35" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <path d="M55 145 Q30 150 25 165 Q22 175 30 180" fill="none" stroke="#193857" stroke-width="8" stroke-linecap="round"/>
    <path d="M55 135 Q40 120 45 100" fill="none" stroke="#193857" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="45" cy="98" rx="8" ry="7" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <path d="M145 135 Q160 120 155 100" fill="none" stroke="#193857" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="155" cy="98" rx="8" ry="7" fill="#F4EEE0" stroke="#193857" stroke-width="2"/>
    <ellipse cx="100" cy="155" rx="22" ry="9" fill="#3173AD"/>
    <ellipse cx="100" cy="152" rx="19" ry="7" fill="#F4EEE0"/>
    <ellipse cx="100" cy="75" rx="42" ry="38" fill="#F4EEE0" stroke="#193857" stroke-width="3"/>
    <ellipse cx="62" cy="48" rx="15" ry="16" fill="#F4EEE0" stroke="#193857" stroke-width="3" transform="rotate(-10 62 48)"/>
    <ellipse cx="62" cy="48" rx="8" ry="9" fill="#E8926F" transform="rotate(-10 62 48)"/>
    <ellipse cx="138" cy="48" rx="15" ry="16" fill="#F4EEE0" stroke="#193857" stroke-width="3" transform="rotate(10 138 48)"/>
    <ellipse cx="138" cy="48" rx="8" ry="9" fill="#E8926F" transform="rotate(10 138 48)"/>
    <path d="M58 68 Q70 62 82 68 Q90 72 100 72 Q110 72 118 68 Q130 62 142 68 Q145 78 140 85 Q130 90 118 85 Q110 82 100 82 Q90 82 82 85 Q70 90 60 85 Q55 78 58 68" fill="#193857"/>
    <ellipse cx="78" cy="75" rx="8" ry="9" fill="#F4EEE0"/>
    <ellipse cx="122" cy="75" rx="8" ry="9" fill="#F4EEE0"/>
    <circle cx="78" cy="76" r="4" fill="#193857"/>
    <circle cx="122" cy="76" r="4" fill="#193857"/>
    <path d="M70 66 Q78 64 86 68" fill="none" stroke="#193857" stroke-width="2" stroke-linecap="round"/>
    <path d="M130 66 Q122 64 114 68" fill="none" stroke="#193857" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="100" cy="90" rx="6" ry="4" fill="#193857"/>
    <ellipse cx="68" cy="88" rx="8" ry="5" fill="#E8926F" opacity="0.5"/>
    <ellipse cx="132" cy="88" rx="8" ry="5" fill="#E8926F" opacity="0.5"/>
    <path d="M92 96 Q100 98 108 96" fill="none" stroke="#193857" stroke-width="2" stroke-linecap="round"/>
    <path d="M145 65 Q148 58 145 52 Q142 58 145 65" fill="#3173AD" opacity="0.6"/>
    <path d="M58 58 Q100 68 142 58 Q145 52 142 48 Q100 55 58 48 Q55 52 58 58" fill="#E8926F" stroke="#193857" stroke-width="2"/>
  </svg>`,
};

const EMPTY_MESSAGES = [
  "Even Rocco couldn't find a bite here",
  'No healthy spots nearby... yet!',
  "Rocco's bowl is empty too",
  'Nothing matched your search',
];

export function Rocco({ pose, size = 160, message }: RoccoProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const reduced = useReducedMotion();

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Thinking dots animation
  const dot1Opacity = useSharedValue(0.4);
  const dot2Opacity = useSharedValue(0.6);
  const dot3Opacity = useSharedValue(0.8);

  useEffect(() => {
    if (reduced) return;

    if (pose === 'happy') {
      // Bounce animation for happy pose
      scale.value = withSequence(
        withSpring(1.05, { duration: 200, dampingRatio: 0.6 }),
        withSpring(1, { duration: 300, dampingRatio: 0.8 })
      );
    } else if (pose === 'thinking') {
      // Subtle pulse for thinking
      dot1Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.4, { duration: 400 })
        ),
        -1,
        false
      );
      dot2Opacity.value = withDelay(
        133,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.6, { duration: 400 })
          ),
          -1,
          false
        )
      );
      dot3Opacity.value = withDelay(
        266,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.8, { duration: 400 })
          ),
          -1,
          false
        )
      );
    } else if (pose === 'idle') {
      // Gentle breathing for idle
      translateY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 2000, easing: EASE_OUT }),
          withTiming(0, { duration: 2000, easing: EASE_OUT })
        ),
        -1,
        true
      );
    }
  }, [pose, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const displayMessage =
    message ||
    (pose === 'empty'
      ? EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)]
      : null);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mascotContainer, animatedStyle]}>
        <SvgXml xml={ROCCO_SVGS[pose]} width={size} height={size} />
      </Animated.View>
      {displayMessage && (
        <Text
          style={[
            styles.message,
            { color: colors.textSecondary },
          ]}
        >
          {displayMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  mascotContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});
