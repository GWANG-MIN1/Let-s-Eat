import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { login, setAuth } from '../services/api';

export default function Home({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    tokki: require('../assets/Fonts/HSSantokki-Regular.ttf'),
  });

  const handleLogin = async () => {
    if (!username.trim()) { Alert.alert('알림', '아이디를 입력하세요.'); return; }
    if (!password) { Alert.alert('알림', '비밀번호를 입력하세요.'); return; }
    setLoading(true);
    try {
      const { data } = await login(username.trim(), password);
      setAuth(data.token, data.userId, data.nickname);
      navigation.navigate('Main');
    } catch (err) {
      Alert.alert('로그인 실패', err.response?.data?.error || '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoArea}>
        <Text style={styles.logoEmoji}>🍽️</Text>
        <Text style={[styles.logoText, fontsLoaded && { fontFamily: 'tokki' }]}>
          밥먹자
        </Text>
        <Text style={styles.logoSub}>식사 메이트를 찾아보세요</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          placeholderTextColor="#bbb"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="off"
          textContentType="oneTimeCode"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#bbb"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>로그인</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnOutlineText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoEmoji: { fontSize: 52, marginBottom: 8 },
  logoText: {
    fontSize: 52,
    color: '#ffaa00',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  logoSub: { fontSize: 14, color: '#999' },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    height: 50,
    borderColor: '#eee',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  btnPrimary: {
    height: 50,
    backgroundColor: '#ffaa00',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnOutline: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#ffaa00',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { color: '#ffaa00', fontSize: 16, fontWeight: '600' },
});
