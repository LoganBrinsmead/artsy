import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArtworkPage from './components/ArtworkPage';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Showcase from './components/Showcase';
import Discover from './components/Discover';
import Favorites from './components/Favorites';
import Profile from './components/Profile';
import GalleryView from './components/GalleryView';
import Search from './components/Search';
import { UserProvider } from './context/UserContext';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import "./global.css";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [tab, setTab] = useState('Showcase');
  const { isDark } = useThemeMode();

  const renderTab = () => {
    switch (tab) {
      case 'Showcase':
        return <Showcase navigation={navigation} />;
      case 'Search':
        return <Search navigation={navigation} />;
      case 'Discover':
        return <Discover navigation={navigation} />;
      case 'Favorites':
        return <Favorites navigation={navigation} />;
      case 'Profile':
        return <Profile navigation={navigation} />;
      default:
        return <Showcase navigation={navigation} />;
    }
  };

  const TabButton = ({ label }) => (
    <Pressable onPress={() => setTab(label)} style={{ flex: 1, paddingVertical: 10 }}>
      <Text className={`text-center ${tab === label ? (isDark ? 'text-white font-bold' : 'text-black font-bold') : (isDark ? 'text-gray-300' : 'text-gray-500')}`}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className="flex-1">
        {renderTab()}
      </View>
      <View className={`${isDark ? 'border-gray-700 bg-black' : 'border-gray-200 bg-white'} border-t`}>
        <View className="flex-row">
          <TabButton label="Showcase" />
          <TabButton label="Search" />
          <TabButton label="Discover" />
          <TabButton label="Favorites" />
          <TabButton label="Profile" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function AppInner() {
  const { isDark } = useThemeMode();

  const theme = isDark
    ? { ...MD3DarkTheme }
    : { ...MD3LightTheme };

  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Artwork" component={ArtworkPage} options={{ title: 'Artwork' }} />
              <Stack.Screen name="Gallery" component={GalleryView} options={{ title: 'Gallery' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </PaperProvider>
    </UserProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
