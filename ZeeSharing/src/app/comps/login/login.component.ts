import { Component } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError: string = '';
  uname: string = '';

  constructor(private firestore: Firestore, private router: Router, private auth: Auth, private userService: UserService) {}

  async onLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      
      const userDocRef = doc(this.firestore, 'Users', this.email)
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const udata = userDocSnapshot.data();
        this.userService.setUserData(userCredential.user, udata['username'],  udata['picture'] , udata['type']);
      await this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
      
      
    } catch (error) {
      this.loginError = 'Wrong email or pasword!';
    }
  }
  navigateToRegister() {
    this.router.navigate(['/register']);
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
}


