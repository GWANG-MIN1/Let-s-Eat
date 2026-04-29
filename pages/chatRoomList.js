import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRoomList({ navigation }) {
  const chatRooms = [
    { id: 1, name: '점심 같이 먹어요', lastMessage: '내일 12시에 봐요!', time: '방금' },
    { id: 2, name: '저녁 같이 드실 분', lastMessage: '참여 완료했습니다', time: '1시간 전' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ChatRoom', { roomName: item.name, roomId: item.id })}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#ffaa00" />
            </View>
            <View style={styles.info}>
              <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>참여 중인 채팅방이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff8e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 3 },
  lastMessage: { fontSize: 13, color: '#aaa' },
  time: { fontSize: 12, color: '#ccc', marginLeft: 8 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#aaa' },
});
