import { NgForOf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-filter-request',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, NgForOf],
  template: `
    <section class="flex flex-col gap-2 p-4">
      <strong>Filter requests</strong>
    </section>
    <form [formGroup]="filter" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t border-b md:w-[600px] max-h-[600px] overflow-y-scroll">
      <!-- host -->
      <label class="form-control">
        <span>Host</span>

        <select formControlName="host">
          <option value="">All</option>
          <option *ngFor="let host of values.host" [value]="host">
            {{host}}
          </option>
        </select>
      </label>

      <!-- blocked (0, 1) -->
      <label class="form-control">
        <span>Blocked</span>

        <select formControlName="blocked">
          <option value="">All</option>
          <option [value]="0">No</option>
          <option [value]="1">Yes</option>
        </select>
      </label>

      <!-- method -->
      <label class="form-control">
        <span>Method</span>

        <select formControlName="method">
          <option value="">All</option>
          <option *ngFor="let method of values.method" [value]="method">
            {{method}}
          </option>
        </select>
      </label>

      <!-- path -->
      <label class="form-control">
        <span>Path</span>

        <select formControlName="path">
          <option value="">All</option>
          <option *ngFor="let path of values.path" [value]="path">
            {{path}}
          </option>
        </select>
      </label>

      <!-- ip -->
      <label class="form-control">
        <span>IP</span>

        <select formControlName="ip">
          <option value="">All</option>
          <option *ngFor="let ip of values.ip" [value]="ip">
            {{ip}}
          </option>
        </select>
      </label>

      <!-- network -->
      <label class="form-control">
        <span>Network</span>

        <select formControlName="network">
          <option value="">All</option>
          <option *ngFor="let network of values.network" [value]="network">
            {{network}}
          </option>
        </select>
      </label>

      <!-- isp -->
      <label class="form-control">
        <span>ISP</span>

        <select formControlName="isp">
          <option value="">All</option>
          <option *ngFor="let isp of values.isp" [value]="isp">
            {{isp}}
          </option>
        </select>
      </label>

      <!-- ispType -->
      <label class="form-control">
        <span>ISP Type</span>

        <select formControlName="ispType">
          <option value="">All</option>
          <option *ngFor="let ispType of values.ispType" [value]="ispType">
            {{ispType}}
          </option>
        </select>
      </label>

      <!-- country -->
      <label class="form-control">
        <span>Country</span>

        <select formControlName="country">
          <option value="">All</option>
          <option *ngFor="let country of values.country" [value]="country">
            {{country}}
          </option>
        </select>
      </label>

      <!-- city -->
      <label class="form-control">
        <span>City</span>

        <select formControlName="city">
          <option value="">All</option>
          <option *ngFor="let city of values.city" [value]="city">
            {{city}}
          </option>
        </select>
      </label>

      <!-- referer -->
      <label class="form-control col-span-2">
        <span>Referer</span>

        <select formControlName="referer">
          <option value="">All</option>
          <option *ngFor="let referer of values.referer" [value]="referer">
            {{referer}}
          </option>
        </select>
      </label>

      <!-- os -->
      <label class="form-control">
        <span>OS</span>

        <select formControlName="os">
          <option value="">All</option>
          <option *ngFor="let os of values.os" [value]="os">
            {{os}}
          </option>
        </select>
      </label>

      <!-- browser -->
      <label class="form-control">
        <span>Browser</span>

        <select formControlName="browser">
          <option value="">All</option>
          <option *ngFor="let browser of values.browser" [value]="browser">
            {{browser}}
          </option>
        </select>
      </label>

      <!-- device -->
      <label class="form-control">
        <span>Device</span>

        <select formControlName="device">
          <option value="">All</option>
          <option *ngFor="let device of values.device" [value]="device">
            {{device}}
          </option>
        </select>
      </label>

      <!-- platform -->
      <label class="form-control">
        <span>Platform</span>

        <select formControlName="platform">
          <option value="">All</option>
          <option *ngFor="let platform of values.platform" [value]="platform">
            {{platform}}
          </option>
        </select>
      </label>
    </form>

    <section class="flex flex-nowrap items-center justify-end gap-2 p-3">
      <button (click)="reset()" mat-icon-button>
        <mat-icon>refresh</mat-icon>
      </button>

      <div class="flex-1"></div>

      <button (click)="close()" mat-button>
        Close
      </button>

      <button (click)="submit()" mat-flat-button color="primary">
        Apply
      </button>
    </section>
  `,
  styles: ``
})
export class DialogFilterRequestComponent {
  public filter = new FormGroup({
    host: new FormControl(''),
    blocked: new FormControl(''),
    method: new FormControl(''),
    path: new FormControl(''),
    ip: new FormControl(''),
    network: new FormControl(''),
    isp: new FormControl(''),
    ispType: new FormControl(''),
    country: new FormControl(''),
    city: new FormControl(''),
    referer: new FormControl(''),
    os: new FormControl(''),
    browser: new FormControl(''),
    device: new FormControl(''),
    platform: new FormControl(''),
  });

  public values: any = {};
 
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private ref: MatDialogRef<DialogFilterRequestComponent>
  ) {}

  ngOnInit() {
    this.filter.patchValue(this.data.values);
    this.values = this.data.filters;    
  }

  public close() {
    this.ref.close();
  }

  public submit() {
    this.ref.close(this.filter.value);
  }

  public reset() {
    this.filter.patchValue({
      host: '',
      blocked: '',
      method: '',
      path: '',
      ip: '',
      network: '',
      isp: '',
      ispType: '',
      country: '',
      city: '',
      referer: '',
      os: '',
      browser: '',
      device: '',
      platform: '',
    })
  }
}
