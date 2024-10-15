import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgFullyLoadedDirective } from './img-fully-loaded.directive';



@NgModule({
  declarations: [
    ImgFullyLoadedDirective
  ],
  exports: [
    ImgFullyLoadedDirective
  ],
  imports: [
    CommonModule
  ]
})
export class ImgFullyLoadedModule { }
