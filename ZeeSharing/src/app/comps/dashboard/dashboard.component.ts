import { Component, inject, OnInit } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true, 
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit {
  selectedFile: File | null = null;
  fileError: string = '';
  downloadURL: string | null = null;
  uploadedMusic: { name: string, audio: string }[] = [];
  currentMusic: { name: string, audio: string } | null = null;
  currentIndex: number = -1;

  audioPlayer: HTMLAudioElement | null = null;

  constructor(private firestore: Firestore) {}

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
        await setDoc(doc(this.firestore, 'Musics', this.selectedFile.name), {
          audio: filePath,
          name: this.selectedFile.name,
          tags: []
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
      return {
        name: data['name'],
        audio: data['audio']
      };
    });

    // Alapértelmezés szerint az első zene kijelölése
    if (this.uploadedMusic.length > 0) {
      this.currentMusic = this.uploadedMusic[0];
      this.currentIndex = 0;
    }
  }

  playMusic(music: { name: string, audio: string }, index: number) {
    this.currentMusic = music;
    this.currentIndex = index;

    if (!this.audioPlayer) {
      this.audioPlayer = document.createElement('audio');
      document.body.appendChild(this.audioPlayer);
    }

    this.audioPlayer.src = music.audio;
    this.audioPlayer.play();
  }

  playNext() {
    if (this.uploadedMusic.length > 0) {
      // Ha a végén vagyunk, ugorjunk az elejére
      const nextIndex = (this.currentIndex + 1) % this.uploadedMusic.length;
      this.playMusic(this.uploadedMusic[nextIndex], nextIndex);
    }
  }

  playPrevious() {
    if (this.uploadedMusic.length > 0) {
      // Ha az elején vagyunk, ugorjunk a végére
      const prevIndex = (this.currentIndex - 1 + this.uploadedMusic.length) % this.uploadedMusic.length;
      this.playMusic(this.uploadedMusic[prevIndex], prevIndex);
    }
  }
}
