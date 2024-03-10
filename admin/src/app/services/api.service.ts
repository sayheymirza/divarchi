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
      data: {
        accessToken: this.httpService.token
      }
    });
  }

  public requests(params: any = {}) {
    // convert params to query string
    let query = Object.keys(params).map(key => key + '=' + params[key]).join('&');

    return this.httpService.request<any>({
      method: 'GET',
      path: `/api/v1/request?${query}`,
      header: {
        'x-access-token': this.httpService.token
      }
    })
  }

  public firewall(params: any = {}) {
    return this.httpService.request<any>({
      method: 'GET',
      path: '/api/v1/firewall',
      header: {
        'x-access-token': this.httpService.token
      }
    })
  }

  public addRole(roles: string) {
    return this.httpService.request<any>({
      method: 'POST',
      path: '/api/v1/firewall',
      data: {
        roles
      },
      header: {
        'x-access-token': this.httpService.token
      }
    })
  }

  public deleteRole(id: string) {
    return this.httpService.request<any>({
      method: 'DELETE',
      path: `/api/v1/firewall/${id}`,
      header: {
        'x-access-token': this.httpService.token
      }
    })
  }

  public updateRole(id: string, roles: string) {
    return this.httpService.request<any>({
      method: 'PUT',
      path: `/api/v1/firewall/${id}`,
      data: {
        roles
      },
      header: {
        'x-access-token': this.httpService.token
      }
    })
  }
}
