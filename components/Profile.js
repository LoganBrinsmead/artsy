import { View, Text, ScrollView } from 'react-native';

export default function Profile() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-black mb-2">Profile</Text>
      <Text className="text-black">Manage your profile and settings.</Text>
    </ScrollView>
  );
}
