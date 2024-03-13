import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpService: HttpService
  ) { }

  public login() {
    return this.httpService.request<any>({
      method: 'POST',
      path: '/api/v1/access',
    });
  }

  public requests(params: any = {}) {
    return this.httpService.request<any>({
      method: 'POST',
      path: `/api/v1/request`,
      data: params,
    })
  }

  public deleteRequests() {
    return this.httpService.request<any>({
      method: 'DELETE',
      path: `/api/v1/request`,
    })
  }

  public hosts() {
    return this.httpService.request<any>({
      method: 'GET',
      path: '/api/v1/host',
    })
  }

  public addHost(params: any) {
    return this.httpService.request<any>({
      method: 'POST',
      path: '/api/v1/host',
      data: params,
    })
  }

  public deleteHost(id: string) {
    return this.httpService.request<any>({
      method: 'DELETE',
      path: `/api/v1/host/${id}`,
    })
  }

  public updateHost(id: string, params: any) {
    return this.httpService.request<any>({
      method: 'PUT',
      path: `/api/v1/host/${id}`,
      data: params,
    })
  }

  // action
  public actions() {
    return this.httpService.request<any>({
      method: 'GET',
      path: '/api/v1/action',
    })
  }

  public addAction(params: any) {
    return this.httpService.request<any>({
      method: 'POST',
      path: '/api/v1/action',
      data: params,
    })
  }

  public deleteAction(id: string) {
    return this.httpService.request<any>({
      method: 'DELETE',
      path: `/api/v1/action/${id}`,
    })
  }

  public updateAction(id: string, params: any) {
    return this.httpService.request<any>({
      method: 'PUT',
      path: `/api/v1/action/${id}`,
      data: params,
    })
  }

  // firewall
  public roles(params: any = {}) {
    return this.httpService.request<any>({
      method: 'GET',
      path: '/api/v1/firewall',
    })
  }

  public addRole(params: any) {
    return this.httpService.request<any>({
      method: 'POST',
      path: '/api/v1/firewall',
      data: params,
    })
  }

  public deleteRole(id: string) {
    return this.httpService.request<any>({
      method: 'DELETE',
      path: `/api/v1/firewall/${id}`,
    })
  }

  public updateRole(id: string, params: any) {
    return this.httpService.request<any>({
      method: 'PUT',
      path: `/api/v1/firewall/${id}`,
      data: params,
    })
  }
}
