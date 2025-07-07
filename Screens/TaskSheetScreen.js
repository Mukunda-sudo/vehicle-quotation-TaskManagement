import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet,
  Linking, ActivityIndicator, Dimensions, TextInput, KeyboardAvoidingView,
  Platform, Keyboard, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import { debounce } from 'lodash';

const TaskSheetScreen = ({ route, navigation }) => {
  const { userCode } = route.params;
  const [sheetList, setSheetList] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchSheets();
  }, [userCode]);

  const fetchSheets = async () => {
    try {
      const res = await axios.post(
        'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
        { action: 'fetchSheetList', userId: userCode }
      );
      if (res.data.success) setSheetList(res.data.sheets);
    } catch (err) {
      console.error('Failed to fetch sheet list:', err);
    }
  };

  const fetchSheetData = async (sheet) => {
    setLoading(true);
    setSelectedSheet(sheet.sheetName);
    setTaskData([]);
    setSearchText('');
    setShowSearchBar(false);
    try {
      const res = await axios.post(
        'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
        { action: 'fetchTasks', userId: userCode, sheetName: sheet.sheetName }
      );
      setTaskData(res.data.success ? res.data.tasks : []);
    } catch (err) {
      console.error('Error fetching sheet data:', err);
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    if (selectedSheet) {
      fetchSheetData({ sheetName: selectedSheet });
    } else {
      fetchSheets();
    }
  };

  const onPullToRefresh = useCallback(() => {
    setRefreshing(true);
    handleRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [selectedSheet]);

  const debouncedSearch = useCallback(debounce((text) => {
    setSearchText(text);
  }, 300), []);

  const filteredSheets = sheetList.filter((sheet) =>
    (sheet.mainSheetName || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredTasks = taskData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const renderValue = (value, idx) => {
    const isLink = typeof value === 'string' && value.startsWith('https://docs.google.com/forms/');
    return isLink ? (
      <Text key={idx} style={styles.link} onPress={() => Linking.openURL(value)}>
        Click Here
      </Text>
    ) : (
      <Text key={idx} style={styles.dataText}>{value}</Text>
    );
  };

  const TaskCard = memo(({ row }) => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.taskCard}>
      {Object.values(row).map(renderValue)}
    </Animatable.View>
  ));

  const SheetButton = memo(({ sheet, index }) => (
    <Animatable.View key={index} animation="fadeInUp" delay={index * 100} duration={600}>
      <TouchableOpacity style={styles.sheetButton} onPress={() => fetchSheetData(sheet)}>
        <Text style={styles.sheetButtonText}>{sheet.mainSheetName}</Text>
      </TouchableOpacity>
    </Animatable.View>
  ));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButtonLeft} onPress={() => {
          if (selectedSheet) {
            Keyboard.dismiss();
            setSearchText('');
            setShowSearchBar(false);
            setTimeout(() => { setSelectedSheet(null); setTaskData([]); }, 100);
          } else {
            navigation.goBack();
          }
        }}>
          <Icon name="arrow-back-ios" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>All FMS Pending Task</Text>
        <TouchableOpacity style={styles.iconButtonRight} onPress={() => {
          if (showSearchBar) {
            setShowSearchBar(false);
            setSearchText('');
            Keyboard.dismiss();
          } else setShowSearchBar(true);
        }}>
          <Icon name={showSearchBar ? 'close' : 'search'} size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {selectedSheet && (
        <Animatable.View animation="fadeInDown" duration={500} style={styles.sheetNameContainer}>
          <Text style={styles.sheetName}>{selectedSheet}</Text>
        </Animatable.View>
      )}

      {showSearchBar && (
        <Animatable.View animation="fadeIn" delay={200} duration={500} style={styles.searchBarWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder={selectedSheet ? 'Search your task...' : 'Search sheet...'}
            placeholderTextColor="#777"
            onChangeText={debouncedSearch}
            autoFocus
          />
        </Animatable.View>
      )}

      <StatusBar backgroundColor="#1565c0" barStyle="light-content" />

      {selectedSheet ? (
        loading ? (
          <ActivityIndicator size="large" color="#00bcd4" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => <TaskCard row={item} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} />}
            ListEmptyComponent={<Text style={styles.noTaskText}>No Task found.</Text>}
          />
        )
      ) : (
        <FlatList
          data={filteredSheets}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => <SheetButton sheet={item} index={index} />}
          contentContainerStyle={styles.sheetList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} />}
          ListEmptyComponent={
            <Text style={styles.noTaskText}>
              {sheetList.length === 0 ? 'No task assigned. Kindly contact Admin.' : 'No matching sheet found.'}
            </Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
 
  screen: { flex: 1, backgroundColor: '#e3f2fd' },
  headerContainer: {
    backgroundColor: '#1565c0', paddingVertical: 18, paddingHorizontal: 18,
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 8, position: 'relative'
  },
  header: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  iconButtonLeft: { position: 'absolute', left: 12, padding: 6 },
  iconButtonRight: { position: 'absolute', right: 12, padding: 6 },
  sheetNameContainer: {
    backgroundColor: '#bbdefb', paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 10, marginTop: 12, marginHorizontal: 16, borderLeftWidth: 4, borderLeftColor: '#1e88e5'
  },
  sheetName: { fontSize: 17, fontWeight: '600', color: '#0d47a1', textAlign: 'center' },
  searchBarWrapper: { paddingHorizontal: 16, marginTop: 10 },
  searchInput: {
    width: '100%', height: 44, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, borderColor: '#90caf9', borderWidth: 1.2, fontSize: 15, color: '#000', elevation: 2
  },
  sheetList: { padding: 16, flexGrow: 1 },
  sheetButton: {
    backgroundColor: '#1976d2', borderColor: '#64b5f6', borderWidth: 1.5,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, margin: 6, elevation: 3
  },
  sheetButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  taskCard: {
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    marginBottom: 14, width: '100%', shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 6, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#42a5f5'
  },
  dataText: { fontSize: 15, color: '#263238', marginBottom: 6 },
  link: { fontSize: 15, color: '#2196f3', textDecorationLine: 'underline', marginBottom: 6 },
  noTaskText: { marginTop: 36, fontSize: 16, fontWeight: '500', color: '#444', textAlign: 'center' },
});

export default TaskSheetScreen;
