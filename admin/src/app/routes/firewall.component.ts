import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../services/api.service';
import { DialogFormFirewallComponent } from '../components/dialog-form-firewall.component';

@Component({
  selector: 'app-firewall',
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


        <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>
              <strong>ROLES</strong>
            </th>

            <td mat-cell *matCellDef="let element">
              <span class="whitespace-pre">
                {{element['roles'].split('|').join(' & ')}}
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
      <span>New role</span>
    </button>
  `,
    host: {
      class: 'flex flex-col h-full w-full'
    }
})
export class FirewallComponent {
  public total: number = -1;
  public data: any[] = [];
  public columns: string[] = ['id', 'roles', 'options'];
    
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetch();
  }

  public openFormDialog(data: any = undefined) {
    this.dialog.open(DialogFormFirewallComponent, {
      data,
    }).afterClosed().subscribe((res) => {
      if(res) {
        // if in data we have id, then we are updating
        if(data && data.id) {
          this.apiService.updateRole(data.id, res).subscribe(() => {
            this.fetch();
          });
        } else {
          this.apiService.addRole(res).subscribe(() => {
            this.fetch();
          });
        }
      }
    });
  }

  public delete(id: string) {
    if(confirm('Are you sure?')) {
      this.apiService.deleteRole(id).subscribe(() => {
        this.fetch();
      });
    }
  }

  private fetch() {
    this.apiService.firewall().subscribe((res: any) => {
      if(res.status) {
        this.data = res.data;
        this.total = res.meta.total;
      }
    })
  }
}
