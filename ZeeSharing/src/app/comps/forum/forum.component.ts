import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ForumService } from './forumService';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user.service';
import { FormsModule } from '@angular/forms';

import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faPaperPlane, faImage} from '@fortawesome/free-solid-svg-icons';
import { Storage, ref, getDownloadURL, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
  imports: [CommonModule, FormsModule, FontAwesomeModule]
})
export class ForumComponent{
  @ViewChild('scrollDiv') scrollDiv!: ElementRef;
  @ViewChild('ImgInput') imgInput!: ElementRef<HTMLInputElement>;

  posts: any[] = [];
  isLoading = false;
  newMessage: string = "";
  userData: any = null;
  faPaperPlane = faPaperPlane;
  faImage = faImage;
  selectedImg: File | null = null;
  storage = inject(Storage);

  constructor(private forumService: ForumService, private userService: UserService) {}

  ngOnInit() {
    this.userData = this.userService.getUserData();
    this.forumService.getPosts();

    this.forumService.posts$.subscribe(posts => {
      this.posts = posts;
    });
  }

  onScroll(event: any) {
    const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
  
    if (bottom && !this.isLoading) {
      this.isLoading = true;
      this.loadMorePosts();
    }
  }

  loadMorePosts() {
    const scroll = this.scrollDiv.nativeElement;
    const prevScrollHeight = scroll.scrollHeight;

    this.forumService.getOlderPosts().then(() => {
      this.isLoading = false;
    });
  }
  async sendMessage(){
    let imageUrl = 'NoImage';
    if (this.selectedImg) {
      console.log("van kép");
      const imgPath = `forum/${Date.now()}_${this.userData["username"]}`;
      const storageRef = ref(this.storage, imgPath);

      try {
        await uploadBytes(storageRef, this.selectedImg);
        imageUrl = await getDownloadURL(storageRef);
        console.log('Kép elérési út:', imageUrl);
      } catch (error) {
        console.error('Hiba a kép feltöltésénél:', error);
      }
    }

    console.log(imageUrl);

    this.forumService.addPost(this.newMessage, this.userData["username"], imageUrl);
    this.newMessage = '';
    this.selectedImg = null;
  }
  triggerImgInput(){
    this.imgInput.nativeElement.click();
  }
  onImgSelected(event: any) {
    const file: File = event.target.files[0];
    console.log("Kiválasztott fájl:", file);
  
    if (file && file.type.startsWith('image/')) {
      this.selectedImg = file;
      console.log("Kép sikeresen beállítva:", file.name);
    } else {
      this.selectedImg = null;
      console.warn('Hibás fájltípus:', file?.type);
    }
  }
}
