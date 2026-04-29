import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRooms } from '../services/api';

const SORT_OPTIONS = [
  { key: 'created_at', label: '최신순' },
  { key: 'meeting_time', label: '약속 시간' },
  { key: 'people_limit', label: '인원 수' },
  { key: 'location', label: '장소' },
  { key: 'menu_category', label: '메뉴' },
];

export default function Main({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState('created_at');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortCriteria)?.label ?? '최신순';

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRooms({ search: searchQuery || undefined, sortBy: sortCriteria });
      setRooms(data);
    } catch {
      Alert.alert('오류', '방 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortCriteria]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchRooms);
    return unsub;
  }, [navigation, fetchRooms]);

  useEffect(() => { fetchRooms(); }, [sortCriteria]);

  const RoomCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RoomDetail', { room: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.participant_count}/{item.people_limit}명</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Ionicons name="location-outline" size={14} color="#999" />
        <Text style={styles.cardInfo}>{item.location}</Text>
      </View>
      <View style={styles.cardRow}>
        <Ionicons name="restaurant-outline" size={14} color="#999" />
        <Text style={styles.cardInfo}>{item.menu_category} · {item.specific_menu}</Text>
      </View>
      <View style={styles.cardRow}>
        <Ionicons name="time-outline" size={14} color="#999" />
        <Text style={styles.cardInfo}>{item.meeting_time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ 밥 메이트 찾기</Text>
        <TouchableOpacity style={styles.mypageBtn} onPress={() => navigation.navigate('MyPage')}>
          <Ionicons name="person-outline" size={22} color="#ffaa00" />
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#bbb" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="방 이름 검색"
          placeholderTextColor="#bbb"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchRooms}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); }}>
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      {/* 정렬 + 방 만들기 */}
      <View style={styles.toolRow}>
        <TouchableOpacity style={styles.sortChip} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="funnel-outline" size={14} color="#ffaa00" />
          <Text style={styles.sortChipText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#ffaa00" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateRoom', { onRoomCreated: fetchRooms })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.createBtnText}>방 만들기</Text>
        </TouchableOpacity>
      </View>

      {/* 방 목록 */}
      {loading ? (
        <ActivityIndicator size="large" color="#ffaa00" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RoomCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🍜</Text>
              <Text style={styles.emptyTitle}>아직 방이 없어요</Text>
              <Text style={styles.emptyDesc}>첫 번째 방을 만들어보세요!</Text>
            </View>
          }
        />
      )}

      {/* 정렬 모달 */}
      <Modal transparent visible={sortModalVisible} animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>정렬 기준</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortOption, sortCriteria === opt.key && styles.sortOptionActive]}
                onPress={() => { setSortCriteria(opt.key); setSortModalVisible(false); }}
              >
                <Text style={[styles.sortOptionText, sortCriteria === opt.key && styles.sortOptionTextActive]}>
                  {opt.label}
                </Text>
                {sortCriteria === opt.key && <Ionicons name="checkmark" size={16} color="#ffaa00" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  mypageBtn: { padding: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#eee',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ffaa00',
    backgroundColor: '#fff8e7',
  },
  sortChipText: { fontSize: 13, color: '#ffaa00', fontWeight: '600', marginHorizontal: 2 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffaa00',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  createBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
  badge: {
    backgroundColor: '#fff8e7',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  badgeText: { fontSize: 12, color: '#ffaa00', fontWeight: '600' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  cardInfo: { fontSize: 13, color: '#777' },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#aaa' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  sortModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 240,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sortModalTitle: { fontSize: 14, fontWeight: 'bold', color: '#aaa', paddingHorizontal: 20, paddingVertical: 10 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20 },
  sortOptionActive: { backgroundColor: '#fff8e7' },
  sortOptionText: { fontSize: 15, color: '#333' },
  sortOptionTextActive: { color: '#ffaa00', fontWeight: 'bold' },
});
