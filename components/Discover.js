import { View, Text, ScrollView } from 'react-native';

export default function Discover() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-black mb-2">Discover</Text>
      <Text className="text-black">Explore new collections and artists here.</Text>
    </ScrollView>
  );
}
