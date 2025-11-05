import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openDatabase } from '../database/db';
import { getUserById, createUser, getUserByUsername, updateUser } from '../database/services';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  async function initializeUser() {
    try {
      // Initialize database
      await openDatabase();

      // Check if user ID is stored
      const storedUserId = await AsyncStorage.getItem('userId');
      
      if (storedUserId) {
        const userData = await getUserById(parseInt(storedUserId));
        if (userData) {
          setUser(userData);
        } else {
          // User ID stored but user doesn't exist, clear it
          await AsyncStorage.removeItem('userId');
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(username) {
    try {
      let userData = await getUserByUsername(username);
      
      if (!userData) {
        // Create new user if doesn't exist
        const userId = await createUser(username);
        userData = await getUserById(userId);
      }

      // Store user ID
      await AsyncStorage.setItem('userId', userData.id.toString());
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem('userId');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async function updateUserProfile(updates) {
    try {
      await updateUser(user.id, updates);
      const updatedUser = await getUserById(user.id);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    isLoggedIn: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
