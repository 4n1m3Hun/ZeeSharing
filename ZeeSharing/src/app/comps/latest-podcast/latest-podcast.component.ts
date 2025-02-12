import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { NgFor } from '@angular/common';
import { Buffer } from 'buffer';
import * as mm from 'music-metadata';

//podcast típus
export interface Podcast {
  name: string;
  audio: string;
  podcaster: string;
  img?: string;
}

@Component({
  selector: 'app-latest-podcast',
  standalone: true,
  imports: [NgFor],
  templateUrl: './latest-podcast.component.html',
  styleUrl: './latest-podcast.component.css'
})
export class LatestPodcastComponent {
  latestSongs: Podcast[] = [];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadLatestPodcast();
  }

  async loadLatestPodcast() {
    const musicCollection = collection(this.firestore, 'Podcasts');
    const musicQuery = query(musicCollection, orderBy('uploadDate', 'desc'), limit(6));
    const musicSnapshot = await getDocs(musicQuery);

    this.latestSongs = await Promise.all(musicSnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      const mp3Img = await this.extractImageFromMp3(data['audio']);

      // Visszatérés Zene típusú objektummal
      return {
        name: data['name'],
        audio: data['audio'],
        podcaster: data['podcaster'],
        img: mp3Img || 'https://firebasestorage.googleapis.com/v0/b/zeesharing-d33f2.appspot.com/o/image%2F612b49d6b58ce4e829a3d4f48ba82ad6.jpg?alt=media&token=d5c735cb-1e53-4ec8-9d06-d07dc7fb75cc',
      } as Podcast;
    }));
  }

  async extractImageFromMp3(audioUrl: string): Promise<string | null> {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const metadata = await mm.parseBuffer(uint8Array, 'audio/mp3');
      const picture = metadata.common.picture && metadata.common.picture[0];
      if (picture) {
        const imageUrl = `data:${picture.format};base64,${Buffer.from(picture.data).toString('base64')}`;
        return imageUrl;
      } else {
        console.log('Nincs beágyazott kép az MP3 fájlban.');
        return null;
      }
    } catch (error) {
      console.error('Hiba történt a zene feldolgozása közben:', error);
      return null;
    }
  }
  
}
