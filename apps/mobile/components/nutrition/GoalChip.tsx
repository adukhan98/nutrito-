import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type DietGoal =
  | 'high_protein'
  | 'low_carb'
  | 'low_calorie'
  | 'high_fiber'
  | 'low_sodium';

interface GoalChipProps {
  goal: DietGoal;
  selected: boolean;
  onPress: () => void;
}

const GOAL_LABELS: Record<DietGoal, string> = {
  high_protein: 'High Protein',
  low_carb: 'Low Carb',
  low_calorie: 'Low Cal',
  high_fiber: 'High Fiber',
  low_sodium: 'Low Sodium',
};

const GOAL_ICONS: Record<DietGoal, string> = {
  high_protein: '💪',
  low_carb: '🥬',
  low_calorie: '🔥',
  high_fiber: '🌾',
  low_sodium: '🧂',
};

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function GoalChip({ goal, selected, onPress }: GoalChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(pressed.value ? 0.97 : 1, {
          duration: 120,
          easing: EASE_OUT,
        }),
      },
    ],
  }));

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = true;
      }}
      onPressOut={() => {
        pressed.value = false;
      }}
    >
      <Animated.View
        style={[
          styles.chip,
          animatedStyle,
          {
            backgroundColor: selected ? colors.accent : colors.surface,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={styles.icon}>{GOAL_ICONS[goal]}</Text>
        <Text
          style={[
            styles.label,
            { color: selected ? '#FFFFFF' : colors.text },
          ]}
        >
          {GOAL_LABELS[goal]}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
