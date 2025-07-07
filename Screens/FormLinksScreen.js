import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator,
  Alert, StyleSheet, SafeAreaView, StatusBar, TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

const FormLinksScreen = ({ navigation }) => {
  const [formLinks, setFormLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchBarVisible, setSearchBarVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          'https://script.google.com/macros/s/AKfycbycu4lI00MtLbbvdS-WB8tsb5fh5VxTQx7WpK8T5qzSSnLjT1FMvVlPOZU18meizjdRcA/exec?action=getFormLinks'
        );
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success) {
          setFormLinks(data.forms);
          setFilteredLinks(data.forms);
        } else {
          console.error('Server error:', data.message);
        }
      } catch (err) {
        console.error('Error fetching form links:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenLink = useCallback((name, url) => {
    Alert.alert(name, 'Click "Open" to visit this form.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(url) },
    ]);
  }, []);

  const getIconName = (name) => {
    const n = name.toLowerCase();
    if (n.includes('registration')) return 'form-textbox';
    if (n.includes('feedback')) return 'comment-text-outline';
    if (n.includes('report')) return 'file-chart-outline';
    if (n.includes('survey')) return 'clipboard-list-outline';
    if (n.includes('application')) return 'file-document-outline';
    return 'file-outline';
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = formLinks.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredLinks(filtered);
  };

  const handleClearSearch = () => {
    setSearch('');
    setFilteredLinks(formLinks);
    setSearchBarVisible(false);
    setTimeout(() => {
      setShowSearchBar(false);
      setSearchBarVisible(true);
    }, 300);
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={500}
      style={styles.card}
    >
      <View style={styles.iconTextRow}>
        <Icon name={getIconName(item.name)} size={24} color="#1976d2" style={{ marginRight: 10 }} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handleOpenLink(item.name, item.link)}>
        <Text style={styles.buttonText}>Apply</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1976d2" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconContainer}>
          <MaterialIcon name="arrow-back-ios" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Links</Text>
        <TouchableOpacity style={styles.toggleIcon} onPress={() => setShowSearchBar(true)}>
          <MaterialIcon name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {showSearchBar && (
        <Animatable.View
          animation={searchBarVisible ? 'slideInDown' : 'slideOutUp'}
          duration={300}
          style={styles.searchBarContainer}
        >
          <MaterialIcon name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search forms..."
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
            placeholderTextColor="#888"
            autoFocus
          />
          {search !== '' && (
            <TouchableOpacity onPress={handleClearSearch}>
              <MaterialIcon name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </Animatable.View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          data={filteredLinks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    justifyContent: 'center',
    position: 'relative',
  },
  backIconContainer: {
    position: 'absolute',
    left: 16,
    padding: 6,
  },
  toggleIcon: {
    position: 'absolute',
    right: 16,
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FormLinksScreen;
