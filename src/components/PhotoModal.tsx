import { Image, Modal, Pressable, StyleSheet } from 'react-native';

type Props = { uri: string | null; onClose: () => void };

// Full-screen photo evidence.
export function PhotoModal({ uri, onClose }: Props) {
  return (
    <Modal visible={uri !== null} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {uri && <Image source={{ uri }} style={styles.photo} resizeMode="contain" />}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' },
  photo: { width: '100%', height: '70%' },
});
