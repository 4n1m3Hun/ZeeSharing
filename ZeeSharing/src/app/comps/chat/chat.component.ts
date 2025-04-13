import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faSmile, faPaperPlane, faMusic, faPlayCircle} from '@fortawesome/free-solid-svg-icons';
import { Firestore, collection, query, where, getDocs,addDoc, DocumentData, deleteDoc, doc } from '@angular/fire/firestore';

import { ChangeDetectorRef } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';


import { FriendsComponent } from '../friends/friends.component';

import { FriendService } from '../friends/friendservice';
import { UserService } from '../../user.service';
import { ChatService } from './chatService';
import { reauthenticateWithCredential } from '@angular/fire/auth';

export interface Zene {
  name: string;
  audio: string;
  performer: string;
  img?: string;
  tags?: string[];
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule,FontAwesomeModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  providers: [FriendsComponent]
})
export class ChatComponent implements OnInit, OnDestroy {

  userData: any = null;

  sender: string = "";
  receiver: string | null = null;
  messages: any[] = [];
  newMessage: string = '';
  messagesSub!: Subscription;
  faSmile = faSmile;
  faPaperPlane=faPaperPlane;
  faMusic = faMusic;
  faPlay = faPlayCircle;
  

  constructor(
    private friendComponent: FriendsComponent, private friendService: FriendService,
    private chatService: ChatService, private userService: UserService,
    private firestore: Firestore, private cdref: ChangeDetectorRef) {
      this.searchSubject
            .pipe(
              debounceTime(100),
              distinctUntilChanged()
            )
            .subscribe(text => this.performSearch(text));
    }

    ngOnInit() {
      this.userData = this.userService.getUserData();
      this.sender = this.userData["username"];
    
      this.friendService.username$.subscribe(uname => {
        this.receiver = uname;
        console.log(this.receiver + "----" + this.sender);
        
        if(this.receiver){
          console.log(this.receiver);
          // 🔹 Csak akkor indítjuk el a hallgatást, amikor már megvan a receiver
          this.chatService.listenForMessages(this.sender, this.receiver);
              
          // 🔹 Olvasottnak jelölés is itt történjen
          this.chatService.markMessagesAsSeen(this.sender, this.receiver);
        }
      });
      // 🔹 Megfigyelés az üzenetek Observable-re
      this.messagesSub = this.chatService.messages$.subscribe(messages => {
        this.messages = messages;
        this.cdref.detectChanges();
        console.log('Updated messages in component:', this.messages);
        setTimeout(() => this.scrollToBottom(), 100);
      });
      


    }
  ngOnDestroy() {
    this.messagesSub.unsubscribe();
  }
  sendMessage() {
    if (this.newMessage.trim() && this.receiver != null) {
      this.chatService.sendMessage(this.sender, this.receiver, this.newMessage);
      this.newMessage = '';
    }
  }

  markAsRead(messageId: string) {
    
  }
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  ngAfterViewInit() {
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
  isShowMusic: boolean = false;
  showMusic(){
    this.isShowMusic = !this.isShowMusic;
  }

  searchText: string = '';
  searchSubject = new Subject<string>();
  searchResults: DocumentData[] = [];

  onSearchChange() {
    this.searchSubject.next(this.searchText);
  }
  async performSearch(text: string) {
    if (this.searchText.length < 2) {
      this.searchResults = [];
      return;
    }

    const musicCollection = collection(this.firestore, 'Musics');
    const musicQuery = query(musicCollection, where('name', '>=', text), where('name', '<=', text + '\uf8ff'));
    const musicSnapshot = await getDocs(musicQuery);
    this.searchResults= musicSnapshot.docs.map(doc => doc.data());

    console.log(this.searchResults);
  }

  sendResMusic(res: DocumentData){
    if (this.receiver != null) {
      this.chatService.sendMusic(this.sender, this.receiver, res);
      this.searchText = "";
      this.searchResults = [];
      this.isShowMusic = false;
    }
  }
  @Output() oneClicked = new EventEmitter<Zene>();
  play(res: DocumentData){
    this.onOneClicked(res);
  }
  onOneClicked(music: DocumentData){
      const zene: Zene = {
        name: music['name'] || '',
        audio: music['audio'] || '',
        performer: music['performer'] || '',
        img: music['img'] || undefined,
        tags: music['tags'] || []
      };
      this.oneClicked.emit(zene);
    }
}
