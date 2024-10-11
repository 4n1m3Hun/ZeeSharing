import { Component, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { uploadBytes } from 'firebase/storage';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  selectedFile: File | null = null;
  fileError: string = '';
  downloadURL: string | null = null;

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

  onFileUpload(event: Event) {
    event.preventDefault();

    /*if (this.selectedFile) {
      const filePath = `image/${Date.now()}_${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = await uploadBytes(storageRef, this.selectedFile);
    }*/
      if (this.selectedFile) {
        const filePath = `music/${Date.now()}_${this.selectedFile.name}`; // Egyedi fájl elérési út
        const storageRef = ref(this.storage, filePath); // Fájl referenciájának létrehozása
  
        // A feltöltés megkezdése
        const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);
  
        // A feltöltés folyamatának nyomon követése
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100; // Előrehaladás kiszámítása
            console.log('A feltöltés ' + progress + '% kész');
          },
          (error) => {
            console.error('A feltöltés meghiúsult:', error);
            this.fileError = 'A feltöltés meghiúsult. Kérlek, próbáld újra.';
          },
          async () => {
            // A feltöltés sikeresen befejeződött, most lekérjük a letöltési URL-t
            this.downloadURL = await getDownloadURL(storageRef);
            console.log('Fájl elérhető itt:', this.downloadURL); // URL kiírása
          }
        );
      }
  }
}
