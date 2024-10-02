// src/app/holiday.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private apiKey = 'kVm1Xfo8uZuIwcTZoFRNGw9ItTdL0hYZ'; // Your API key
  private apiURL = `https://calendarific.com/api/v2/holidays?&api_key=${this.apiKey}&country=CH&year=2024`;

  constructor(private http: HttpClient) {}

  getHolidays(): Observable<any[]> {
    return this.http.get<any>(this.apiURL).pipe(map(data => data.response.holidays));
  }
}

