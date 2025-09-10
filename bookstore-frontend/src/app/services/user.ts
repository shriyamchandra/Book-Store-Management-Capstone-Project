import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProfileDto {
  email: string;
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  country: string;
  pincode: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(this.apiUrl, { headers: this.headers() });
  }

  updateProfile(profile: ProfileDto): Observable<ProfileDto> {
    return this.http.put<ProfileDto>(this.apiUrl, profile, { headers: this.headers() });
  }
}

