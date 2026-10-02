import { Image, StatusBar, StyleSheet, Text, View, ViewProps } from 'react-native';
import { useIsDark } from '../lib/theme';

type HeaderProps = ViewProps & { title: string; subtitle: string };

// A store banner behind the screen title. ImageBackground is deprecated in
// 0.87, so the image sits absolutely behind the content instead. Android
// draws edge-to-edge by default now, so the status bar needs no
// translucent/backgroundColor props (they were removed).
export function Header({ title, subtitle, style, ...rest }: HeaderProps) {
  const dark = useIsDark();
  return (
    <View {...rest} style={[styles.banner, style]}>
      <Image source={{ uri: 'https://picsum.photos/seed/store/1200/400' }} style={StyleSheet.absoluteFill} />
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, overflow: 'hidden' },
  title: { fontSize: 28, fontWeight: '700', color: 'white' },
  subtitle: { marginTop: 4, color: 'white', opacity: 0.85 },
});
