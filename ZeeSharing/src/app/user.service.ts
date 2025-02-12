import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData:  any = null;

  constructor(private auth: Auth, private firestore: Firestore) {
    // Hallgatja a bejelentkezési állapotot
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.fetchUserData(user); 
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
  }
  async fetchUserData(user: User){
    try {
      const userDocRef = doc(this.firestore, 'Users', user.email!);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        this.setUserData(user, userData['username'],userData['picture'],userData['type']);
        
      }
    }catch (error) {
    console.error('Hiba a felhasználói adatok lekérése során:', error);
    }
  }

  // Felhasználói adat lekérése
  getUserData(){
    return this.userData;
  }
}
