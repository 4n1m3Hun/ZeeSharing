import { Component, inject, OnInit} from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faPlay, faPause, faBackward, faForward, faRandom, faRotateBack, faVolumeHigh, faVolumeXmark, faVolumeLow  } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  selectedFile: File | null = null;
  fileError: string = '';
  downloadURL: string | null = null;

  faPlay = faPlay;
  faPause = faPause;
  faBackward = faBackward;
  faForward = faForward;
  faRandom = faRandom;
  faRotateBack = faRotateBack;
  faVolumeHigh = faVolumeHigh;
  faVolumeXmark = faVolumeXmark;
  faVolumeLow = faVolumeLow

  // Az img mező opcionális, ha nem akarod kötelezővé tenni
  uploadedMusic: { name: string; audio: string; img?: string }[] = [];
  currentMusic: { name: string; audio: string; img?: string } | null = null;
  currentIndex: number = -1;
  isPlaying: boolean = false;
  isRandom: boolean = false;
  isReplay: boolean = false;
  volume: number = 1;
  revolume: number = 1;

  audioPlayer: HTMLAudioElement | null = null;
  audioDuration: number = 0; // A zene teljes hossza másodpercekben
  audioCurrentTime: number = 0; // Az aktuális zene pozíciója másodpercekben


  constructor(private firestore: Firestore){}


  ngOnInit() {
    // Amikor a komponens betöltődik, töltse be az összes feltöltött zenét a Firestore-ból
    this.loadUploadedMusic();
  }
    

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === 'audio/mpeg') {
      this.selectedFile = file;
      this.fileError = '';
    } else {
      this.selectedFile = null;
      this.fileError = 'Only MP3 files are allowed!';
    }
  }

  storage = inject(Storage);

  async onFileUpload(event: Event) {
    event.preventDefault();
    if (this.selectedFile) {
      const filePath = `music/${Date.now()}_${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);

      try {
        // Zene adatainak tárolása Firestore-ban
        await setDoc(doc(this.firestore, 'Musics', this.selectedFile.name), {
          audio: filePath,
          name: this.selectedFile.name,
          tags: [],
          img: "assets/default-image.png", // Alapértelmezett kép URL-je
        });

        this.downloadURL = await getDownloadURL(storageRef);
        this.loadUploadedMusic(); // Töltse újra a zenelistát a feltöltés után
      } catch (error) {
        console.error('A feltöltés meghiúsult:', error);
        this.fileError = 'A feltöltés meghiúsult. Kérlek, próbáld újra.';
      }
    }
  }

  async loadUploadedMusic() {
    const musicCollection = collection(this.firestore, 'Musics');
    const musicSnapshot = await getDocs(musicCollection);

    this.uploadedMusic = musicSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      const musicData = {
        name: data['name'],
        audio: data['audio'],
        img: data['img'] || 'assets/default-image.png', // Alapértelmezett kép, ha az img üres
      };
      console.log('Music Data:', musicData);
      return musicData;
    });

    // Alapértelmezés szerint az első zene kijelölése
    if (this.uploadedMusic.length > 0) {
      this.currentMusic = this.uploadedMusic[0];
      this.currentIndex = 0;
    }
  }

  playMusic(music: { name: string; audio: string; img?: string }, index: number) {
    this.currentMusic = music; // Most már itt is beállítjuk a currentMusic-ot
    this.currentIndex = index;
  
    if (!this.audioPlayer) {
      this.audioPlayer = document.createElement('audio');
      document.body.appendChild(this.audioPlayer);
    }
    
    // Ha nem játszik, állítsuk be a forrást és indítsuk el a zenét
    if (!this.isPlaying) {
      this.audioPlayer.src = music.audio;
      this.audioPlayer.play();
      this.isPlaying = true;
    }
  
    // Kiírjuk a konzolra a zene képének elérési útját
    //console.log('Currently playing image:', music.img);
  
    // Frissítjük a zene hosszát
    this.audioPlayer.onloadedmetadata = () => {
      this.audioDuration = this.audioPlayer?.duration || 0;
      this.audioCurrentTime = 0; // Reset current time
      this.updateCurrentTime(); // Indítsuk el az aktuális idő frissítését
    };
    
    // Frissítjük az aktuális időt a lejátszás során
    this.audioPlayer.ontimeupdate = () => {
      this.audioCurrentTime = this.audioPlayer?.currentTime || 0;
    };

    this.audioPlayer.volume = this.volume;
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
      this.isPlaying = !this.isPlaying; // Állapot váltása
    }
  }
  toggleRandom(){
    if(this.isRandom){
      this.isRandom = false;
    }else{
      this.isRandom = true;
      this.isReplay = false;
    }
  }
  toggleReplay(){
    if(this.isReplay){
      this.isReplay = false;
    }else{
      this.isReplay = true;
      this.isRandom = false;
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
  updateCurrentTime() {
    // Frissítjük az aktuális időt, amíg a zene játszik
    if (this.audioPlayer) {
      const interval = setInterval(() => {
        if (this.audioPlayer) { // Null-ellenőrzés
          this.audioCurrentTime = this.audioPlayer.currentTime;
  
          // Ellenőrizzük, hogy a zene véget ért-e
          if (this.audioCurrentTime >= this.audioDuration) {
            if (this.isRandom) {
              let random = Math.floor(Math.random() * this.uploadedMusic.length);

              if (this.audioPlayer && this.isPlaying) {
                this.audioPlayer.pause();
                this.isPlaying = false; // Állapot frissítése
              }
              this.playMusic(this.uploadedMusic[random], random); // Véletlenszerű zene lejátszása
            } else if(this.isReplay){
              if (this.audioPlayer && this.isPlaying) {
                this.audioPlayer.pause();
                this.isPlaying = false; // Állapot frissítése
              }
              this.playMusic(this.uploadedMusic[this.currentIndex], this.currentIndex); // Véletlenszerű zene lejátszása
            }
            else {
              console.log(Math.floor(Math.random() * this.uploadedMusic.length) + 1);
              this.playNext(); // Következő zene lejátszása this.uploadedMusic.length
            }
            clearInterval(interval); // Megszüntetjük az időzítőt
          }
        }
      }, 1000);
    }
  }
  seekMusic(event: Event) {
    const target = event.target as HTMLInputElement;
    const newTime = Number(target.value);
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = newTime;
    }
  }
  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  playNext() {
    if (this.uploadedMusic.length > 0) {
      // Ha a végén vagyunk, ugorjunk az elejére
      const nextIndex = (this.currentIndex + 1) % this.uploadedMusic.length;
      
      // Az aktuális zene leállítása
      if (this.audioPlayer && this.isPlaying) {
        this.audioPlayer.pause();
        this.isPlaying = false; // Állapot frissítése
      }
  
      // A következő zene elindítása
      this.playMusic(this.uploadedMusic[nextIndex], nextIndex);
    }
  }

  playPrevious() {
    if (this.uploadedMusic.length > 0) {
      // Ha az elején vagyunk, ugorjunk a végére
      const prevIndex = (this.currentIndex - 1 + this.uploadedMusic.length) % this.uploadedMusic.length;
      
      // Az aktuális zene leállítása
      if (this.audioPlayer && this.isPlaying) {
        this.audioPlayer.pause();
        this.isPlaying = false; // Állapot frissítése
      }
  
      // A következő zene elindítása
      this.playMusic(this.uploadedMusic[prevIndex], prevIndex);
    }
  }
}
