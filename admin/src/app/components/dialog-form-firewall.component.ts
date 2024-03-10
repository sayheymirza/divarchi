import { NgForOf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-form-firewall',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, NgForOf],
  template: `
    <section class="flex flex-nowrap items-center justify-between gap-2 p-4">
      <strong>Firewall role</strong>

        <button (click)="add()" mat-icon-button>
          <mat-icon>add</mat-icon>
        </button>
      
    </section>

    <section class="flex flex-col gap-4 border-t border-b w-[600px] max-h-[600px] overflow-y-scroll">
      @if(roles.length == 0) {
        <p class="text-center my-10">No roles</p>
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
  public keys: string[] = ['method', 'path', 'host', 'ip', 'network', 'isp', 'ispType', 'country', 'city', 'referer', 'os', 'browser', 'device', 'screen'];


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private ref: MatDialogRef<DialogFormFirewallComponent>
  ) {}

  ngOnInit() {
    const { roles } = this.data;

    if(roles) {
      this.roles = roles.split(',').map((role: string) => {
        let [key, value] = role.split('=');
        return { key, value };
      });
    }

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
      this.roles,
    );
  }

}

interface IRole {
  key: string;
  value: string;
}
