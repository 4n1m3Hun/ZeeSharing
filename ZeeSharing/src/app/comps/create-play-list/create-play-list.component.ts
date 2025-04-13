import { Component, OnInit} from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserService } from '../../user.service';
import { Firestore, collection, query, where, getDocs, doc, setDoc  } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-play-list',
  imports: [FormsModule],
  templateUrl: './create-play-list.component.html',
  styleUrl: './create-play-list.component.css'
})
export class CreatePlayListComponent implements OnInit{

  userData: any = null;
  playlistName: string = ''; // Az űrlap neve
  playlistType: string = ''; // Az űrlap típusa
  errorMessage: string = ''; // Hibaüzenet, ha már létezik

  constructor(private userService: UserService, private firestore: Firestore) {}

  ngOnInit(): void {
    this.userData = this.userService.getUserData();
  }

  async newPlayList(){
    if (!this.userData || !this.playlistName || !this.playlistType) {
      //this.errorMessage = "Please fill out all fields!";
      //console.log("Please fill out all fields!")
      return;
    }
    const playlistsCollection = collection(this.firestore, 'PlayLists');
    const playlistsQuery = query(
      playlistsCollection,
      where('user', '==', this.userData["username"]),
      where('title', '==', this.playlistName)
    );

    const querySnapshot = await getDocs(playlistsQuery);

    if (!querySnapshot.empty) {
      //this.errorMessage = "You already have a playlist with this name!";
      //console.log("You already have a playlist with this name!");
      return;
    }

    const newPlaylistRef = doc(this.firestore, 'PlayLists', `${this.userData["username"]}_${this.playlistName}`);
    await setDoc(newPlaylistRef, {
      user: this.userData["username"],
      title: this.playlistName,
      type: this.playlistType,
      createdAt: new Date(),
      songs: []
    });

    this.errorMessage = '';
    alert('Playlist created successfully!');
    this.playlistName = '';
    this.playlistType = '';
  }
}
