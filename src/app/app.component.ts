import { Component, InjectionToken } from '@angular/core';
import {
  IMqttServiceOptions,
  MqttService,
  IPublishOptions,
  IMqttMessage,
} from 'ngx-mqtt';
import { IClientSubscribeOptions } from 'mqtt-browser';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HolidayComponent } from './holiday/holiday.component';
// MQTT server (ttn) Info
// Documentation: https://www.thethingsindustries.com/docs/integrations/mqtt/
// Public address: eu1.cloud.thethings.network:1883
// Username: app-iot-wuerfel-klassensatz-b@ttn

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HolidayComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  client: MqttService | undefined;

  constructor(private _mqttService: MqttService) {
    this.client = this._mqttService;
  }

  private curSubscription: Subscription | undefined;

  subscription = {
    topic: 'v3/app-iot-wuerfel-klassensatz-b@ttn/devices/eui-2024-c-26/up',
    qos: 0,
  };

  publish = {
    topic:
      'v3/app-iot-wuerfel-klassensatz-b@ttn/devices/eui-2024-c-26/down/push',
    qos: 0,
    payload: JSON.stringify({
      downlinks: [
        {
          f_port: 1,
          frm_payload: 'AQ==',
          confirmed: true,
        },
      ],
    }),
  };

  receiveNews = '';
  analogValue: number | undefined; // Change this to hold the analog value
  qosList = [
    { label: 0, value: 0 },
    { label: 1, value: 1 },
    { label: 2, value: 2 },
  ];
  isConnection = false;
  subscribeSuccess = false;

  // Create a connection
  createConnection() {
    console.log('Attempting to connect to MQTT Broker...');
    try {
      this.client?.connect();
    } catch (error) {
      console.log('mqtt.connect error', error);
    }

    this.client?.onConnect.subscribe(() => {
      this.isConnection = true;
      console.log('Connection succeeded!');
    });

    this.client?.onError.subscribe((error: any) => {
      this.isConnection = false;
      console.log('Connection failed', error);
    });

    this.client?.onMessage.subscribe((packet: IMqttMessage) => {
      const message = JSON.parse(packet.payload.toString());
      this.receiveNews = packet.payload.toString(); // Store the original message for context if needed
      this.analogValue = message.uplink_message.decoded_payload.analog_in_1; // Extract the specific analog value
      console.log('Analog Value:', this.analogValue);
    });
  }
  doPublish() {
    const { topic, qos, payload } = this.publish;
    console.log(this.publish);
    this.client?.unsafePublish(topic, payload, { qos } as IPublishOptions);
  }

  doSubscribe() {
    const { topic, qos } = this.subscription;
    this.curSubscription = this.client
      ?.observe(topic, { qos } as IClientSubscribeOptions)
      .subscribe((message: IMqttMessage) => {
        this.subscribeSuccess = true;
        console.log('Subscribe to topics res', message.payload.toString());
      });
  }
  destroyConnection() {
    try {
      this.client?.disconnect(true);
      this.isConnection = false;
      console.log('Successfully disconnected!');
    } catch (error: any) {
      console.log('Disconnect failed', error.toString());
    }
  }
}
