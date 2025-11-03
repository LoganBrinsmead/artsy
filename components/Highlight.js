import { View, Text, ScrollView } from 'react-native';

export default function Highlight() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-black mb-2">Highlight</Text>
      <Text className="text-black">Curated highlights will appear here.</Text>
    </ScrollView>
  );
}
