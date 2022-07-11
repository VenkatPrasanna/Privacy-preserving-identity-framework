import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  constructor(private http: HttpClient) {}

  async getKey() {
    let key = this.http.get('http://localhost:8000/keys/genkey');
    return firstValueFrom(key);
  }

  async submitNewKey(data: any) {
    return this.http.post('http://localhost:8000/keys/addkey', data, {
      observe: 'response',
    });
  }

  async getAllKeys() {
    return this.http.get('http://localhost:8000/keys/allkeys');
  }

  // async getKeyOfData(dataid: string) {
  //   let params = new HttpParams();
  //   params = params.append('dataid', dataid);
  //   let key = this.http.get('http://localhost:8000/keys/allkeys');
  //   console.log(firstValueFrom(key));
  // }
}
