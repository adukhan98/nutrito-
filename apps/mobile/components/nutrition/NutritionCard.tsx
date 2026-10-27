import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Confidence = 'official' | 'high' | 'medium' | 'low';

interface NutritionData {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  kcal_low?: number;
  kcal_high?: number;
  confidence: Confidence;
  method?: string;
}

interface NutritionCardProps {
  nutrition: NutritionData;
  servingDesc: string;
  menuSourceUrl?: string;
  onSourcePress?: () => void;
}

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function NutritionCard({
  nutrition,
  servingDesc,
  onSourcePress,
}: NutritionCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showDetails, setShowDetails] = useState(false);

  const isEstimate = nutrition.confidence !== 'official';

  const confidenceColor = {
    official: colors.confidenceOfficial,
    high: colors.confidenceHigh,
    medium: colors.confidenceMedium,
    low: colors.confidenceLow,
  }[nutrition.confidence];

  const confidenceLabel = {
    official: 'Official',
    high: 'High confidence',
    medium: 'Estimate',
    low: 'Low confidence',
  }[nutrition.confidence];

  const detailsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showDetails ? 1 : 0, {
      duration: 200,
      easing: EASE_OUT,
    }),
    maxHeight: withTiming(showDetails ? 200 : 0, {
      duration: 250,
      easing: EASE_OUT,
    }),
  }));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Estimate badge */}
      {isEstimate && (
        <Pressable
          onPress={() => setShowDetails(!showDetails)}
          style={[styles.badge, { backgroundColor: confidenceColor + '20' }]}
        >
          <View
            style={[styles.badgeDot, { backgroundColor: confidenceColor }]}
          />
          <Text style={[styles.badgeText, { color: confidenceColor }]}>
            {confidenceLabel}
          </Text>
          <Text style={[styles.badgeIcon, { color: confidenceColor }]}>
            {showDetails ? '▲' : '▼'}
          </Text>
        </Pressable>
      )}

      {/* Main calories display */}
      <View style={styles.caloriesRow}>
        <Text style={[styles.caloriesValue, { color: colors.text }]}>
          {nutrition.kcal}
        </Text>
        <View style={styles.caloriesLabel}>
          <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>
            kcal
          </Text>
          {nutrition.kcal_low && nutrition.kcal_high && isEstimate && (
            <Text style={[styles.range, { color: colors.textSecondary }]}>
              {nutrition.kcal_low}–{nutrition.kcal_high}
            </Text>
          )}
        </View>
      </View>

      {/* Serving size */}
      <Text style={[styles.serving, { color: colors.textSecondary }]}>
        {servingDesc}
      </Text>

      {/* Macros grid */}
      <View style={styles.macrosGrid}>
        <MacroItem
          label="Protein"
          value={nutrition.protein_g}
          unit="g"
          colors={colors}
        />
        <MacroItem
          label="Carbs"
          value={nutrition.carbs_g}
          unit="g"
          colors={colors}
        />
        <MacroItem
          label="Fat"
          value={nutrition.fat_g}
          unit="g"
          colors={colors}
        />
        <MacroItem
          label="Fiber"
          value={nutrition.fiber_g}
          unit="g"
          colors={colors}
        />
        <MacroItem
          label="Sodium"
          value={nutrition.sodium_mg}
          unit="mg"
          colors={colors}
        />
      </View>

      {/* Expandable details */}
      <Animated.View style={[styles.details, detailsStyle]}>
        <View
          style={[styles.detailsDivider, { backgroundColor: colors.border }]}
        />
        <Text style={[styles.detailsTitle, { color: colors.textSecondary }]}>
          How was this calculated?
        </Text>
        <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
          {nutrition.method === 'ingredient_sum'
            ? 'Nutrition estimated from ingredient breakdown using USDA FoodData Central values.'
            : 'Nutrition data from restaurant-published information.'}
        </Text>
        {onSourcePress && (
          <Pressable onPress={onSourcePress} style={styles.sourceLink}>
            <Text style={[styles.sourceLinkText, { color: colors.primary }]}>
              View source →
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

interface MacroItemProps {
  label: string;
  value: number;
  unit: string;
  colors: (typeof Colors)['light'];
}

function MacroItem({ label, value, unit, colors }: MacroItemProps) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color: colors.text }]}>
        {value}
        <Text style={[styles.macroUnit, { color: colors.textSecondary }]}>
          {unit}
        </Text>
      </Text>
      <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#193857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  badgeIcon: {
    fontSize: 10,
    marginLeft: 4,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Georgia',
    letterSpacing: -1,
  },
  caloriesLabel: {
    marginLeft: 8,
  },
  caloriesUnit: {
    fontSize: 18,
    fontWeight: '500',
  },
  range: {
    fontSize: 13,
    marginTop: 2,
  },
  serving: {
    fontSize: 14,
    marginBottom: 20,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  macroItem: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  macroUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  macroLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  details: {
    overflow: 'hidden',
  },
  detailsDivider: {
    height: 1,
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sourceLink: {
    marginTop: 8,
  },
  sourceLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
