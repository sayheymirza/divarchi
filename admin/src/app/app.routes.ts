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
        path: 'action',
        loadComponent: ()=> import('./routes/action.component').then(m => m.ActionComponent)
    },
    {
        path: 'host',
        loadComponent: ()=> import('./routes/host.component').then(m => m.HostComponent)
    },
    {
        path: '**',
        redirectTo: '/request',
    },
];
