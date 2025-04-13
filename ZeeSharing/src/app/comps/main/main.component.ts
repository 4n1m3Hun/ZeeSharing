import { Component, OnDestroy, OnInit, ViewChild  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faDownload, faSignOut, faUpload, faTv, faPlus, faX, faMusic, faList, 
        faUser, faPlay, faPause, faBackward, faForward, faRandom, faRotateBack, 
        faVolumeHigh, faVolumeXmark, faVolumeLow, faCheckCircle, faXmarkCircle,
        faSearch, faFileDownload, faComment, faCircle
      } from '@fortawesome/free-solid-svg-icons';

import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, getDocs, doc, setDoc, addDoc, query, where } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { UserService } from '../../user.service';

import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

/*Components*/
import { LatestMusicComponent } from '../latest-music/latest-music.component';
import { PopularMusicComponent } from '../popular-music/popular-music.component';
import { RecommendedMusicComponent } from '../recommended-music/recommended-music.component';
import { CreatePlayListComponent } from '../create-play-list/create-play-list.component';
import { PlayListsComponent } from '../play-lists/play-lists.component';
import { UploadMusicComponent } from '../upload-music/upload-music.component';
import { SearchComponent } from '../search/search.component';
import { FriendsComponent } from '../friends/friends.component';
import { ChatComponent } from '../chat/chat.component';
import { ForumComponent } from '../forum/forum.component';

import { PlaylistService } from './playListService';
import { ChatService } from '../chat/chatService';
import { Subscription } from 'rxjs';

export interface Zene {
  name: string;
  audio: string;
  performer: string;
  img?: string;
  tags?: string[];
}

