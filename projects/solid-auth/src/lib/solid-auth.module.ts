import { ModuleWithProviders, NgModule } from '@angular/core';
import { CONFIG, Config } from './auth-config';
import { AuthPipe } from './auth.pipe';

@NgModule({
  declarations: [
    AuthPipe
  ],
  imports: [
  ],
  exports: [
    AuthPipe
  ]
})
export class SolidAuthModule {
  static forRoot(config: Config): ModuleWithProviders<SolidAuthModule> {
      return {
        ngModule: SolidAuthModule,
        providers: [
          {
            provide: CONFIG,
            useValue: config
          }
        ]
      };
  }
}
