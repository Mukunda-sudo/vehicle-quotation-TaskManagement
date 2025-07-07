import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler,
  StatusBar,
  ScrollView,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const [userName, setUserName] = useState('Fetching user...');
  const [userMobile, setUserMobile] = useState('');
  const [userAccess, setUserAccess] = useState('');
  const [dealershipName, setDealershipName] = useState('');
  const [dealershipAddress, setDealershipAddress] = useState('');
  const [rtgsDetails, setRtgsDetails] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec?userId=${userId}`
      );

      if (response.data?.success) {
        const name = response.data.name || '';
        setUserName(name);
        setUserMobile(response.data.mobile?.toString() || '');
        setUserAccess(response.data.access || '');
        setDealershipName(response.data.dealershipName || '');
        setDealershipAddress(response.data.dealershipAddress || '');
        setRtgsDetails(response.data.rtgsDetails || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const Card = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress}>
      <Icon name={icon} size={24} color="#fff" style={styles.cardIcon} />
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#e0c3fc', '#8ec5fc']} style={styles.container}>
      <StatusBar backgroundColor="#6a1b9a" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#6a1b9a', '#9c27b0']} style={styles.headerContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brandText}>
            {greeting()}, {userName} 👋
          </Text>
          <Text style={styles.subText}>Explore your dashboard</Text>
        </LinearGradient>

        <View style={styles.cardContainer}>
          <Card
            icon="tasks"
            label="Pending Tasks"
            color="#43a047"
            onPress={() => navigation.navigate('TaskSheetScreen', { userCode: userId })}
          />
          {userAccess === 'Digital Quotation' && (
            <Card
              icon="file-text"
              label="Quotation"
              color="#039be5"
              onPress={() =>
                navigation.navigate('DigitalQuotationScreen', {
                  userId,
                  userName,
                  userMobile,
                  dealershipName,
                  dealershipAddress,
                  rtgsDetails,
                })
              }
            />
          )}
          <Card
            icon="link"
            label="Google Forms"
            color="#5e35b1"
            onPress={() => navigation.navigate('FormLinksScreen')}
          />
          <Card icon="sign-out" label="Logout" color="#e53935" onPress={handleLogout} />
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>User ID: {userId}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },
  logo: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 10 },
  brandText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subText: { fontSize: 13, color: '#eee', marginTop: 3 },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    gap: 16,
  },
  card: {
    width: 130,
    height: 100,
    borderRadius: 18,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardIcon: { marginBottom: 5 },
  cardLabel: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  footerInfo: { marginTop: 60 },
  footerText: { fontSize: 10, color: '#333' },
});

export default HomeScreen;
