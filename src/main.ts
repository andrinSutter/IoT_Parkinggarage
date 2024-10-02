import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { HttpClientModule } from '@angular/common/http';

const mqttServiceOptions: IMqttServiceOptions = {
  hostname: 'localhost',
  port: 9001,
  path: '',
  protocol: 'ws',
  clientId: 'mqttx_597046f4',
  username: '',
  password: '',
};

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, MqttModule.forRoot(mqttServiceOptions))
  ]
}).catch(err => console.error(err));
