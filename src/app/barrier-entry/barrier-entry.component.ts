import { Component ,  OnInit, OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { MqttService } from '../services/mqtt.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barrier-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barrier-entry.component.html',
  styleUrl: './barrier-entry.component.css'
})
export class BarrierEntryComponent implements OnInit, OnDestroy {
  private mqttSubscription: Subscription | null = null;
  public isAnalogValueEleven: boolean = false; // Variable to hold the check result

  constructor(private mqttService: MqttService) {}

  ngOnInit(): void {
    // Create the MQTT connection
    this.mqttService.createConnection();

    // Subscribe to the MQTT messages
    this.mqttSubscription = this.mqttService.message$.subscribe((message: any) => {
      // Extract the analog_in_1 value and check if it is equal to 11
      const analogValue = message.uplink_message?.decoded_payload?.analog_in_1;
      if (analogValue !== undefined) {
        this.isAnalogValueEleven = (analogValue === 11);

        if (this.isAnalogValueEleven) {
          // Perform the required action when the value is 11
          console.log('Analog input is 11!');
        }
      }
    });
  }

  doPublishOpenBarrier() {
    const topic =
      'v3/app-iot-wuerfel-klassensatz-b@ttn/devices/eui-2024-c-44/down/push';
    const payload = JSON.stringify({
      downlinks: [
        {
          f_port: 1,
          frm_payload: 'FQ==',
          confirmed: true,
        },
      ],
    });
    const qos = 0;
    this.mqttService.doPublish(topic, payload, qos);
    console.log(this.doPublishOpenBarrier)
  }

  ngOnDestroy(): void {
    // Unsubscribe from the MQTT messages to prevent memory leaks
    if (this.mqttSubscription) {
      this.mqttSubscription.unsubscribe();
    }
    // Optionally, destroy the MQTT connection when the component is destroyed
    this.mqttService.destroyConnection();
  }
}
