import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens (à créer)
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Invoices') {
            iconName = 'file-document';
          } else if (route.name === 'Payments') {
            iconName = 'cash';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#999',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tableau de bord' }} />
      <Tab.Screen name="Invoices" component={DashboardScreen} options={{ title: 'Factures' }} />
      <Tab.Screen name="Payments" component={DashboardScreen} options={{ title: 'Paiements' }} />
      <Tab.Screen name="Profile" component={DashboardScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  // TODO: Vérifier si l'utilisateur est connecté
  const isLoggedIn = false;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
