import { Component, inject, OnInit} from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, getDocs, doc, setDoc, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faDownload, faSignOut, faUpload, faTv, faPlus, faX, faMusic, faList, faUser, faPlay, faPause, faBackward, faForward, faRandom, faRotateBack, faVolumeHigh, faVolumeXmark, faVolumeLow  } from '@fortawesome/free-solid-svg-icons';
import { LatestMusicComponent } from '../latest-music/latest-music.component';
import { LatestPodcastComponent } from '../latest-podcast/latest-podcast.component';
import { UploadMusicComponent } from '../upload-music/upload-music.component';
import { CreatePlayListComponent } from '../create-play-list/create-play-list.component';
import { PlayListsComponent } from '../play-lists/play-lists.component';
import { RecommendedMusicComponent } from '../recommended-music/recommended-music.component';
import { PopularMusicComponent } from '../popular-music/popular-music.component';

import { User } from '@angular/fire/auth';
import { UserService } from '../../user.service';

import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

export interface Zene {
  name: string;
  audio: string;
  performer: string;
  img?: string;
  tags?: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, LatestMusicComponent, LatestPodcastComponent, UploadMusicComponent, CreatePlayListComponent, PlayListsComponent, RecommendedMusicComponent, PopularMusicComponent],
})
export class DashboardComponent implements OnInit{
  userData: User | null = null;

 
  ngOnInit(): void {
    this.userData = this.userService.getUserData();
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

  constructor(private firestore: Firestore, private auth: Auth, private router: Router, private userService: UserService){}
  
  //ha rákattintunk

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
  async downloadSong(audioUrl: string, name: string) {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = name + ".mp3";
      document.body.appendChild(link);
      link.click();
      
      // Takarítás
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Hiba a letöltés során:", error);
    }
  }

  /*kilépes*/
  async logout() {
    try {
      await signOut(this.auth); // Kijelentkezés
      this.router.navigate(['/login'], { replaceUrl: true }); // Vissza a Login oldalra
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /*gombok*/
  showUpload: boolean = false;
  showList: boolean = true;
  toggleMusicList(){
    this.showUpload = false;
    this.showList = true;
  }
  toggleUploadMusic(){
    this.showUpload = true;
    this.showList = false;
  }

  //Create PlayList
  showCreatePlaylist =false;

  showUserPlayList = false;
  showUserFriendList = false;
  showCurrentlyPlayList =true;
  toggleShowCurrentlyPlaylist(){
    this.showCurrentlyPlayList = true;
    this.showUserFriendList = false;
    this.showUserPlayList = false;
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
  toggleCreatePlaylist() {
    this.showCreatePlaylist = !this.showCreatePlaylist;
  }
}