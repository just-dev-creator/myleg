import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {CookieService} from "ngx-cookie-service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  subject: string | undefined;
  subjects: any[] | undefined;
  files: any[] | undefined;

  constructor(private cookies: CookieService, private http: HttpClient, public auth: AuthService,
              private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.getSubjects()?.subscribe(
      (res) => {
        this.subjects = res.data;
      }
    )
  }

  getSubjects(): Observable<any> | undefined {
    if (!this.cookies.check('login')) return undefined;
    return this.http.get<any>('/api/documents?group=' + this.auth.getGroupToken(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cookies.get('login')}`
      }
    });
  }

  getFiles(): Observable<any> | undefined {
    if (!this.cookies.check('login')) return undefined;
    return this.http.get<any>('/api/documents?group=' + this.auth.getGroupToken() + '&subject=' + this.subject, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cookies.get('login')}`
      }
    });
  }

  setSubject(subject: string) {
    this.subject = subject;
    this.getFiles()?.subscribe(
      (res) => {
        const res_files = res.data;
        res_files.shift();
        this.files = res_files;
      }
    )
  }

  download(file: string) {
    this.http.get<any>('/api/documents?group=' + this.auth.getGroupToken() + '&subject=' + this.subject +
      '&file=' + file, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cookies.get('login')}`
      }
    }).subscribe(
      (res) => {
        // @ts-ignore
        window.open(res.data.signedURL.toString(), '_blank').focus();
      }
    );
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name)
      const upload$ = this.http.post<any>('/api/upload?group=' + this.auth.getGroupToken() + "&subject=" +
        this.subject, formData, {
        headers: {
          Authorization: `Bearer ${this.cookies.get('login')}`
        }});
      upload$.subscribe((res) => {
        if (res.status === 'success') {
          this.snackbar.open("Datei erfolgreich hochgeladen! ", undefined, {
            duration: 3000
          })
          if (this.subject) this.setSubject(this.subject);
        }
      })
    }
  }

  getReadableDate(apiDate: string): string {
    const date: Date = new Date(apiDate);
    return date.toLocaleDateString('de-DE',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
