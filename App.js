import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "./global.css";
import ArtworkPage from './components/ArtworkPage';

const Stack = createNativeStackNavigator();

function SearchScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-10 gap-6">
        <Text className="text-3xl font-bold text-gray-900">Search</Text>
        <Text className="text-gray-600">This is a placeholder search screen. Tap below to view an artwork page.</Text>

        <TouchableOpacity
          className="bg-indigo-600 rounded-lg px-5 py-3 self-start"
          onPress={() =>
            navigation.navigate('Artwork', {
              imageURL:
                'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=80&auto=format&fit=crop',
              title: 'Starry Night',
              description:
                'A swirling night sky over a quiet town, rendered in bold, expressive brush strokes.',
              department: 'European Paintings',
            })
          }
        >
          <Text className="text-white font-semibold">Open Artwork</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Artwork" component={ArtworkPage} options={{ title: 'Artwork' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
