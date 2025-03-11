// mqtt.service.ts
import { Injectable } from '@angular/core';
import {
  IMqttServiceOptions,
  MqttService as NgxMqttService,
  IPublishOptions,
  IMqttMessage,
} from 'ngx-mqtt';
import { Subject } from 'rxjs';
import { IClientSubscribeOptions } from 'mqtt-browser';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: NgxMqttService;
  private isConnected = new Subject<boolean>();
  public isConnected$ = this.isConnected.asObservable();
  private messageSubject = new Subject<any>(); // Subject to hold the full message
  public message$ = this.messageSubject.asObservable();

  constructor(private _mqttService: NgxMqttService) {
    this.client = this._mqttService;
  }

  createConnection() {
    console.log('Attempting to connect to MQTT Broker...');
    try {
      this.client.connect();
    } catch (error) {
      console.log('mqtt.connect error', error);
    }

    this.client.onConnect.subscribe(() => {
      this.isConnected.next(true);
      console.log('Connection succeeded!');
    });

    this.client.onError.subscribe((error: any) => {
      this.isConnected.next(false);
      console.log('Connection failed', error);
    });

    this.client.onMessage.subscribe((packet: IMqttMessage) => {
      const message = JSON.parse(packet.payload.toString());
      this.messageSubject.next(message); // Broadcast the full message
      console.log('Received Message:', message);
    });
  }

  doPublish(topic: string, payload: string, qos: number) {
    this.client.unsafePublish(topic, payload, { qos } as IPublishOptions);
  }

  doSubscribe(topic: string, qos: number) {
    return this.client.observe(topic, { qos } as IClientSubscribeOptions);
  }

  destroyConnection() {
    try {
      this.client.disconnect(true);
      this.isConnected.next(false);
      console.log('Successfully disconnected!');
    } catch (error: any) {
      console.log('Disconnect failed', error.toString());
    }
  }
}
