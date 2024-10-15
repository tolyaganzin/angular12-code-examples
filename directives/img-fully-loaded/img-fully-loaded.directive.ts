import { AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tribelooImgFullyLoaded]'
})
export class ImgFullyLoadedDirective implements AfterViewInit, OnDestroy {
  @Output() fullyLoaded: EventEmitter<any> = new EventEmitter<any>();
  private listenerFn = () => {};
  constructor(private readonly elementRef: ElementRef, private readonly renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.listenerFn = this.renderer.listen(this.elementRef.nativeElement, 'load', () => {
      this.fullyLoaded.emit(this.elementRef.nativeElement);
    })
  }

  ngOnDestroy(): void {
    this.listenerFn();
  }

}
