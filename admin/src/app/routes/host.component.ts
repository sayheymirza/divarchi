import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../services/api.service';
import { DialogFormHostComponent } from '../components/dialog-form-host.component';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, NgClass],
  template: `
  <section class="flex-1 overflow-scroll">
    <table class="w-full" mat-table [dataSource]="data">

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="w-[50px]">
            <strong>ID</strong>
          </th>

          <td mat-cell *matCellDef="let element" class="w-[50px]">
            <span class="whitespace-pre">
              {{element['id']}} 
            </span>
          </td>
        </ng-container>


      <ng-container matColumnDef="host">
          <th mat-header-cell *matHeaderCellDef>
            <strong>HOST</strong>
          </th>

          <td mat-cell *matCellDef="let element">
            <span class="whitespace-pre">
              {{element['host']}}
            </span>
          </td>
      </ng-container>

      <ng-container matColumnDef="options">
          <th mat-header-cell *matHeaderCellDef class="w-[120px]">
            <strong></strong>
          </th>

          <td mat-cell *matCellDef="let element" class="w-[120px]">
            <button (click)="openFormDialog(element)" mat-icon-button>
              <mat-icon>edit</mat-icon>
            </button>

            <button (click)="delete(element.id)" mat-icon-button color="warn">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"
        [ngClass]="{
          '!bg-red-200': row.blocked == true,
          '!bg-green-200': row.blocked == false,
        }"
      ></tr>
    </table>
  </section>

  <button (click)="openFormDialog()" mat-fab color="primary" class="!fixed bottom-4 right-4 gap-2 min-w-[128px]">
    <mat-icon>add</mat-icon>
    <span>New host</span>
  </button>
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class HostComponent {
  public total: number = -1;
  public data: any[] = [];
  public columns: string[] = ['id', 'host', 'options'];
    
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetch();
  }

  public openFormDialog(data: any = undefined) {
    this.dialog.open(DialogFormHostComponent, {
      data,
    }).afterClosed().subscribe((res) => {
      if(res) {
        // if in data we have id, then we are updating
        if(data && data.id) {
          this.apiService.updateHost(data.id, res).subscribe(() => {
            this.fetch();
          });
        } else {
          this.apiService.addHost(res).subscribe(() => {
            this.fetch();
          });
        }
      }
    });
  }

  public delete(id: string) {
    if(confirm('Are you sure?')) {
      this.apiService.deleteHost(id).subscribe(() => {
        this.fetch();
      });
    }
  }

  private fetch() {
    this.apiService.hosts().subscribe((res: any) => {
      if(res.status) {
        this.data = res.data;
        this.total = res.meta.total;
      }
    })
  }
}
