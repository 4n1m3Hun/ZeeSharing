import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserService } from '../../user.service';
import { Firestore, collection, query, where, getDocs,  updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCircle} from '@fortawesome/free-solid-svg-icons';

import { EventEmitter, Input, Output } from '@angular/core';

import { FriendService } from './friendservice';

@Component({
  selector: 'app-friends',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent implements OnInit{
  friends_data: any[] = [];
  firestore = inject(Firestore);
  userService = inject(UserService);
  userData: any = null;
  faCircle = faCircle;

  @Output() friend = new EventEmitter<string>();

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    
    this.getFriends();
  }

  async getFriends() {
    const friendListsCollection = collection(this.firestore, 'Friends');
  
    
    const friendListsQuery1 = query(friendListsCollection, where('User1', '==', this.userData['username']), where('type', '==', 'friend'));
    const friendSnapshot1 = await getDocs(friendListsQuery1);
  
    
    const friendListsQuery2 = query(friendListsCollection, where('User2', '==', this.userData['username']), where('type', '==', 'friend'));
    const friendSnapshot2 = await getDocs(friendListsQuery2);
  
    
    const friends: any[] = [];
    [...friendSnapshot1.docs, ...friendSnapshot2.docs].forEach(doc => {
      const friendData = doc.data();
    
      
      if (!friends.some(f => f.username === friendData["User1"])) {
        friends.push(friendData);
      }
    });
    
    for (let i = 0; i < friends.length; i++) {
      let friendUsername = friends[i]["User1"] !== this.userData['username'] ? friends[i]["User1"] : friends[i]["User2"];
      
      const friendListsCollection = collection(this.firestore, 'Users');
      const friendListsQuery1 = query(friendListsCollection, where('username', '==', friendUsername));
      const querySnapshot = await getDocs(friendListsQuery1);
      
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        this.friends_data.push({
          username: docSnapshot.data()['username'],
          img: docSnapshot.data()['img']
        });
      }
    }
  }
  sendUsername = "";
  friendClicked(uname: string){
    this.friendService.setUsername(uname);
    this.friend.emit(this.sendUsername);
  }
  getUsername() {
    return this.sendUsername;
  }
}
