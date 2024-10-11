import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { signInWithEmailAndPassword } from '@angular/fire/auth';
import { isEmpty } from 'rxjs';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  re_password: string = '';
  ac_type: string = '';
  registerError: string = '';

  constructor(private router: Router, private auth: Auth) {}

  async onRegister() {
    try {
      if(this.email.length === 0 || this.password.length === 0 || this.re_password.length === 0 ||this.ac_type.length === 0){
        this.registerError = "Please fill in all fields";
      }else if(this.password == this.re_password){
        const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        alert("Succesfull registration");
        const userCredential2 = await signInWithEmailAndPassword(this.auth, this.email, this.password);
        await this.router.navigate(['/dashboard']);
      }else{
        this.registerError = "The two passwords are not the same!";
      }
    } catch (error: any) {
      // Ellenőrzés, hogy az e-mail cím már létezik-e
      if (error.code === 'auth/email-already-in-use') {
        this.registerError = 'This email address is already in use!';
      } else {
        this.registerError = 'Registration failed! Please try again.';
      }

    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
