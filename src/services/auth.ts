import { db } from './db';
import { UserProfile } from '../types';

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

  logout(): void {
    db.setActiveUserId(null);
  },

  updateProfile(profile: UserProfile): void {
    db.updateUser(profile);
  },
};
