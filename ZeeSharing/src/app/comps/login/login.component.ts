import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { signInWithEmailAndPassword} from '@angular/fire/auth';
import { sendPasswordResetEmail} from '@angular/fire/auth';


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

  constructor(private router: Router, private auth: Auth) {}

  async onLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      
      await this.router.navigate(['/dashboard']);
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


