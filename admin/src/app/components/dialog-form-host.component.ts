import { NgForOf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dialog-form-host',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, NgForOf],
  template: `
    <section class="flex flex-nowrap items-center justify-between gap-2 p-4">
      <strong>Host</strong>
    </section>

    <section class="flex flex-col gap-4 p-4 border-t border-b w-[600px] max-h-[600px] overflow-y-scroll">
      <!-- host -->
      <label class="form-control">
        <span>Host</span>

        <input [(ngModel)]="form.host" placeholder="https://example.com" />
      </label>

      <!-- action select box -->
      <label class="form-control">
        <span>Action</span>

        <select [(ngModel)]="form.action">
          <option *ngFor="let action of actions" [value]="action.id">{{ action.name }}</option>
        </select>
      </label>

      <div class="p-2 rounded-xl bg-black/5 text-sm">
        Default action when no action is matched.
      </div>
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
export class DialogFormHostComponent {
  public form: any = {
    host: ""
  }

  public actions: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private ref: MatDialogRef<DialogFormHostComponent>,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.fetchActions();

    if (this.data) {
      this.form = {
        host: this.data.host,
        action: this.data.action
      }
    }
  }

  private fetchActions() {
    this.apiService.actions().subscribe({
      next: (res) => {
        this.actions = res.data;
      }
    })
  }

  public close() {
    this.ref.close();
  }

  public submit() {
    this.ref.close(
      {
        host: this.form.host,
        action: this.form.action
      }
    );
  }
}
