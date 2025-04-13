import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faDownload, faSignOut, faUpload, faTv, faPlus, faX, faMusic, faList, faUser, faPlay, faPause, faBackward, faForward, faRandom, faRotateBack, faVolumeHigh, faVolumeXmark, faVolumeLow  } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-offline-main',
  templateUrl: './offline-main.component.html',
  styleUrl: './offline-main.component.css',
  imports: [CommonModule, FormsModule, FontAwesomeModule]
})
export class OfflineMainComponent implements OnInit {
  musicFiles: Array<{ name: string, performer: string, fileData: ArrayBuffer }> = [];

  ngOnInit() {
    this.loadMusic();
  }

  async loadMusic() {
    // Növeljük a verziót, hogy biztosan lefusson az onupgradeneeded
    const request = indexedDB.open("MusicDatabase", 2); // Verzió növelése
  
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
  
      // Ha még nem létezik, létrehozzuk a 'songs' objektum tárolót
      if (!db.objectStoreNames.contains('songs')) {
        db.createObjectStore('songs', { keyPath: 'id' }); // vagy más kulcsmező, ha szükséges
        //console.log("Létrehozva a 'songs' tároló.");
      }
    };
  
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      
      // Készítsünk tranzakciót a 'songs' tárolóval
      const transaction = db.transaction("songs", "readonly");
      const store = transaction.objectStore("songs");
      const getAllRequest = store.getAll();
  
      getAllRequest.onsuccess = () => {
        this.musicFiles = getAllRequest.result; // Betölti a zenéket a tömbbe
        //console.log("Betöltött zenék:", this.musicFiles);
      };
  
      getAllRequest.onerror = () => {
        //console.error("Hiba a zenék betöltésekor!");
      };
    };
  
    request.onerror = () => {
      //console.error("Hiba az IndexedDB megnyitásakor!");
    };
  }
    playMusic(index: number): void {
      this.currentIndex = index;
      this.currentMusic = this.musicFiles[this.currentIndex];

      if (!this.audioPlayer) {
        this.audioPlayer = document.createElement('audio');
        document.body.appendChild(this.audioPlayer);
      }

      const song = this.musicFiles[index];
      const blob = new Blob([song.fileData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      this.audioPlayer.src = audioUrl;

    
      this.audioPlayer.play()
        .then(() => console.log(`A(z) ${song.name} - ${song.performer} lejátszása elkezdődött.`))
        .catch((error) => console.error('Hiba a zene lejátszása során:', error));

      this.isPlaying = true;
      this.audioPlayer.onloadedmetadata = () => {
        this.audioDuration = this.audioPlayer?.duration || 0;
        this.audioCurrentTime = 0;
        this.updateCurrentTime();
      };
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

  currentMusic: { name: string, performer: string, fileData: ArrayBuffer } | null = null;
  currentIndex: number = -1;
  audioPlayer: HTMLAudioElement | null = null;
  
  volume: number = 1;
  revolume: number = 1;
  audioDuration: number = 0;
  audioCurrentTime: number = 0;
  
  isPlaying: boolean = false;
  isRandom: boolean = false;
  isReplay: number = 0;

  playNext() {
    if (this.musicFiles.length > 0) {
      if(this.isReplay == 1){
        this.playMusic(this.currentIndex);
        this.isReplay = 0;
      }else if(this.isReplay == 2){
        this.playMusic(this.currentIndex);
      }else if(this.isRandom){
        let random = Math.floor(Math.random() * this.musicFiles.length);
        while(random == this.currentIndex){
          random = Math.floor(Math.random() * this.musicFiles.length);
        }
        this.currentIndex = random;
        this.playMusic(this.currentIndex);
      }else{
        if(this.currentIndex + 1 >= this.musicFiles.length){
          this.currentIndex = 0;
        }else{
          this.currentIndex += 1;
        }
        this.playMusic(this.currentIndex);
      }
    }
  }
  playPrevious() {
    if (this.musicFiles.length > 0) {
      if(this.currentIndex - 1  < 0){
        this.currentIndex = this.musicFiles.length -1 ;
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
}
