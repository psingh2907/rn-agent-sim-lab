import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChecklistItem } from '../lib/data';

type Question = Extract<ChecklistItem, { kind: 'question' }>;

type Props = {
  item: Question;
  onAnswer: (id: string, value: 'yes' | 'no') => void;
};

export function QuestionRow({ item, onAnswer }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.question}>{item.title}</Text>
      {(['yes', 'no'] as const).map(v => (
        <Pressable
          key={v}
          accessibilityRole="button"
          accessibilityLabel={`${v} for ${item.title}`}
          accessibilityState={{ selected: item.answer === v }}
          onPress={() => onAnswer(item.id, v)}
          style={[styles.pill, item.answer === v && styles.pillOn]}
        >
          <Text>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  question: { flex: 1 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillOn: { backgroundColor: '#cde' },
});
