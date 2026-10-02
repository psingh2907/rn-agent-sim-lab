import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChecklistItem } from '../lib/data';
import { riskLevel } from '../lib/risk';

type Question = Extract<ChecklistItem, { kind: 'question' }>;

type Props = {
  item: Question;
  onAnswer: (id: string, value: 'yes' | 'no') => void;
};

export function QuestionRow({ item, onAnswer }: Props) {
  // Local copy so the pill highlights instantly, before the list re-renders.
  const [answer, setAnswer] = useState(item.answer);
  const risk = riskLevel(item.title);

  return (
    <View style={styles.row}>
      {risk === 'high' && <Text style={styles.risk}>!</Text>}
      <Text style={styles.question}>{item.title}</Text>
      {(['yes', 'no'] as const).map(v => (
        <Pressable
          key={v}
          accessibilityRole="button"
          accessibilityLabel={`${v} for ${item.title}`}
          accessibilityState={{ selected: answer === v }}
          onPress={() => {
            setAnswer(v);
            onAnswer(item.id, v);
          }}
          style={[styles.pill, answer === v && styles.pillOn]}
        >
          <Text>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  risk: { color: '#c00', fontWeight: '700' },
  question: { fontSize: 15 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillOn: { backgroundColor: '#cde' },
});
