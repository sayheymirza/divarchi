import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from '@angular/forms';

import { HttpService } from './services/http.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, FormsModule],
  template: `
    @if(view === 'access') {
      <mat-toolbar color="primary" class="min-h-[64px] border-b">
        <strong class="me-8">Divarchi Admin</strong>
        
        <a routerLink="/request" mat-button>
          Requests
        </a>
        
        <a routerLink="/action" mat-button>
          Actions
        </a>

        <a routerLink="/host" mat-button>
          Hosts
        </a>
        
        <a routerLink="/firewall" mat-button>
          Firewall
        </a>
      </mat-toolbar>
      
      <router-outlet />
    }

    @if(view === 'auth') {

      <section class="m-auto w-[300px] flex flex-col gap-2">
        <!-- input -->
        <label class="form-control">
          <span>Access Token</span>
          
          <input [(ngModel)]="httpService.token" placeholder="Enter your access token" />
        </label>

        <br />

        <!-- button -->
        <button (click)="login()" mat-flat-button color="primary">Login</button>
      </section>
    }
  `,
  host: {
    class: 'flex flex-col h-full w-full bg-[var(--mat-app-background-color)]'
  }
})
export class AppComponent {
  public view: 'waiting' | 'auth' | 'access' = 'waiting';

  constructor(
    public httpService: HttpService,
    public apiService: ApiService
  ) {}

  ngOnInit() {
    // load token from local storage with key = #divarchi/token
    this.httpService.token = localStorage.getItem('#divarchi/token') ?? '';

    if(this.httpService.token.length == 0) {
      this.view = 'auth';
    } else {
      this.login();
    }
  }

  public login() {
    this.apiService.login().subscribe((res) => {
      if(res.status) {
        this.view = 'access';
        // store token in storage
        localStorage.setItem('#divarchi/token', this.httpService.token);
      } else {
        this.view = 'auth';
        // remove token from storage
        localStorage.removeItem('#divarchi/token');
      }
    });
  }
}
