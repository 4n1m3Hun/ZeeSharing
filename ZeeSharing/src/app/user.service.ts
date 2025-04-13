import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData: any = null;

  constructor(private auth: Auth, private firestore: Firestore) {
    // Ellenőrizzük a localStorage-t, ha van már mentett felhasználó
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
    }

    // Figyeli a bejelentkezési állapotot
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        await this.fetchUserData(user);
      } else {
        this.clearUserData();
      }
    });
  }

  setUserData(user: any, uname: string, pic: string, tipus: string) {
    this.userData = {
      email: user.email,
      username: uname,
      picture: pic,
      type: tipus
    };
    // Adatok mentése localStorage-ba
    localStorage.setItem('userData', JSON.stringify(this.userData));
  }

  async fetchUserData(user: User) {
    try {
      const userDocRef = doc(this.firestore, 'Users', user.email!);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        this.setUserData(user, userData['username'], userData['picture'], userData['type']);
      }
    } catch (error) {
      console.error('Hiba a felhasználói adatok lekérése során:', error);
    }
  }

  getUserData() {
    return this.userData;
  }

  clearUserData() {
    this.userData = null;
    localStorage.removeItem('userData'); // Adatok törlése kijelentkezéskor
  }
}
