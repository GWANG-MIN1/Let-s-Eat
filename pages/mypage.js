import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUser, getAuth } from '../services/api';

export default function MyPage({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    if (!auth.userId) { setLoading(false); return; }
    getUser(auth.userId)
      .then(({ data }) => setUser(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#ffaa00" />
      </View>
    );
  }

  const mannerScore = user?.manner_score ?? 36.5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <Image source={require('../assets/icon.png')} style={styles.avatar} />
        <Text style={styles.nickname}>{user?.nickname ?? auth.nickname ?? '-'}</Text>
        {user?.university ? <Text style={styles.university}>{user.university}</Text> : null}
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>매너 점수</Text>
          <Text style={styles.scoreValue}>{mannerScore.toFixed(1)}°</Text>
        </View>
      </View>

      {/* 메뉴 카드 */}
      <View style={styles.menuCard}>
        <MenuRow
          icon="settings-outline"
          label="설정"
          onPress={() => navigation.navigate('SettingPage', {
            name: user?.nickname ?? '',
            email: user?.email ?? '',
            userId: auth.userId,
            onSaved: (updated) => setUser((prev) => ({ ...prev, ...updated })),
          })}
        />
        <MenuRow
          icon="chatbubbles-outline"
          label="참여중인 채팅방"
          onPress={() => navigation.navigate('ChatRoomList')}
        />
        <MenuRow
          icon="notifications-outline"
          label="알림 설정"
          onPress={() => navigation.navigate('NotificationSettings')}
          last
        />
      </View>
    </ScrollView>
  );
}

function MenuRow({ icon, label, onPress, last }) {
  return (
    <TouchableOpacity
      style={[rowStyle.row, !last && rowStyle.border]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={rowStyle.left}>
        <Ionicons name={icon} size={20} color="#ffaa00" style={{ marginRight: 12 }} />
        <Text style={rowStyle.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );
}

const rowStyle = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  left: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 15, color: '#1a1a1a' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16, paddingBottom: 40 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#fff8e7',
  },
  nickname: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  university: { fontSize: 14, color: '#888', marginBottom: 2 },
  email: { fontSize: 13, color: '#bbb', marginBottom: 16 },
  scoreBox: {
    backgroundColor: '#fff8e7',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  scoreLabel: { fontSize: 12, color: '#ffaa00', marginBottom: 2 },
  scoreValue: { fontSize: 26, fontWeight: 'bold', color: '#ffaa00' },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});
