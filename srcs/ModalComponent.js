import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import UNIVERSITIES from './universities';

const ModalComponent = ({ modalVisible, setModalVisible, onSelectUniversity }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return UNIVERSITIES;
    return UNIVERSITIES.filter((name) => name.includes(q));
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>대학교를 선택하세요</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="대학교 검색"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  onSelectUniversity(item);
                  handleClose();
                }}
              >
                <Text style={styles.universityText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            }
          />

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    height: '65%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  searchInput: {
    height: 42,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 15,
  },
  list: {
    flex: 1,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  universityText: {
    fontSize: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffaa00',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffaa00',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ModalComponent;
