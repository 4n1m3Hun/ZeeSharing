import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserService } from '../../user.service';
import { Firestore, collection, query, where, getDocs,  updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faEye, faArrowDown, faArrowUp, faTrashCan} from '@fortawesome/free-solid-svg-icons';

import { EventEmitter, Input, Output } from '@angular/core';

export interface Zene {
  name: string;
  audio: string;
  performer: string;
  img?: string;
  tags?: string[];
}

@Component({
  selector: 'app-play-lists',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './play-lists.component.html',
  styleUrl: './play-lists.component.css'
})
export class PlayListsComponent implements OnInit{
  userData: any = null;
  userPlaylists: { title: string; type: string, songs: Zene[], showMusics: boolean }[] = [];

  faEye = faEye;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faTrashCan = faTrashCan;

  @Input() latestSongs: Zene[] = [];
  @Output() songClicked = new EventEmitter<{ 
    songs:  {
      name: string;
      audio: string;
      performer: string;
      img?: string;
      tags?: string[];
  }[]; index: number }>();

  constructor(
    private userService: UserService, 
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    if (this.userData) {
      this.loadUserPlaylists(this.userData.uid);
    }
  }
  async loadUserPlaylists(userId: string) {
    const playlistsCollection = collection(this.firestore, 'PlayLists');
    const playlistsQuery = query(playlistsCollection, where('user', '==', this.userData['username']));

    const querySnapshot = await getDocs(playlistsQuery);
    this.userPlaylists = querySnapshot.docs.map(docSnapshot => ({
      title: docSnapshot.data()['title'],
      type: docSnapshot.data()['type'],
      songs: docSnapshot.data()['songs'],
      showMusics: false
    }));
  }
  toggleMusicVisibility(title: string) {
    const playlist = this.userPlaylists.find(list => list.title === title);
    if (playlist) {
        playlist.showMusics = !playlist.showMusics; // Toggle the visibility
    }
  }

  async onSongSelected(lista: string, i: number) {
    const playlist = this.userPlaylists.find((list) => list.title === lista);
    if (playlist) {
      this.songClicked.emit({
        songs: playlist.songs,
        index: i,
      });
    }
  }
  async deleteFromPlayList(title: string, song: Zene){
    if (!this.userData?.email) return;

    try{
      const playlistsCollection = collection(this.firestore, 'PlayLists');
      const playlistsQuery = query(
        playlistsCollection,
        where('user', '==', this.userData['username']),
        where('title', '==', title)
      );
      const querySnapshot = await getDocs(playlistsQuery);

      if (!querySnapshot.empty) {
        const playlistDoc = querySnapshot.docs[0]; // Feltételezzük, hogy egyetlen találat van
        const playlistRef = playlistDoc.ref;
        const playlistData = playlistDoc.data();
  
        // Frissített dalok lista (töröljük a megadott dalt)
        const updatedSongs = (playlistData['songs'] || []).filter(
          (s: Zene) => s.audio !== song.audio
        );
  
        // Firestore frissítése
        await updateDoc(playlistRef, {
          songs: updatedSongs
        });
  
        // Helyi állapot frissítése
        const playlistIndex = this.userPlaylists.findIndex(p => p.title === title);
        if (playlistIndex !== -1) {
          this.userPlaylists[playlistIndex].songs = updatedSongs;
        }
        
        console.log(`"${song.name}" törölve lett a "${title}" lejátszási listából.`);
      } else {
        console.log(`A "${title}" nevű lejátszási lista nem található.`);
      }
    } catch (error) {
      console.error('Hiba a dal törlése közben:', error);
    }
  }
  refresh() {
    if (this.userData) {
      this.loadUserPlaylists(this.userData.uid);
    }
  }
}
