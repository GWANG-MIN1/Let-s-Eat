import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Modal,
} from 'react-native';
import ModalComponent from '../srcs/ModalComponent';
import { signup, setAuth } from '../services/api';

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [university, setUniversity] = useState('');
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [signedNickname, setSignedNickname] = useState('');
  const [error, setError] = useState('');

  const passwordMismatch = repassword.length > 0 && password !== repassword;

  const validate = () => {
    if (!username.trim()) return '아이디를 입력해주세요.';
    if (username.length < 4) return '아이디는 4자 이상이어야 합니다.';
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (password !== repassword) return '비밀번호가 일치하지 않습니다.';
    if (!nickname.trim()) return '닉네임을 입력해주세요.';
    return null;
  };

  const handleSignUp = async () => {
    const errMsg = validate();
    if (errMsg) { setError(errMsg); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await signup({ username, password, nickname, email, university });
      setAuth(data.token, data.userId, data.nickname);
      setSignedNickname(data.nickname);
      setSuccessVisible(true);
    } catch (err) {
      setError(err.response?.data?.error || '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>회원가입</Text>

        <View style={styles.section}>
          <Field label="아이디 *">
            <TextInput
              style={styles.input}
              placeholder="4자 이상"
              placeholderTextColor="#bbb"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="off"
              textContentType="oneTimeCode"
            />
          </Field>

          <Field label="비밀번호 *">
            <TextInput
              style={styles.input}
              placeholder="6자 이상"
              placeholderTextColor="#bbb"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textContentType="oneTimeCode"
            />
          </Field>

          <Field label="비밀번호 확인 *">
            <TextInput
              style={[styles.input, passwordMismatch && styles.inputError]}
              placeholder="비밀번호 재입력"
              placeholderTextColor="#bbb"
              secureTextEntry
              value={repassword}
              onChangeText={setRePassword}
              textContentType="oneTimeCode"
            />
            {passwordMismatch && <Text style={styles.fieldError}>비밀번호가 일치하지 않습니다.</Text>}
          </Field>

          <Field label="닉네임 *">
            <TextInput
              style={styles.input}
              placeholder="앱에서 표시될 이름"
              placeholderTextColor="#bbb"
              value={nickname}
              onChangeText={setNickname}
            />
          </Field>
        </View>

        <View style={styles.section}>
          <Field label="대학교">
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={university ? styles.pickerSelected : styles.pickerPlaceholder}>
                {university || '대학교 선택 (선택사항)'}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>
          </Field>

          <Field label="이메일">
            <TextInput
              style={styles.input}
              placeholder="example@email.com (선택사항)"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Field>
        </View>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>회원가입</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>이미 계정이 있나요? <Text style={styles.loginLinkBold}>로그인</Text></Text>
        </TouchableOpacity>
      </ScrollView>

      {modalVisible && (
        <ModalComponent
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onSelectUniversity={(u) => setUniversity(u)}
        />
      )}

      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>회원가입 완료!</Text>
            <Text style={styles.successMessage}>
              환영합니다, {signedNickname}님!{'\n'}지금 바로 밥 메이트를 찾아보세요.
            </Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => { setSuccessVisible(false); navigation.navigate('Main'); }}
            >
              <Text style={styles.btnPrimaryText}>시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={fieldStyle.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyle = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
});

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f8f8' },
  container: { padding: 24, paddingBottom: 48 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
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
  inputError: { borderColor: '#ff4444' },
  fieldError: { color: '#ff4444', fontSize: 12, marginTop: 4 },
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
  chevron: { color: '#bbb', fontSize: 11 },
  errorBanner: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 8,
    padding: 12,
    color: '#c0392b',
    fontSize: 14,
    marginBottom: 14,
    textAlign: 'center',
  },
  btnPrimary: {
    height: 50,
    backgroundColor: '#ffaa00',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginLink: { alignItems: 'center', paddingVertical: 6 },
  loginLinkText: { color: '#999', fontSize: 14 },
  loginLinkBold: { color: '#ffaa00', fontWeight: 'bold' },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
  },
  successIcon: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  successMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
});
