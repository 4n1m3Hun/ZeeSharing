import { Routes } from '@angular/router';
import { LoginComponent } from './comps/login/login.component';
import { DashboardComponent } from './comps/dashboard/dashboard.component';
import { RegisterComponent } from './comps/register/register.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

