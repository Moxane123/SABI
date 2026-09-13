import { db } from './db';
import { UserProfile } from '../types';
import {
  authInstance,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
} from './firebase';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const auth = {
  getCurrentUser(): UserProfile | null {
    return db.getCurrentUser();
  },

  signUp(data: {
    fullName: string;
    username: string;
    email: string;
    profession: string;
    location: string;
    shortBio: string;
    skills: string[];
    yearsOfExperience: number;
    profilePhoto?: string;
  }): UserProfile {
    // Sanitize username to be URL slug friendly
    const cleanSlug = data.username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-');

    const newUser = db.createUser({
      fullName: data.fullName.trim(),
      username: cleanSlug,
      email: data.email.trim().toLowerCase(),
      profession: data.profession.trim(),
      location: data.location.trim(),
      shortBio: data.shortBio.trim(),
      skills: data.skills.filter(Boolean).map((s) => s.trim()),
      yearsOfExperience: Number(data.yearsOfExperience) || 0,
      profilePhoto: data.profilePhoto?.trim() || '',
    });

    return newUser;
  },

  login(emailOrUsername: string): UserProfile | null {
    const term = emailOrUsername.trim().toLowerCase();
    const users = db.getUsers();

    // Match by email or username
    const match = users.find(
      (u) => u.email.toLowerCase() === term || u.username.toLowerCase() === term
    );

    if (match) {
      db.setActiveUserId(match.id);
      return match;
    }

    return null;
  },

  /**
   * Managed Google Sign-In with Firebase Authentication popup
   * Handles both new user creation and existing user login automatically.
   */
  async signInWithGoogle(): Promise<{ user: UserProfile; isNewUser: boolean }> {
    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      const firebaseUser: FirebaseUser = result.user;
      const email = (firebaseUser.email || '').toLowerCase().trim();
      const displayName = firebaseUser.displayName || email.split('@')[0] || 'Professional';
      const photoURL = firebaseUser.photoURL || '';

      const users = db.getUsers();
      let matchedUser = users.find(
        (u) => (u.email && u.email.toLowerCase() === email) || u.id === firebaseUser.uid
      );

      if (matchedUser) {
        // Update user if photo or name wasn't set
        if (!matchedUser.profilePhoto && photoURL) {
          matchedUser.profilePhoto = photoURL;
        }
        if (!matchedUser.fullName && displayName) {
          matchedUser.fullName = displayName;
        }
        db.updateUser(matchedUser);
        db.setActiveUserId(matchedUser.id);
        return { user: matchedUser, isNewUser: !matchedUser.onboardingCompleted && (!matchedUser.profession || matchedUser.skills.length === 0) };
      }

      // Generate a clean slug for new user
      const baseSlug = (displayName || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'proof-user';

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (users.some((u) => u.username === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      // Create new profile linked to the Firebase account
      const newUser: UserProfile = {
        id: firebaseUser.uid,
        fullName: displayName,
        username: uniqueSlug,
        email: email,
        profilePhoto: photoURL,
        profession: '',
        location: '',
        shortBio: '',
        skills: [],
        yearsOfExperience: 0,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      };

      users.push(newUser);
      localStorage.setItem('sabi_users_v1', JSON.stringify(users));
      db.setActiveUserId(newUser.id);

      return { user: newUser, isNewUser: true };
    } catch (err: any) {
      console.error('Firebase Google Sign-In Error:', err);
      // Surface user-friendly error messages
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. The popup was closed before completing.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in attempt is already underway.');
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        throw new Error(err.message || 'Failed to sign in with Google.');
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await firebaseSignOut(authInstance);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
    db.setActiveUserId(null);
  },

  updateProfile(profile: UserProfile): void {
    db.updateUser(profile);
  },

  /**
   * Listen to Firebase Auth state changes
   */
  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(authInstance, (fbUser) => {
      if (fbUser) {
        const users = db.getUsers();
        const found = users.find(
          (u) => u.id === fbUser.uid || (fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase())
        );
        if (found) {
          db.setActiveUserId(found.id);
          callback(found);
          return;
        }
      }
      callback(db.getCurrentUser());
    });
  },
};
