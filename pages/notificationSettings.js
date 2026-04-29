import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettings() {
  const [chatAlert, setChatAlert] = useState(true);
  const [matchAlert, setMatchAlert] = useState(true);
  const [systemAlert, setSystemAlert] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <NotifRow
          icon="chatbubble-outline"
          label="채팅 알림"
          desc="새 메시지가 오면 알려드려요"
          value={chatAlert}
          onChange={setChatAlert}
        />
        <NotifRow
          icon="people-outline"
          label="매칭 알림"
          desc="새로운 방이 생기면 알려드려요"
          value={matchAlert}
          onChange={setMatchAlert}
        />
        <NotifRow
          icon="megaphone-outline"
          label="공지 알림"
          desc="서비스 공지사항을 받아요"
          value={systemAlert}
          onChange={setSystemAlert}
          last
        />
      </View>
    </ScrollView>
  );
}

function NotifRow({ icon, label, desc, value, onChange, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color="#ffaa00" />
        </View>
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowDesc}>{desc}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#eee', true: '#ffdd88' }}
        thumbColor={value ? '#ffaa00' : '#ccc'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff8e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { fontSize: 15, color: '#1a1a1a', fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 12, color: '#bbb' },
});
