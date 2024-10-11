import { TestBed } from '@angular/core/testing';
import { CanActivate } from '@angular/router';
import { AuthGuard } from './auth.guard'; // Használj AuthGuard-ot

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard], // AuthGuard hozzáadása a teszteléshez
    });
    guard = TestBed.inject(AuthGuard); // AuthGuard injektálása
  });

  it('should be created', () => {
    expect(guard).toBeTruthy(); // Ellenőrizd, hogy a guard létrejön
  });
});
/*import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth'; // Auth importálása
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: Auth, useValue: jasmine.createSpyObj('Auth', ['onAuthStateChanged']) }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});*/
