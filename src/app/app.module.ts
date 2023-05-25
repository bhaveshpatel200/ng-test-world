import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { CustomTableModule } from '../../lib/custom-table.module';
@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, CustomTableModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
