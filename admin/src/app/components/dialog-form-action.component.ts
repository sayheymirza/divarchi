import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-form-action',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  template: `
    <section class="flex flex-nowrap items-center justify-between gap-2 p-4">
      <strong>Action</strong>
    </section>

    <section class="flex flex-col gap-4 p-4 border-t border-b w-[600px] max-h-[600px] overflow-y-scroll">
      <!-- name -->
      <label class="form-control">
        <span>Name</span>

        <input [(ngModel)]="form.name" placeholder="Give some name to this action" />
      </label>

      <!-- function select box = proxy, blank -->
      <label class="form-control">
        <span>Function</span>

        <select [(ngModel)]="form.function">
          <option value="proxy">Proxy</option>
          <option value="blank">Blank</option>
          <option value="redirect">Redirect</option>
        </select>
      </label>

      @if(form.function == "proxy" || form.function == "redirect")  {
        <!-- targetHost -->
        <label class="form-control">
          <span>Target host</span>

          <input type="url" [(ngModel)]="form.targetHost" placeholder="https://example.com" />
        </label>
      }

      <!-- checkbox: Enable x-divarchi-for in request header -->
      <mat-checkbox
        [(ngModel)]="form.xDivarchiFor"
      >
        Enable 'x-divarchi-for' in request header
      </mat-checkbox>

      @if(form.xDivarchiFor)  {
        <div class="p-2 rounded-xl bg-black/5 text-sm">
          We send some information that we've collected from request. This information is coded in base64 and sent in request header. This information can use for debugging and monitoring purposes.
        </div>
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
export class DialogFormActionComponent {
  public form: any = {
    name: "",
    function: "",
    targetHost: "",
    xDivarchiFor: false
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private ref: MatDialogRef<DialogFormActionComponent>
  ) {}

  ngOnInit() {
    if (this.data) {
      this.form = {
        name: this.data.name,
        function: this.data.function,
        targetHost: this.data.config.targetHost,
        xDivarchiFor: this.data.config.xDivarchiFor
      }
    }
  }

  public close() {
    this.ref.close();
  }

  public submit() {
    this.ref.close(
      {
        name: this.form.name,
        function: this.form.function,
        config: {
          targetHost: this.form.targetHost,
          xDivarchiFor: this.form.xDivarchiFor
        }
      }
    );
  }
}
