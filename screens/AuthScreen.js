import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from 'react-native-vector-icons';
import { doc, setDoc } from 'firebase/firestore';

const AuthScreen = ({ navigation }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ name: '', rollNo: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state

  const handleAuth = async () => {
    const { name, rollNo, email, password } = form;

    if (isSignUp && !email.endsWith('@kongu.edu')) {
      Alert.alert('Invalid Email', 'Email must belong to @kongu.edu domain.');
      return; // Stop further execution
    }

    try {
      setLoading(true); // Start loading

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user details to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          rollNo,
          email,
          createdAt: new Date(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.appTitle}>FoodQ</Text>

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Roll No"
              value={form.rollNo}
              onChangeText={(text) => setForm({ ...form, rollNo: text })}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#555"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]} // Disable button when loading
          onPress={handleAuth}
          disabled={loading} // Disable button while submitting
        >
          <Text style={styles.buttonText}>{loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleTextContainer}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Sign In' : 'New user? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f6f7',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    color: "#A94438"
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 15,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4DEBE',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1, // Ensure it takes up full width
  },
  eyeIcon: {
    position: 'absolute',
    right: 15, 
    top: '50%',
    transform: [{ translateY: -12 }], 
  },
  button: {
    backgroundColor: '#D24545',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f5f6f7', 
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleTextContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#A94438',
    marginTop: 20
  },
});

export default AuthScreen;
