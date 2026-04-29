import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { joinRoom, getAuth } from '../services/api';

export default function RoomDetail({ route, navigation }) {
  const { room } = route.params;
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const menu = [room.menu_category, room.specific_menu || room.menu].filter(Boolean).join(' · ');

  const handleJoin = async () => {
    setLoading(true);
    try {
      await joinRoom(room.id);
      Alert.alert('참여 완료! 🎉', '방에 참여했습니다.', [
        { text: '채팅 입장', onPress: () => navigation.navigate('ChatRoom', { roomName: room.name, roomId: room.id }) },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || '참여에 실패했습니다.';
      if (msg === '이미 참여 중입니다.') {
        navigation.navigate('ChatRoom', { roomName: room.name, roomId: room.id });
      } else {
        Alert.alert('오류', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* 방 제목 카드 */}
        <View style={styles.titleCard}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {room.participant_count ?? '-'}/{room.people_limit ?? '-'}명
            </Text>
          </View>
        </View>

        {/* 정보 카드 */}
        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="방장" value={room.host_nickname || '-'} />
          <InfoRow icon="location-outline" label="장소" value={room.location} />
          <InfoRow icon="restaurant-outline" label="메뉴" value={menu || '-'} />
          <InfoRow icon="time-outline" label="약속 시간" value={room.meeting_time} last />
        </View>

        {/* 생성 시간 */}
        <Text style={styles.createdAt}>개설: {room.created_at?.slice(0, 16).replace('T', ' ') ?? ''}</Text>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.joinBtn, loading && { opacity: 0.6 }]} onPress={handleJoin} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                <Text style={styles.joinBtnText}>참여 / 채팅 입장</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[rowStyle.row, !last && rowStyle.border]}>
      <View style={rowStyle.left}>
        <Ionicons name={icon} size={16} color="#ffaa00" style={{ marginRight: 8 }} />
        <Text style={rowStyle.label}>{label}</Text>
      </View>
      <Text style={rowStyle.value}>{value}</Text>
    </View>
  );
}

const rowStyle = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  left: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 14, color: '#888', fontWeight: '500' },
  value: { fontSize: 14, color: '#1a1a1a', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16, paddingBottom: 24 },
  titleCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  roomName: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
  badge: {
    backgroundColor: '#fff8e7',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  badgeText: { fontSize: 13, color: '#ffaa00', fontWeight: '700' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  createdAt: { fontSize: 12, color: '#bbb', textAlign: 'center' },
  footer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  joinBtn: {
    height: 52,
    backgroundColor: '#ffaa00',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
