import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { signInWithEmailAndPassword} from '@angular/fire/auth';
import { sendPasswordResetEmail} from '@angular/fire/auth';
import { UserService } from '../../user.service';
import { Firestore, collection,where, doc, setDoc, getDoc, query} from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  email: string = '';
  password: string = '';
  loginError: string = '';
  uname: string = '';

  isOnline: boolean = true;
  
  private auth = inject(Auth);
  private firestore = inject(Firestore)

  constructor(private router: Router,private userService: UserService) {
    
  }
  ngOnInit() {
    this.isOnline = navigator.onLine; // ✅ Ellenőrizd az aktuális állapotot az elején
    //console.log(this.isOnline ? "🌍 Online" : "🚫 Offline");

    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }
  updateOnlineStatus(status: boolean) {
    this.isOnline = status;
    //console.log('🌐 Network status changed:', status ? 'Online' : 'Offline');
  }

  async onLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const userDocRef = doc(this.firestore, 'Users', this.email)
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const udata = userDocSnapshot.data();
        this.userService.setUserData(userCredential.user, udata['username'],  udata['picture'] , udata['type']);
        await this.router.navigate(['/main'], { replaceUrl: true });
      }
      
      
    } catch (error) {
      this.loginError = 'Wrong email or pasword!';
    }
  }
  async onForgotPassword() {
    if (!this.email) {
      this.loginError = "Please enter your email address.";
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.loginError = "A password reset link has been sent to your email!";
    } catch (error: any) {
      this.loginError = "Failed to send reset email. Please try again.";
    }
  }
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  navigateOfflineMain() {
    this.router.navigate(['/offline-main']);
  }
}
