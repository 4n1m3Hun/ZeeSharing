import { Component, OnInit, inject } from '@angular/core';

import { Storage, ref, getDownloadURL, uploadBytes } from '@angular/fire/storage';
import { Firestore, collection, doc, setDoc, getDocs, query} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { User } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../user.service';

import * as mm from 'music-metadata';
import { encode } from 'base64-arraybuffer';

@Component({
  selector: 'app-upload-music',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-music.component.html',
  styleUrl: './upload-music.component.css'
})
export class UploadMusicComponent implements OnInit{
  constructor(private firestore: Firestore, private userService: UserService){}
  userData: any = null;

  
  selectedFile: File | null = null;
  selectedImg: File | null = null;
  fileError: string = '';
  downloadURL: string | null = null;
  storage = inject(Storage);
  isUpImg: boolean = false;
  title: string = '';
  imgUrl: string | null = null;

  availableTags: string[] = [];
  selectedTags: string[] = [];
  
  async ngOnInit() {
    await this.fetchTags();
    this.userData = this.userService.getUserData();
    if (this.userData) {
      //console.log('Felhasználó adatai:', this.userData);
    } else {
      //console.log('Nincs bejelentkezett felhasználó!');
    }
  }
  async  fetchTags(){
    const tagsCollection = collection(this.firestore, 'Tags');
    const querySnapshot = await getDocs(tagsCollection);
    this.availableTags = querySnapshot.docs.map(docSnapshot => docSnapshot.data()['tag']);
    //console.log(this.availableTags);
  }
  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
  }

  

  toggleisUpImg() {
    const fileInput = document.getElementById('ImgInput') as HTMLInputElement;
    if (fileInput) {
      this.isUpImg = !this.isUpImg;
      fileInput.classList.toggle('show-file-input', this.isUpImg);
    }
  }
  async onFileUpload(event: Event) {
    event.preventDefault();
  
    if (this.selectedFile) {
      const filePath = `music/${Date.now()}_${this.title}`;
      const storageRef = ref(this.storage, filePath);
  
      try {
        // Ha saját képet töltesz fel
        if (this.isUpImg && this.selectedImg) {
          const imgPath = `image/${Date.now()}_${this.title}`;
          const storageRef2 = ref(this.storage, imgPath);
  
          await uploadBytes(storageRef2, this.selectedImg);
          this.imgUrl = await getDownloadURL(storageRef2);
        } 
        // Ha NEM saját képet töltesz fel, próbálja meg kinyerni az MP3-ból
        else {
          this.imgUrl = await this.extractImageFromMp3(this.selectedFile);
        }
  
        // Fájl feltöltése Firebase Storage-ba
        await uploadBytes(storageRef, this.selectedFile);
        this.downloadURL = await getDownloadURL(storageRef);
  
        // Mentés Firestore-ba
        await setDoc(doc(this.firestore, 'Musics', this.selectedFile.name), {
          audio: this.downloadURL,
          name: this.title,
          tags: this.selectedTags,
          img: this.imgUrl,
          uploadDate: new Date(),
          performer: this.userData.username
        });
  
        //console.log('Document created in Firestore successfully.');
      } catch (error) {
        //console.error('A feltöltés meghiúsult:', error);
        this.fileError = 'A feltöltés meghiúsult. Kérlek, próbáld újra.';
      }
    }
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
  async extractImageFromMp3(file: File): Promise<string | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const metadata = await mm.parseBuffer(uint8Array, 'audio/mpeg');
      const picture = metadata.common.picture && metadata.common.picture[0];
      
      if (picture) {
        const base64String = encode(picture.data);
        const imageUrl = `data:${picture.format};base64,${base64String}`;
        let imageUrl2 = this.uploadImage(imageUrl);
        return imageUrl2;
      }
      return "https://firebasestorage.googleapis.com/v0/b/zeesharing-d33f2.appspot.com/o/image%2Flogo.png?alt=media&token=47edc7c9-f21d-4a55-a106-94df1952689e";
    } catch (error) {
      //console.error('Hiba történt a zene feldolgozása közben:', error);
      return null;
    }
  }
  async uploadImage(imageData: string): Promise<string> {
    const imagePath = `image/${Date.now()}_${this.title}.png`;
    const imageRef = ref(this.storage, imagePath);

    const response = await fetch(imageData);
    const blob = await response.blob();

    await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  }
  onImgSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === 'png' || file && file.type === 'jpg' || file && file.type === 'jpeg') {
      this.selectedImg = file;
      this.fileError = '';
    } else {
      this.selectedImg = null;
      this.fileError = 'Only MP3 files are allowed!';
    }
  }

}
