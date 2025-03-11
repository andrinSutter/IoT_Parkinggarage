import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HolidayComponent } from './holiday/holiday.component';
import { MqttService } from './services/mqtt.service'; // Correct import path
import { IMqttMessage } from 'ngx-mqtt';
import { BarrierEntryComponent } from './barrier-entry/barrier-entry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HolidayComponent, BarrierEntryComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  receiveNews: any; // For holding the full message
  analogValue: number | undefined; // For holding extracted property
  isConnection = false;
  subscribeSuccess = false;

  private messageSub: Subscription | undefined;
  private connectionSub: Subscription | undefined;

  constructor(private mqttService: MqttService) {}

  ngOnInit(): void {
    this.createConnection();
    this.messageSub = this.mqttService.message$.subscribe((message) => {
      this.receiveNews = message;
      this.analogValue = message.uplink_message.decoded_payload.analog_in_1; // Extract specific properties as needed
    });
    this.connectionSub = this.mqttService.isConnected$.subscribe(
      (connected) => {
        this.isConnection = connected;
      }
    );
  }

  createConnection() {
    this.mqttService.createConnection();
  }

  doPublish() {
    const topic =
      'v3/app-iot-wuerfel-klassensatz-b@ttn/devices/eui-2024-c-44/down/push';
    const payload = JSON.stringify({
      downlinks: [
        {
          f_port: 1,
          frm_payload: 'AQ==',
          confirmed: true,
        },
      ],
    });
    const qos = 0;
    this.mqttService.doPublish(topic, payload, qos);
    console.log(this.doPublish)
  }

  doSubscribe() {
    const topic =
      'v3/app-iot-wuerfel-klassensatz-b@ttn/devices/eui-2024-c-44/up';
    const qos = 0;
    this.mqttService
      .doSubscribe(topic, qos)
      .subscribe((message: IMqttMessage) => {
        this.subscribeSuccess = true;
        console.log('Subscribe to topics res', message.payload.toString());
      });
  }

  destroyConnection() {
    this.mqttService.destroyConnection();
  }

  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
    if (this.connectionSub) {
      this.connectionSub.unsubscribe();
    }
  }
}
