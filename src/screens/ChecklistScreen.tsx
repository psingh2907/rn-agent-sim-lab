import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Header } from '../components/Header';
import { PhotoModal } from '../components/PhotoModal';
import { QuestionRow } from '../components/QuestionRow';
import { checklist, type ChecklistItem } from '../lib/data';

export function ChecklistScreen() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const notes = useRef<TextInputInstance>(null);

  // Load the list once the JS thread is idle.
  useEffect(() => {
    const handle = requestIdleCallback(() => setItems(checklist));
    return () => cancelIdleCallback(handle);
  }, []);

  const answer = (id: string, value: 'yes' | 'no') =>
    setItems(prev => prev.map(i => (i.id === id && i.kind === 'question' ? { ...i, answer: value } : i)));

  const answered = items.filter(i => i.kind === 'question' && i.answer).length;
  const total = checklist.filter(i => i.kind === 'question').length;

  return (
    <View style={styles.screen}>
      <Header title="Store audit" subtitle={`${answered} of ${total} answered`} />
      <FlashList
        data={items}
        keyExtractor={item => item.id}
        getItemType={item => item.kind}
        renderItem={({ item }) => {
          if (item.kind === 'header') return <Text style={styles.section}>{item.title}</Text>;
          if (item.kind === 'photo')
            return (
              <Pressable onPress={() => setPhoto(item.uri)} style={styles.photo}>
                <Text>{item.title} (tap to view)</Text>
              </Pressable>
            );
          return <QuestionRow item={item} onAnswer={answer} />;
        }}
        ListFooterComponent={
          <ScrollView keyboardShouldPersistTaps="always" style={styles.footer}>
            <TextInput
              ref={notes}
              testID="notes"
              placeholder="Notes for the store manager"
              style={styles.input}
              multiline
            />
            <Pressable onPress={() => notes.current?.blur()} style={styles.done}>
              <Text>Done</Text>
            </Pressable>
          </ScrollView>
        }
      />
      <PhotoModal uri={photo} onClose={() => setPhoto(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  section: { padding: 16, fontWeight: '700', backgroundColor: '#eee' },
  photo: { padding: 16 },
  footer: { padding: 16 },
  input: { minHeight: 80, borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8 },
  done: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
});
