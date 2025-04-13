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

  listenForMessages(sender: string, receiver: string) {
    const messagesCollection = collection(this.firestore, 'messages');

    const messagesQuery = query(
      messagesCollection,
      where('sender', 'in', [sender, receiver]),
      where('receiver', 'in', [sender, receiver]),
      orderBy('time', 'asc')
    );

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

  async markMessagesAsSeen(sender: string, receiver: string) {
    const messagesCollection = collection(this.firestore, 'messages');

    const messagesQuery = query(
      messagesCollection,
      where('sender', '==', receiver),
      where('receiver', '==', sender), 
      where('seen', '==', false) 
    );

    const snapshot = await getDocs(messagesQuery);
    snapshot.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { seen: true });
    });
  }
}
