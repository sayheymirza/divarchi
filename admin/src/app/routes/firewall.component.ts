import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from "@angular/material/table";
import { MatChipsModule } from "@angular/material/chips";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from "@angular/material/paginator";
import { ApiService } from '../services/api.service';
import { DialogFormFirewallComponent } from '../components/dialog-form-firewall.component';
import { DialogFilterFirewallComponent } from '../components/dialog-filter-firewall.component';

@Component({
  selector: 'app-firewall',
  standalone: true,
  imports: [MatTableModule, MatChipsModule, MatIconModule, MatButtonModule, MatPaginatorModule, NgClass],
  template: `
     <section class="flex flex-nowrap items-center gap-2 px-4 py-2 border-b overflow-x-scroll overflow-y-hidden scrollbar-none">
     <mat-chip-set class="flex-1">
        <mat-chip (click)="openFormDialog()">
          <mat-icon>add</mat-icon>
          <span>New Role</span>
        </mat-chip>

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
        <span class="text-xs whitespace-pre">Total: {{total}}</span>
      }
    </section>

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

        <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>
              <strong>ROLES</strong>
            </th>

            <td mat-cell *matCellDef="let element">
              <span class="whitespace-pre">
                {{formatRoles(element['roles'])}}
              </span>
            </td>
          </ng-container>

        <ng-container matColumnDef="automaticDuplicate">
            <th mat-header-cell *matHeaderCellDef>
              <strong>AUTOMATIC DUPLICATE</strong>
            </th>

            <td mat-cell *matCellDef="let element">
              <span class="whitespace-pre">
                <mat-icon>{{ element['automaticDuplicate'] ? 'done' : 'close' }}</mat-icon>
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="automaticBlockIP">
            <th mat-header-cell *matHeaderCellDef>
              <strong>AUTOMATIC BLOCK IP</strong>
            </th>

            <td mat-cell *matCellDef="let element">
              <span class="whitespace-pre">
                <mat-icon>{{ element['automaticBlockIP'] ? 'done' : 'close' }}</mat-icon>
              </span>
            </td>
          </ng-container>

        <ng-container matColumnDef="options">
            <th mat-header-cell *matHeaderCellDef class="w-[160px]">
              <strong></strong>
            </th>

            <td mat-cell *matCellDef="let element" class="w-[160px]">
              <button (click)="openFormDialog({  roles: element.roles, action: element.action })" mat-icon-button>
                <mat-icon>content_copy</mat-icon>
              </button>

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

    <section class="border-t">
      <mat-paginator 
        [length]="total"
        [pageSize]="limit"
        [pageIndex]="page - 1"
        (page)="page = $event.pageIndex + 1; fetch()"
      >
      </mat-paginator>
    </section>
  `,
    host: {
      class: 'flex flex-col h-full w-full'
    }
})
export class FirewallComponent {
  public total: number = -1;
  public limit: number = 20;
  public page: number = 1;
  public last: number = 1;
  public data: any[] = [];
  public columns: string[] = ['id', 'host', 'roles', 'automaticDuplicate', 'automaticBlockIP', 'options'];

  public get filters(): any[] {
    return Object.keys(this.filter).map((key) => {
      let value = this.filter[key];

      if (value == '0' || value == '1') {
        value = value == '1' ? 'Yes' : 'No';
      }

      if(key == 'roles') {
        value = value.map((role: any) => {
          return `${role.key}=${role.value}`;
        }).join(' & ');
      }

      return {
        key: key.slice(0, 1).toUpperCase() + key.slice(1),
        value,
      }
    }).filter((item) => item.value && item.value.length > 0);
  }

  private filter: any = {}
    
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetch();
  }

  public formatRoles(roles: string) {
    return JSON.parse(roles).map((role: any) => {
      return `${role.key}=${role.value}`;
    }).join(' & ');
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

  public openFilterDialog() {
    this.dialog.open(DialogFilterFirewallComponent, {
      data: this.filter,
    }).afterClosed().subscribe((res) => {
      if (res) {
        for (let key in res) {
          if (res[key].length > 0) {
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

  public delete(id: string) {
    if(confirm('Are you sure?')) {
      this.apiService.deleteRole(id).subscribe(() => {
        this.fetch();
      });
    }
  }

  public fetch() {
    console.log(this.filter);
    
    this.apiService.roles({
      filter: this.filter,
      limit: this.limit,
      page: this.page,
    }).subscribe((res: any) => {
      if(res.status) {
        this.data = res.data;
        this.total = res.meta.total;
      }
    })
  }
}
