import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GetGroupComponent} from "./get-group/get-group.component";
import {LoginComponent} from "./login/login.component";
import {AuthGuardService} from "./auth-guard.service";
import {CovidComponent} from "./covid/covid.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {DocumentsComponent} from "./documents/documents.component";

const routes: Routes = [
  {
    path: 'plan',
    component: GetGroupComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'covid',
    component: CovidComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'docs',
    component: DocumentsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
