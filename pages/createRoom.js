import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Platform, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { createRoom } from '../services/api';

const MENU_CATEGORIES = ['한식', '일식', '중식', '양식', '분식', '기타'];

export default function CreateRoom({ route, navigation }) {
  const { onRoomCreated } = route.params || {};
  const [roomName, setRoomName] = useState('');
  const [people, setPeople] = useState(2);
  const [location, setLocation] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [specificMenu, setSpecificMenu] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) { Alert.alert('알림', '방 제목을 입력해주세요.'); return; }
    if (!location.trim()) { Alert.alert('알림', '장소를 입력해주세요.'); return; }
    if (!specificMenu.trim()) { Alert.alert('알림', '메뉴를 입력해주세요.'); return; }
    if (!meetingTime.trim()) { Alert.alert('알림', '약속 시간을 입력해주세요.'); return; }

    setLoading(true);
    try {
      await createRoom({ name: roomName, peopleLimit: people, location, menuCategory, specificMenu, meetingTime });
      onRoomCreated?.();
      navigation.navigate('Main');
    } catch (err) {
      Alert.alert('오류', err.response?.data?.error || '방 만들기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Label>방 제목</Label>
          <TextInput
            style={styles.input}
            value={roomName}
            onChangeText={setRoomName}
            placeholder="어떤 모임인지 알려주세요"
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.section}>
          <Label>인원</Label>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderValue}>{people}명</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={10}
            step={1}
            value={people}
            onValueChange={(v) => setPeople(Math.floor(v))}
            minimumTrackTintColor="#ffaa00"
            maximumTrackTintColor="#eee"
            thumbTintColor="#ffaa00"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>2명</Text>
            <Text style={styles.sliderLabel}>10명</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Label>장소</Label>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="만날 장소를 입력하세요"
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.section}>
          <Label>메뉴</Label>
          <TouchableOpacity style={styles.picker} onPress={() => setMenuModalVisible(true)} activeOpacity={0.7}>
            <Text style={menuCategory ? styles.pickerSelected : styles.pickerPlaceholder}>
              {menuCategory || '종류 선택'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#bbb" />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={specificMenu}
            onChangeText={setSpecificMenu}
            placeholder={menuCategory ? `구체적인 ${menuCategory} 메뉴` : '구체적인 메뉴'}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.section}>
          <Label>약속 시간</Label>
          <TextInput
            style={styles.input}
            value={meetingTime}
            onChangeText={setMeetingTime}
            placeholder="예: 오늘 오후 12시 30분"
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.createBtnText}>방 만들기 완료</Text>}
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuModalVisible} animationType="slide" onRequestClose={() => setMenuModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuModalVisible(false)}>
          <View style={styles.menuModal}>
            <Text style={styles.menuModalTitle}>메뉴 종류 선택</Text>
            {MENU_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.menuOption, menuCategory === cat && styles.menuOptionActive]}
                onPress={() => { setMenuCategory(cat); setMenuModalVisible(false); }}
              >
                <Text style={[styles.menuOptionText, menuCategory === cat && styles.menuOptionTextActive]}>{cat}</Text>
                {menuCategory === cat && <Ionicons name="checkmark" size={16} color="#ffaa00" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Label({ children }) {
  return <Text style={labelStyle}>{children}</Text>;
}
const labelStyle = { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16, paddingBottom: 24 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
  sliderRow: { alignItems: 'center', marginBottom: 4 },
  sliderValue: { fontSize: 22, fontWeight: 'bold', color: '#ffaa00' },
  slider: { width: '100%', height: 36 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, color: '#bbb' },
  picker: {
    height: 46,
    borderColor: '#eee',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerSelected: { fontSize: 15, color: '#1a1a1a' },
  pickerPlaceholder: { fontSize: 15, color: '#bbb' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createBtn: {
    height: 52,
    backgroundColor: '#ffaa00',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  menuModalTitle: { fontSize: 14, fontWeight: 'bold', color: '#aaa', paddingHorizontal: 24, paddingVertical: 12 },
  menuOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 24 },
  menuOptionActive: { backgroundColor: '#fff8e7' },
  menuOptionText: { fontSize: 16, color: '#333' },
  menuOptionTextActive: { color: '#ffaa00', fontWeight: 'bold' },
});
