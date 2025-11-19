import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArtworkPage from './components/ArtworkPage';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Showcase from './components/Showcase';
import Discover from './components/Discover';
import Favorites from './components/Favorites';
import Profile from './components/Profile';
import GalleryView from './components/GalleryView';
import Search from './components/Search';
import { UserProvider } from './context/UserContext';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';
import "./global.css";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [tab, setTab] = useState('Showcase');
  const theme = useTheme();

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
      <Text style={{
        textAlign: 'center',
        color: tab === label ? theme.colors.onBackground : theme.colors.onSurfaceVariant,
        fontWeight: tab === label ? 'bold' : 'normal',
      }}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        {renderTab()}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.outline, backgroundColor: theme.colors.background }}>
        <View style={{ flexDirection: 'row' }}>
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
  const { theme, isDark } = useAppTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTintColor: theme.colors.onBackground,
    headerTitleStyle: {
      color: theme.colors.onBackground,
    },
  };

  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
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
