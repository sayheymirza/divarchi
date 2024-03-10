import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'firewall',
        loadComponent: ()=> import('./routes/firewall.component').then(m => m.FirewallComponent)
    },
    {
        path: 'request',
        loadComponent: ()=> import('./routes/request.component').then(m => m.RequestComponent)
    },
    {
        path: '**',
        redirectTo: '/request',
    },
];
