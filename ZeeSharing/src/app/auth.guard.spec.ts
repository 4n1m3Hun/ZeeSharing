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