@Component({
  selector: 'app-main',
  imports: [CommonModule, FontAwesomeModule, FormsModule,
            LatestMusicComponent, PopularMusicComponent, RecommendedMusicComponent,
            CreatePlayListComponent, PlayListsComponent, UploadMusicComponent, SearchComponent,
            FriendsComponent, ChatComponent, ForumComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild(PlayListsComponent) playListsComponent!: PlayListsComponent;
  private messagesSub!: Subscription;

  constructor(private firestore: Firestore, private auth: Auth, private router: Router, private userService: UserService, private playlistService: PlaylistService,private chatService: ChatService){}

  userData: any = null;
  isUnread: boolean = false;

  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.promptEvent = event;
      this.status = true;
    });
    console.log("letölthető?: "+ this.status);

    this.chatService.listenForMessagesAll(this.userData['username']);

    this.messagesSub = this.chatService.unreadMessages$.subscribe(messages => {
      if (messages.length > 0) {
        this.isUnread = true;
      } else {
        this.isUnread = false;
      }
    });
  }
  ngOnDestroy(): void {
    // 🔹 Memóriaszivárgás elkerülése
    this.messagesSub?.unsubscribe();
  }

  faPlay = faPlay;
  faPause = faPause;
  faBackward = faBackward;
  faForward = faForward;
  faRandom = faRandom;
  faRotateBack = faRotateBack;
  faVolumeHigh = faVolumeHigh;
  faVolumeXmark = faVolumeXmark;
  faVolumeLow = faVolumeLow;
  faMusic = faMusic;
  faList = faList;
  faUser = faUser;
  faPlus = faPlus;
  faX = faX;
  faUpload = faUpload;
  faTv = faTv;
  faSignOut = faSignOut;
  faDownload = faDownload;
  faCheckCircle = faCheckCircle;
  faXmarkCircle = faXmarkCircle;
  faSearch = faSearch;
  faFileDownload = faFileDownload;
  faComment = faComment;
  faCircle = faCircle;

  songsByPerformer: Zene[] = [];
  currentMusic: Zene | null = null;
  currentIndex: number = -1;
  audioPlayer: HTMLAudioElement | null = null;

  volume: number = 1;
  revolume: number = 1;
  audioDuration: number = 0;
  audioCurrentTime: number = 0;

  isPlaying: boolean = false;
  isRandom: boolean = false;
  isReplay: number = 0;

  status: boolean = false;

  /*Lejátszó*/
  handleSongClicked(event: { songs: Zene[]; index: number }) {
    this.songsByPerformer = event.songs;
    //console.clear();
    //console.log('Songs by performer:', this.songsByPerformer);
    if (this.songsByPerformer.length > 0) {
      this.playMusic(event.index)
    }
  }
  playMusic(toindex: number) {
    this.currentIndex = toindex;
    this.currentMusic = this.songsByPerformer[this.currentIndex];
    
    if (!this.audioPlayer) {
      this.audioPlayer = document.createElement('audio');
      document.body.appendChild(this.audioPlayer);
    }
    
    this.audioPlayer.src = this.songsByPerformer[this.currentIndex].audio;
    this.audioPlayer.play();
    this.isPlaying = true;

    this.audioPlayer.onloadedmetadata = () => {
      this.audioDuration = this.audioPlayer?.duration || 0;
      this.audioCurrentTime = 0;
      this.updateCurrentTime();
    };
    const playHistoryCollection = collection(this.firestore, 'PlayHistory');
    addDoc(playHistoryCollection, {
      user: this.userData?.email, // Bejelentkezett felhasználó e-mail címe
      name: this.currentMusic.name,
      performer: this.currentMusic.performer,
      tags: this.currentMusic.tags || [],
      img: this.currentMusic.img,
      playedAt: new Date(),
    });
  }
  playSongAndContinue(song: Zene) {
    // Beállítjuk a lejátszott zenét
    this.currentMusic = song;
  
    if (!this.audioPlayer) {
      this.audioPlayer = document.createElement('audio');
      document.body.appendChild(this.audioPlayer);
    }
  
    this.audioPlayer.src = song.audio;
    this.audioPlayer.play();
    this.isPlaying = true;
  
    this.audioPlayer.onloadedmetadata = () => {
      this.audioDuration = this.audioPlayer?.duration || 0;
      this.audioCurrentTime = 0;
      this.updateCurrentTime();
    };
  
    this.audioPlayer.onended = () => {
      this.playNext();
    };
  }
  playNext() {
    if (this.songsByPerformer.length > 0) {
      if(this.isReplay == 1){
        this.playMusic(this.currentIndex);
        this.isReplay = 0;
      }else if(this.isReplay == 2){
        this.playMusic(this.currentIndex);
      }else if(this.isRandom){
        let random = Math.floor(Math.random() * this.songsByPerformer.length);
        while(random == this.currentIndex){
          random = Math.floor(Math.random() * this.songsByPerformer.length);
        }
        this.currentIndex = random;
        this.playMusic(this.currentIndex);
      }else{
        if(this.currentIndex + 1 >= this.songsByPerformer.length){
          this.currentIndex = 0;
        }else{
          this.currentIndex += 1;
        }
        this.playMusic(this.currentIndex);
      }
    }
  }
  playPrevious() {
    if (this.songsByPerformer.length > 0) {
      if(this.currentIndex - 1  < 0){
        this.currentIndex = this.songsByPerformer.length -1 ;
      }else{
        this.currentIndex -= 1;
      }
      this.playMusic(this.currentIndex);
    }
  }
  updateCurrentTime() {
    if (this.audioPlayer) {
      const interval = setInterval(() => {
        if (this.audioPlayer) {
          this.audioCurrentTime = this.audioPlayer.currentTime;
  
          if (this.audioCurrentTime >= this.audioDuration) {
            this.playNext();
            clearInterval(interval);
          }
        }
      }, 1000);
    }
  }
  setVolume() {
    if (this.audioPlayer) {
      this.audioPlayer.volume = this.volume;
    }
  }
  togglePlayPause() {
    if (this.audioPlayer) {
      if (this.isPlaying) {
        this.audioPlayer.pause();
      } else {
        this.audioPlayer.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }
  toggleVolume(){
    if(this.volume>0){
      this.revolume = this.volume;
      this.volume = 0;
    }else{
      this.volume = this.revolume;
    }
    if (this.audioPlayer) {
      this.audioPlayer.volume = this.volume;
    }
  }
  toggleRandom(){
    this.isRandom = !this.isRandom;
    this.isReplay = 0;
  }
  toggleReplay(){
    if(this.isReplay == 0){
      this.isReplay = 1;
    }else if(this.isReplay == 1){
      this.isReplay = 2;
    }else{
      this.isReplay = 0;
    }
    this.isRandom = false;
  }
  seekMusic(event: Event) {
    const target = event.target as HTMLInputElement;
    const newTime = Number(target.value);
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = newTime;
    }
  }
  formatTime(time: number){
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  /*zene letöltése*/
  async downloadSong(zene: Zene): Promise<void> {
    try {
      const response = await fetch(zene.audio);
      const fileData = await response.arrayBuffer();

      const db = await this.openDatabase();
      const transaction = db.transaction("songs", "readwrite");
      const store = transaction.objectStore("songs");

      // Az objektum, amit el szeretnél tárolni
      const song = {
        name: zene.name,
        performer: zene.performer,
        fileData: fileData
      };

      store.put(song);
      //console.log(`${zene.name} sikeresen letöltve és IndexedDB-be mentve!`);
    } catch (error) {
      //console.error("Hiba a zene letöltése és mentése során:", error);
    }
  }

  openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MusicDatabase", 2); // Verzió frissítése

      request.onupgradeneeded = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;

        // Ellenőrizzük, hogy létezik-e már az objektumtároló
        if (!db.objectStoreNames.contains("songs")) {
          db.createObjectStore("songs", { keyPath: "name" });
        }
      };

      request.onsuccess = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = function (event) {
        reject("Hiba az IndexedDB megnyitásakor!");
      };
    });
  }
  /*lilépés*/
  async logout() {
    try {
      await signOut(this.auth); // Kijelentkezés
      this.router.navigate(['/login'], { replaceUrl: true }); // Vissza a Login oldalra
    } catch (error) {
      //console.error('Error during logout:', error);
    }
  }
  
  /*menu*/
  showCurrentlyPlayList =true;
  showCreatePlaylist =false;
  showUserPlayList = false;
  showUserFriendList = false;

  showList: boolean = true;
  showUpload: boolean = false;
  showSearch: boolean = false;
  showChat: boolean = false;
  showForum: boolean = false;
  toggleShowCurrentlyPlaylist(){
    this.showCurrentlyPlayList = true;
    this.showUserFriendList = false;
    this.showUserPlayList = false;
  }
  toggleCreatePlaylist() {
    this.showCreatePlaylist = !this.showCreatePlaylist;
  }
  toggleShowUserFriendList(){
    this.showCurrentlyPlayList = false;
    this.showUserFriendList = true;
    this.showUserPlayList = false;
  }
  toggleShowUserPlayList(){
    this.showCurrentlyPlayList = false;
    this.showUserFriendList = false;
    this.showUserPlayList = true;
  }

  toggleMusicList(){
    this.showUpload = false;
    this.showList = true;
    this.showSearch = false;
    this.showChat = false;
    this.showForum = false;
  }
  toggleUploadMusic(){
    this.showUpload = true;
    this.showList = false;
    this.showSearch = false;
    this.showChat = false;
    this.showForum = false;
  }
  toggleSearch(){
    this.showUpload = false;
    this.showList = false;
    this.showSearch = true;
    this.showChat = false;
    this.showForum = false;
  }
  toggleForum(){
    this.showUpload = false;
    this.showList = false;
    this.showSearch = false;
    this.showChat = false;
    this.showForum = true;
  }

  //add to playList
  showPlaylistMenu = false;
  userPlaylists: { title: string; type: string, contains: boolean }[] = [];
  togglePlaylistMenu() {
    this.showPlaylistMenu = !this.showPlaylistMenu;
    if (this.showPlaylistMenu) {
      this.loadUserPlaylists();
    }
    console.log(this.userData);
  }
  async loadUserPlaylists() {
    const playlistsCollection = collection(this.firestore, 'PlayLists');
    const playlistsQuery = query(playlistsCollection, where('user', '==', this.userData?.username));

    const querySnapshot = await getDocs(playlistsQuery);
    this.userPlaylists = querySnapshot.docs.map(docSnapshot => ({
      title: docSnapshot.data()['title'],
      type: docSnapshot.data()['type'],
      contains: (docSnapshot.data()['songs'] || []).some((song: Zene) => song.name === this.currentMusic?.name)
    }));
  }

  async addToPlaylist(playlist: {title: string; type: string, contains: boolean}) {
    if (!this.currentMusic) return;

    const playlistsCollection = collection(this.firestore, 'PlayLists');
    const playlistsQuery = query(playlistsCollection, where('user', '==', this.userData?.username ), where('title', '==', playlist.title));
    const querySnapshot = await getDocs(playlistsQuery);
    
    if (!querySnapshot.empty) {
      const playlistDoc = querySnapshot.docs[0];
      const playlistData = playlistDoc.data();
      const musicList: Zene[] = playlistData['songs'] || [];
  
      const musicIndex = musicList.findIndex(m => m.name === this.currentMusic?.name);
  
      if (musicIndex === -1) {
        musicList.push(this.currentMusic);
      } else {
        musicList.splice(musicIndex, 1);
      }
  
      await setDoc(doc(this.firestore, 'PlayLists', playlistDoc.id), { 
        ...playlistData, 
        songs: musicList 
      });
      this.playListsComponent.refresh();
  
      this.showPlaylistMenu = !this.showPlaylistMenu;
    }
  }

  //Install PWA

  promptEvent: any = null;
  public installPwa() {
    this.status = false;
    this.promptEvent.prompt();
    this.promptEvent.userChoice.then((choiceResult: { outcome: string; }) => {
        this.promptEvent = null;
    });
  }


  //MSG
  checkMSG(uname: string){
    this.showUpload = false;
    this.showList = false;
    this.showSearch = false;
    this.showForum = false;
    this.showChat = true;
  }
}