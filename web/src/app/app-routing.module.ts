import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GetGroupComponent} from "./get-group/get-group.component";
import {LoginComponent} from "./login/login.component";
import {AuthGuardService} from "./auth-guard.service";

const routes: Routes = [
  {
    path: '',
    component: GetGroupComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
