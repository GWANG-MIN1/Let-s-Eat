import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, WS_URL, getRoomMessages } from '../services/api';

export default function ChatRoom({ route, navigation }) {
  const { roomName, roomId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const flatListRef = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    if (!roomId) return;
    getRoomMessages(roomId)
      .then(({ data }) => setMessages(data.map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.nickname,
        userId: m.user_id,
        timestamp: m.created_at,
      }))))
      .catch(() => {});
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !auth.token) return;
    const ws = new WebSocket(`${WS_URL}?token=${auth.token}&roomId=${roomId}`);
    ws.onmessage = (e) => setMessages((prev) => [...prev, JSON.parse(e.data)]);
    ws.onerror = () => Alert.alert('연결 오류', '채팅 서버에 연결할 수 없습니다.');
    setSocket(ws);
    return () => ws.close();
  }, [roomId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setSettingsVisible(true)} style={{ marginRight: 16 }}>
          <Ionicons name="people-outline" size={22} color="#ffaa00" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const sendMessage = () => {
    if (!message.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ text: message }));
    setMessage('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const isMe = (item) => item.userId === auth.userId;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, i) => item.id?.toString() ?? i.toString()}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.msgWrap, isMe(item) ? styles.msgWrapMe : styles.msgWrapOther]}>
            {!isMe(item) && <Text style={styles.senderName}>{item.sender}</Text>}
            <View style={[styles.bubble, isMe(item) ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, isMe(item) && styles.bubbleTextMe]}>{item.text}</Text>
            </View>
            <Text style={[styles.timestamp, isMe(item) && { textAlign: 'right' }]}>
              {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>첫 메시지를 보내보세요! 👋</Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#bbb"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={settingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{roomName}</Text>
            <TouchableOpacity
              style={styles.leaveBtn}
              onPress={() => { setSettingsVisible(false); navigation.goBack(); }}
            >
              <Ionicons name="exit-outline" size={18} color="#ff4444" />
              <Text style={styles.leaveBtnText}>방 나가기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeBtnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  messageList: { padding: 16, paddingBottom: 8 },
  msgWrap: { marginBottom: 12 },
  msgWrapMe: { alignItems: 'flex-end' },
  msgWrapOther: { alignItems: 'flex-start' },
  senderName: { fontSize: 12, color: '#aaa', marginBottom: 3, marginLeft: 4 },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: '#ffaa00',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, color: '#1a1a1a', lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  timestamp: { fontSize: 11, color: '#ccc', marginTop: 3, marginHorizontal: 4 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyChatText: { color: '#bbb', fontSize: 14 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#f4f4f4',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a1a',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffaa00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ddd' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#eee', borderRadius: 2, marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 24 },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'center',
  },
  leaveBtnText: { color: '#ff4444', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { width: '100%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#f4f4f4' },
  closeBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
});
