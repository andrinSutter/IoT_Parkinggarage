import { Component, OnInit } from '@angular/core';
import { HolidayService } from '../services/holiday.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holiday',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './holiday.component.html',
  styleUrl: './holiday.component.css'
})
export class HolidayComponent implements OnInit{
  holidays: any[] = [];
  todayHoliday: any = null;
  isHolidayToday: boolean = false;

  constructor(private holidayService: HolidayService) {}

  ngOnInit(): void {
    this.holidayService.getHolidays().subscribe((data) => {
      this.holidays = data;
      const today = new Date().toISOString().split('T')[0];

      // Check if today is a holiday
      for (let holiday of this.holidays) {
        if (holiday.date.iso === today) {
          this.todayHoliday = holiday;
          this.isHolidayToday = true;
          break;
        }
      }
    })
  }
}
