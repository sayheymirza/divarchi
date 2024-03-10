import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from "@angular/material/table";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from "@angular/material/button";
import { ApiService } from '../services/api.service';
import { DialogFilterRequestComponent } from '../components/dialog-filter-request.component';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [MatTableModule, MatChipsModule, MatIconModule, MatButtonModule, NgClass],
  template: `
    <section class="flex flex-nowrap items-center gap-2 px-4 py-2 border-b">
     <mat-chip-set class="flex-1">
        <mat-chip (click)="openFilterDialog()">
          <mat-icon>filter_alt</mat-icon>
          <span>Filters</span>
        </mat-chip>

        @for (item of filters; track $index) {
          <mat-chip>
            <span>{{item.key}}: {{item.value}}</span>
            <mat-icon (click)="removeFilter(item.key)">close</mat-icon>
          </mat-chip>
        }

      </mat-chip-set>

      @if(total != -1) {
        <span class="text-xs">Total: {{total}}</span>

        <button (click)="delete()" class="ml-2" mat-icon-button>
          <mat-icon>delete</mat-icon>
        </button>

        <button (click)="download()" class="ml-2" mat-icon-button>
          <mat-icon>download</mat-icon>
        </button>

        <button (click)="fetch()" class="ml-2" mat-icon-button>
          <mat-icon>refresh</mat-icon>
        </button>
      }
    </section>

    <section class="flex-1 overflow-scroll">
      <table class="w-full" mat-table [dataSource]="data">

        @for (item of columns; track $index) {
          <ng-container [matColumnDef]="item">
            <th mat-header-cell *matHeaderCellDef>
              <strong>{{item.toUpperCase()}}</strong>
            </th>

            <td mat-cell *matCellDef="let element">
              <span class="whitespace-pre">
                {{element[item]}} 
              </span>
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"
          [ngClass]="{
            '!bg-red-200': row.blocked == 1,
            '!bg-green-200': row.blocked == 0,
          }"
        ></tr>
      </table>
    </section>
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class RequestComponent {
  public total: number = -1;
  public data: any[] = [];
  public columns: string[] = ['id', 'method', 'path', 'host', 'ip', 'network', 'isp', 'ispType', 'country', 'city', 'lat', 'lon', 'referer', 'os', 'browser', 'device', 'screen', 'requestedAt', 'responsedAt', 'userAgent'];

  public get filters(): any[] {
    return Object.keys(this.filter).map((key) => {
      let value = this.filter[key];

      if(value == '0' || value == '1') {
        value = value == '1' ? 'Yes' : 'No';
      }
    

      return {
        key: key.slice(0, 1).toUpperCase() + key.slice(1),
        value,
      }
    }).filter((item) => item.value && item.value.length > 0);
  }

  private filter: any = {}
  private availableFilters: any = {}
  
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetch();
  }

  public openFilterDialog() {
    this.dialog.open(DialogFilterRequestComponent, {
      data: {
        values: this.filter,
        filters: this.availableFilters
      }
    }).afterClosed().subscribe((res) => {
      if(res) {
        for(let key in res) {
          if(res[key].length > 0) {
            this.filter[key] = res[key];
          }
        }

        this.fetch();
      }
    });
  }

  public removeFilter(key: string) {
    key = key.slice(0, 1).toLowerCase() + key.slice(1);

    delete this.filter[key];
    
    this.fetch();
  }

  public fetch() {
    this.apiService.requests(this.filter).subscribe((res: any) => {
      if(res.status) {
        this.data = res.data;
        this.total = res.meta.total;
        this.availableFilters = res.meta.filters;
      }
    })
  }

  public delete() {
    if(confirm('Are you sure?')) {
      this.apiService.deleteRequests().subscribe((res: any) => {
        if(res.status) {
          this.fetch();
        }
      })
    }
  }

  public download() {
    this.apiService.requests(this.filter).subscribe((res: any) => {
      if(res.status) {
        let csv = '';

        // add headers
        csv += res.data[0] ? Object.keys(res.data[0]).join(',') + '\n' : '';

        csv += res.data.map((item: any) => {
          return Object.keys(item).map((key) => item[key]).join(',');
        }).join('\n');

        let blob = new Blob([csv], { type: 'text/csv' });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = `requests-${Date.now()}.csv`
        a.click();
        window.URL.revokeObjectURL(url);
      }
    })
  }
}
