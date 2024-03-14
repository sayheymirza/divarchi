import { NgForOf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ApiService } from '../services/api.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-dialog-form-firewall',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatCheckboxModule, NgForOf],
  template: `
    <section class="flex flex-nowrap items-center justify-between gap-2 p-4">
      <strong>Firewall role</strong>

        <button (click)="add()" mat-icon-button>
          <mat-icon>add</mat-icon>
        </button>
      
    </section>

    <section class="flex flex-col gap-4 border-t border-b w-[600px] max-h-[600px] overflow-y-scroll">
      <div class="grid grid-cols-2 gap-4 border-b p-4">
        <!-- host -->
        <label class="form-control">
          <span>Host</span>

          <select [(ngModel)]="host">
            <option *ngFor="let item of hosts" [value]="item.host">
              {{item.host}}
            </option>
          </select>
        </label>

        <!-- action -->
        <label class="form-control">
          <span>Action</span>

          <select [(ngModel)]="action">
            <option *ngFor="let item of actions" [value]="item.id">
              {{item.name}}
            </option>
          </select>
        </label>

        <!-- automaticDuplicate -->
        <mat-checkbox [(ngModel)]="automaticDuplicate">
          Automatic duplicate
        </mat-checkbox>

        <!-- automaticBlockIP -->
        <mat-checkbox [(ngModel)]="automaticBlockIP">
          Automatic block IP
        </mat-checkbox>
      </div>

      @if(roles.length == 0) {
        <div class="flex flex-col items-center justify-center h-[100px]">
          <button (click)="add()" mat-button color="primary" class="gap-2 w-fit">
            <mat-icon>add</mat-icon>
            <span>Add role</span>
          </button>
        </div>
      } @else {
        @for (role of roles; track $index) {
          <div class="flex flex-nowrap items-center justify-between gap-2 px-4">
            <span>Role#{{$index+1}}</span>

            <button (click)="removeByIndex($index)" mat-icon-button color="warn">
              <mat-icon>delete</mat-icon>
            </button>
          </div>

          <div class="px-4 pb-2 grid grid-cols-2 gap-4 border-b last:border-transparent">
            <!-- key -->
            <label class="form-control">
              <span>Key</span>

              <select [(ngModel)]="role.key">
                <option *ngFor="let key of keys" [value]="key">
                  {{key}}
                </option>
              </select>
            </label>

            <!-- value: input -->
            <label class="form-control">
              <span>Value</span>

              <input [(ngModel)]="role.value" />
            </label>
          </div>
        }
      }
    </section>

    <section class="flex flex-nowrap items-center justify-end gap-2 p-3">
      <button (click)="close()" mat-button>
        Close
      </button>

      <button (click)="submit()" mat-flat-button color="primary">
        Submit
      </button>
    </section>
  `,
  styles: ``
})
export class DialogFormFirewallComponent {
  public roles: IRole[] = [];
  public keys: string[] = ['method', 'path', 'host', 'ip', 'network', 'isp', 'ispType', 'country', 'city', 'referer', 'os', 'browser', 'device', 'platform'];
  public actions: any[] = [];
  public hosts: any[] = [];
  public host: string = '';
  public action: number = -1;
  public automaticDuplicate: boolean = false;
  public automaticBlockIP: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private ref: MatDialogRef<DialogFormFirewallComponent>,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    if(this.data) {
      this.roles = JSON.parse(this.data.roles);
      this.host = this.data.host;
      this.action = this.data.action;
      this.automaticDuplicate = this.data.automaticDuplicate;
      this.automaticBlockIP = this.data.automaticBlockIP;
    }

    this.apiService.actions().subscribe((res) => {
      this.actions = res.data;
    });

    this.apiService.hosts().subscribe((res) => {
      this.hosts = res.data;
    });
  }

  public add() {
    this.roles.push({ key: '', value: '' });
  }

  public removeByIndex(index: number) {
    this.roles.splice(index, 1);
  }

  public close() {
    this.ref.close();
  }

  public submit() {
    this.ref.close(
      {
        host: this.host,
        action: this.action,
        roles: this.roles,
        automaticDuplicate: this.automaticDuplicate,
        automaticBlockIP: this.automaticBlockIP
      }
    );
  }

}

interface IRole {
  key: string;
  value: string;
}
