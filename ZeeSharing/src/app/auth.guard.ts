import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth'; // Firebase auth importálása
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  private auth = inject(Auth); // Auth injectálása
  private router = inject(Router); // Router injectálása

  canActivate(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        if (user) {
          observer.next(true); // Ha be van jelentkezve, engedélyezzük az útvonalat
        } else {
          this.router.navigate(['/login']); // Ha nincs bejelentkezve, átirányítás a login oldalra
          observer.next(false);
        }
        observer.complete();
        unsubscribe();
      });
    });
  }
}
