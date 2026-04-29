import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateUser, clearAuth } from '../services/api';

export default function SettingPage({ route, navigation }) {
  const { name: initialName, email: initialEmail, userId, onSaved } = route.params;
  const [name, setName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('오류', '닉네임을 입력해주세요.'); return; }
    setLoading(true);
    try {
      const { data } = await updateUser(userId, { nickname: name, email });
      onSaved?.({ nickname: data.nickname, email: data.email });
      navigation.goBack();
    } catch (err) {
      Alert.alert('오류', err.response?.data?.error || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => { clearAuth(); navigation.navigate('Home'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* 프로필 수정 */}
      <Text style={styles.sectionTitle}>프로필 수정</Text>
      <View style={styles.card}>
        <Field label="닉네임">
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="닉네임" placeholderTextColor="#bbb" />
        </Field>
        <Field label="이메일" last>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>저장</Text>
            </>
        }
      </TouchableOpacity>

      {/* 기타 설정 */}
      <Text style={styles.sectionTitle}>기타</Text>
      <View style={styles.card}>
        <MenuRow icon="notifications-outline" label="알림 설정" onPress={() => navigation.navigate('NotificationSettings')} />
        <MenuRow icon="chatbubbles-outline" label="참여중인 채팅방" onPress={() => navigation.navigate('ChatRoomList')} last />
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color="#ff4444" />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children, last }) {
  return (
    <View style={{ marginBottom: last ? 0 : 14 }}>
      <Text style={fieldStyle.label}>{label}</Text>
      {children}
    </View>
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
        <Ionicons name={icon} size={18} color="#ffaa00" style={{ marginRight: 12 }} />
        <Text style={rowStyle.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );
}

const fieldStyle = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
});

const rowStyle = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  left: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 15, color: '#1a1a1a' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16, paddingBottom: 48 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#aaa', marginBottom: 10, marginTop: 8, letterSpacing: 0.5 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    height: 46,
    borderColor: '#eee',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    backgroundColor: '#ffaa00',
    borderRadius: 12,
    marginBottom: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff0f0',
    marginTop: 8,
  },
  logoutText: { color: '#ff4444', fontSize: 15, fontWeight: '600' },
});
