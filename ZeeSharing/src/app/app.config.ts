import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { AuthGuard } from './auth.guard'; 
import { provideStorage, getStorage } from '@angular/fire/storage'; // Firebase Storage importálása
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const firebaseConfig = {
  apiKey: "AIzaSyD0YhsRRNmsdIon2QEAff_L3Ixqm4ckmyk",
    authDomain: "zeesharing-d33f2.firebaseapp.com",
    projectId: "zeesharing-d33f2",
    storageBucket: "zeesharing-d33f2.appspot.com",
    messagingSenderId: "543231526802",
    appId: "1:543231526802:web:5e50c19b8f861e7918234b"
};


export const appConfig: ApplicationConfig = {
  
  providers: [
    provideRouter(routes), 
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideClientHydration(), 
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    AuthGuard,
  ]
};
