import { View, Text, ScrollView } from 'react-native';

export default function Favorites() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-black mb-2">Favorites</Text>
      <Text className="text-black">Your saved artworks will show up here.</Text>
    </ScrollView>
  );
}
