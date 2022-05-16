import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GetGroupComponent } from './get-group/get-group.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { SubstitutionComponent } from './substitution/substitution.component';
import * as firebase from "firebase/app"
import {environment} from "../environments/environment";
import { LoginComponent } from './login/login.component';
import {CookieService} from "ngx-cookie-service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import { AccountComponent } from './account/account.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatCardModule} from "@angular/material/card";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { CovidComponent } from './covid/covid.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotificationsComponent } from './notifications/notifications.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { DocumentsComponent } from './documents/documents.component';

firebase.initializeApp(environment.firebase)

@NgModule({
  declarations: [
    AppComponent,
    GetGroupComponent,
    SubstitutionComponent,
    LoginComponent,
    AccountComponent,
    CovidComponent,
    DashboardComponent,
    NotificationsComponent,
    DocumentsComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatSnackBarModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        ReactiveFormsModule
    ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
