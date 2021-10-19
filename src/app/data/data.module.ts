import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { DataRoutingModule } from './data-routing.module';
import { DataComponent } from './data.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DataService } from './data.service';


@NgModule({
  declarations: [
    DataComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxDropzoneModule,
    DataRoutingModule,
    FlexLayoutModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    DataService
  ]
})
export class DataModule { }
