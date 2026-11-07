import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { festiveAudio } from '../utils/audio';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Ensure user document exists in Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              userId: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Devotee',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              totalDiyasLit: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Could not sync user profile in Firestore:', err);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      festiveAudio.playBellChime(659.25);
      await signInWithPopup(auth, googleProvider);
      festiveAudio.playSparkle();
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-In error:', error);
      }
    }
  };

  const logout = async () => {
    try {
      festiveAudio.playBellChime(440);
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
