import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, getDocs } from '@angular/fire/firestore';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private unreadMessagesSubject = new BehaviorSubject<any[]>([]);
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  constructor(private firestore: Firestore) {}

  // 🔹 Üzenet küldése Firestore-ba
  async sendMessage(sender: string, receiver: string, message: string) {
    const messagesCollection = collection(this.firestore, 'messages');

    await addDoc(messagesCollection, {
      sender,
      receiver,
      message,
      type: 'msg',
      time: Timestamp.now(),
      seen: false
    });
  }
  async sendMusic(sender: string, receiver: string, message: DocumentData) {
    const messagesCollection = collection(this.firestore, 'messages');

    await addDoc(messagesCollection, {
      sender,
      receiver,
      message,
      type: 'music',
      time: Timestamp.now(),
      seen: false
    });
  }

  // 🔹 Üzenetek lekérése real-time frissítéssel
  listenForMessages(sender: string, receiver: string) {
    const messagesCollection = collection(this.firestore, 'messages');

    // Lekérjük az üzeneteket a két felhasználó között
    const messagesQuery = query(
      messagesCollection,
      where('sender', 'in', [sender, receiver]),
      where('receiver', 'in', [sender, receiver]),
      orderBy('time', 'asc')
    );

    // Real-time figyelés az üzenetekre
    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.messagesSubject.next([...messages]); // 🔹 Itt!
      },
      (error) => {
        console.error('Error fetching messages in real-time:', error);
      }
    );
    
  }
  listenForMessagesAll(user: string) {
    const messagesCollection = collection(this.firestore, 'messages');
  
    const messagesQuery = query(
      messagesCollection,
      where('receiver', '==', user),
      where('seen', '==', false)
    );
  
    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.unreadMessagesSubject.next([...messages]);
      },
      (error) => {
        console.error('Error fetching messages in real-time:', error);
      }
    );
  }

  // 🔹 Üzenetek olvasottnak jelölése
  async markMessagesAsSeen(sender: string, receiver: string) {
    const messagesCollection = collection(this.firestore, 'messages');

    const messagesQuery = query(
      messagesCollection,
      where('sender', '==', receiver), // A fogadott üzenetek
      where('receiver', '==', sender), // A jelenlegi felhasználónak szólnak
      where('seen', '==', false) // Csak a még nem olvasottak
    );

    const snapshot = await getDocs(messagesQuery);
    snapshot.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { seen: true });
    });
  }
}
