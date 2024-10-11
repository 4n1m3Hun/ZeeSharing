/*import { Component } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Egy tömbbe kell tenni az importokat
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError: string = '';

  constructor(private firestore: Firestore, private router: Router, private auth: Auth) {}

  async onLogin() {
    const usersCollection = collection(this.firestore, 'Users');
    const q = query(usersCollection, where('email', '==', this.email), where('password', '==', this.password));

    if(await signInWithEmailAndPassword(this.auth, this.email, this.password)){
      // Sikeres bejelentkezés, átirányítás a főoldalra
      console.log("okés");
      console.log(await this.router.navigate(['dashboard']));
      //this.router.navigate(['dashboard']);
    }
      
    this.loginError = 'Hibás email vagy jelszó!';
    
    const querySnapshot = await getDocs(q);
  }
}*/
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { signInWithEmailAndPassword } from '@angular/fire/auth';

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
      // Bejelentkezés a Firebase Auth használatával
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      
      // Sikeres bejelentkezés, átirányítás a főoldalra
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      // Hibás email vagy jelszó üzenet beállítása
      this.loginError = 'Wrong email or pasword!';
      // Ha nem szeretnél hibát a konzolra írni, itt ne használd a console.error-t
    }
  }
}


