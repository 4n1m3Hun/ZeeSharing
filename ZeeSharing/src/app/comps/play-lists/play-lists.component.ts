import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserService } from '../../user.service';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { NgFor } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faEye, faArrowDown} from '@fortawesome/free-solid-svg-icons';

import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-play-lists',
  standalone: true,
  imports: [NgFor, FontAwesomeModule],
  templateUrl: './play-lists.component.html',
  styleUrl: './play-lists.component.css'
})
export class PlayListsComponent implements OnInit {
  userData: User | null = null;
  userPlaylists: { title: string; type: string }[] = []; // A user lejátszási listái
  downloadedMusic: string[] = [];


  faEye = faEye;
  faArrowDown = faArrowDown;
  
  
  constructor(
    private http: HttpClient,
    private userService: UserService, 
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    if (this.userData) {
      this.loadUserPlaylists(this.userData.uid);
      this.loadDownloadedMusic();
    }
  }
  async loadUserPlaylists(userId: string) {
    const playlistsCollection = collection(this.firestore, 'PlayLists');
    const playlistsQuery = query(playlistsCollection, where('user', '==', this.userData?.email));

    const querySnapshot = await getDocs(playlistsQuery);
    this.userPlaylists = querySnapshot.docs.map(docSnapshot => ({
      title: docSnapshot.data()['title'],
      type: docSnapshot.data()['type']
    }));

    console.log('User Playlists:', this.userPlaylists);
  }
  loadDownloadedMusic() {
    this.http.get<string[]>('http://localhost:3000/api/music-files').subscribe(
      (musicFiles) => {
        this.downloadedMusic = musicFiles; // A letöltött zenék elérési útjai
        console.log('Downloaded Music:', this.downloadedMusic);
      },
      (error) => {
        console.error('Error loading music files:', error);
      }
    );
  }
}
