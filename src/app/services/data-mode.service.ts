import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataModeService {
  private useMockDataSubject = new BehaviorSubject<boolean>(true);
  useMockData$ = this.useMockDataSubject.asObservable();

  constructor() {
    // Initialize from environment
    this.useMockDataSubject.next(environment.useMockData);
  }

  toggleDataMode() {
    const currentValue = this.useMockDataSubject.value;
    this.useMockDataSubject.next(!currentValue);
  }

  isUsingMockData(): boolean {
    return this.useMockDataSubject.value;
  }
} 