import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        GUARD <Text style={styles.accent}>OPS</Text>
      </Text>
      <Text style={styles.subtitle}>Mobile scaffold ready — screens land in Prompt 9.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e2530",
    paddingHorizontal: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  accent: {
    color: "#e53e3e",
  },
  subtitle: {
    marginTop: 12,
    color: "#cbd2dc",
    textAlign: "center",
    fontSize: 14,
  },
});
