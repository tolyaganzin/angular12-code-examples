import { Component, ElementRef, OnInit, Renderer2, Output, EventEmitter, OnDestroy, NgZone, ViewChild } from '@angular/core';
import * as bowser from 'bowser';
import { AssetInfoPopupStateService } from 'app/services/asset-info-popup-state.service';
import { SidebarService } from 'app/services/sidebar.service';
import { skip, tap } from 'rxjs/operators';

@Component({
  selector: 'zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.css']
})

export class ZoomComponent implements OnInit, OnDestroy {
  @ViewChild('wrapper', {static: true}) private wrapper: ElementRef;

  private isDragging: boolean = false;
  private isScaling: boolean = false;
  private zoomSize: any;
  private startX: number;
  private startY: number;
  private transformLeft: number = 0;
  private transformTop: number = 0;
  private isFirstTime: boolean = true;
  private initialLeft: number = 0;
  private initialTop: number = 0;
  private scale: number = 1;
  private scaleFactor: number = 0.1;
  private listeners: (() => void)[] = [];
  private readonly isTabletOrMobile = bowser.tablet || bowser.mobile;

  @Output() zoomChange:EventEmitter<any> = new EventEmitter();
  @Output() zoomValueChanged:EventEmitter<number> = new EventEmitter();
  @Output() clickTouchStart:EventEmitter<any> = new EventEmitter();
  @Output() clickTouchMove:EventEmitter<any> = new EventEmitter();
  @Output() clickTouchEnd:EventEmitter<any> = new EventEmitter();

  constructor(
    private _sideBarService: SidebarService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private readonly zone: NgZone,
    private readonly assetInfoPopupStateService: AssetInfoPopupStateService
  ) { }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      // Listen for mousedown and touchstart events
      this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, 'mousedown', (event) => {
        this.startDrag(event);
      }));

      this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, 'touchstart', (event) => {
        if (event.touches.length === 1 && !this.isScaling) {
          this.startDrag(event.touches[0]);
        }
        if (event.touches.length === 2) {
          this.pinchStart(event);
        }
      }));

      // Listen for mousemove and touchmove events
      this.listeners.push(this.renderer.listen(window, 'mousemove', (event) => {
        if (this.isDragging) {
          this.zone.run(() => {
            this.closeOpenedOverlays();
          });
          event.preventDefault();
          this.moveDrag(event);
        }
      }));
      this.listeners.push(this.renderer.listen(window, 'touchmove', (event) => {
        if (this.isDragging) {
          event.preventDefault();
          this.moveDrag(event.touches[0]);
        }
        if (this.isScaling) {
          this.pinchMove(event);
        }
      }));

      // Listen for mouseup and touchend events
      this.listeners.push(this.renderer.listen(window, 'mouseup', (event) => {
        this.endDrag(event);
      }));

      this.listeners.push(this.renderer.listen(window, 'touchend', (event) => {
        if (this.isDragging) {
          this.endDrag(event);
        }
        if (this.isScaling) {
          this.pinchEnd(event);
        }
      }));

      // Listen for wheel event
      this.listeners.push(this.renderer.listen(this.elementRef.nativeElement, 'wheel', (event) => {
        this.zone.run(() => {
          this.closeOpenedOverlays();
        })
        event.preventDefault();
        this.zoom(event.deltaY < 0, event);

      }));
    });
    this._sideBarService.currentSideBarState$
      .pipe(
        skip(1),
        tap((opened: boolean): void => {
          // this.assetInfoPopupStateService.setOpenState(false);
          setTimeout((): void => {
            this.onImageLoad();
          }, 260);
        })
      )
      .subscribe()
  }
  // public get data about state of component
  getCurrentState() {
    return {
      isDragging: this.isDragging,
      isScaling: this.isScaling,
      zoomSize: this.zoomSize,
      startX: this.startX,
      startY: this.startY,
      transformLeft: this.transformLeft,
      transformTop: this.transformTop,
      isFirstTime: this.isFirstTime,
      initialLeft: this.initialLeft,
      initialTop: this.initialTop,
      innerWidth: this.elementRef.nativeElement.children[0].children[0].clientWidth,
      innerHeight: this.elementRef.nativeElement.children[0].children[0].clientHeight,
      outerWidth: this.elementRef.nativeElement.children[0].clientWidth,
      outerHeight: this.elementRef.nativeElement.children[0].clientHeight,
      scale: this.scale,
      minScale: 0.4,
      maxScale: 5.0
    }
  }


  private calculateScaledDimensions(container: HTMLElement, child: HTMLElement): number {
    let {clientHeight: parentHeight, clientWidth: parentWidth} = container;
    let {clientWidth: childWidth} = child;
    parentHeight = parentHeight - 150; // subtract the size of interface elements

    const containerAR: number = parentWidth / parentHeight;
    const imageAR: number = childWidth / child.clientHeight;

    const scale: number = (imageAR > containerAR) ? parentWidth / childWidth : parentHeight / child.clientHeight;

    return +scale.toFixed(2);
  }
  // public on image load call this
  onImageLoad(container?: DOMRect, targetAsset?: DOMRect) {
    const setToDefault = () => {
      const wrapper = this.elementRef.nativeElement.children[0].children[0];
      const parentElement = wrapper.parentElement;
      this.scale = 1;
      this.transformLeft = 0;
      this.transformTop = 0;
      this.initialTop = this.transformTop;
      this.initialLeft = this.transformLeft;
      const imgHeight: number = (wrapper as HTMLElement).getElementsByTagName('img')[0].clientHeight;
      // this.zoomValueChanged.emit(this.transFormScaleToPercent(this.scale))
      // if (parentElement.clientHeight < wrapper.clientHeight && imgHeight) {
      //   const tmpCounter = Math.round((parentElement.clientHeight / wrapper.clientHeight)*100)/100;
      //   this.elementRef.nativeElement.children[0].children[0].style.width = wrapper.clientWidth * tmpCounter + "px";
      //   // this.elementRef.nativeElement.children[0].children[0].style.width = 100 * tmpCounter + "%";
      //   // this.elementRef.nativeElement.children[0].children[0].style.maxWidth = 100 * tmpCounter + "%";
      // }

       // this block of code for the scale of image map, for example is too small image then we should increase image
      // for the cover of available space of map or to decrease img if is too big img
      if (imgHeight && !this.isTabletOrMobile) {
        const newScale: number = +(Math.floor(this.calculateScaledDimensions(parentElement, wrapper) / 0.1) * 0.1).toFixed(2);
        const percentToScale: number = Math.floor((this.transFormScaleToPercent(newScale) - 100) / 10) * 10
        if (percentToScale >= 10 || percentToScale < 1) {
          this.zoom(true, null, null, percentToScale)
          this.scale = newScale;
        }
      }
      this.zoomValueChanged.emit(this.transFormScaleToPercent(this.scale));
      this.zone.runOutsideAngular((): void => {
        this.renderer.setStyle(wrapper, 'transition', '250ms');
        this.renderer.setStyle(wrapper, 'transform', `translate(${this.transformLeft}px, ${this.transformTop}px) scale(${this.scale})`);
        setTimeout(() => {
          this.renderer.removeStyle(wrapper, 'transition');
        }, 250)
      })
    }

    if (container && targetAsset) {
      const intersectionRect = {
        top: Math.max(targetAsset.top, container.top),
        bottom: Math.min(targetAsset.bottom, container.bottom),
        left: Math.max(targetAsset.left, container.left),
        right: Math.min(targetAsset.right, container.right)
      };

      const intersectionArea = Math.max(0, intersectionRect.right - intersectionRect.left) * Math.max(0, intersectionRect.bottom - intersectionRect.top);

      // Calculate the area of the div element
      const divArea = (targetAsset.right - targetAsset.left) * (targetAsset.bottom - targetAsset.top);

      // Calculate the percentage covered by the section element
      const percentVisibleOfTargetElement = Math.round((intersectionArea / divArea) * 100);
      if (percentVisibleOfTargetElement >= 62) {
        return;
      } else {
        return setToDefault();
      }
    }
    setToDefault();
  }

  closeOpenedOverlays(): void {
    if (this.assetInfoPopupStateService.openState) {
        this.assetInfoPopupStateService.setOpenState(false);
    }
  }

  //Zoom mobile
  private pinchStart(e) {
    this.isScaling = true;
    this.zoomSize = this.diffZoom(e)
  }
  private diffZoom (e) {
    return Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
  }
  private pinchMove(e) {
    const diff = this.diffZoom(e);
    this.zoom(this.zoomSize < diff, e)
    this.zoomSize = diff;
  }
  private pinchEnd(e) {
    this.isScaling = false;
  }

  //Panning
  private startDrag(event: MouseEvent | Touch): void {
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    const wrapper = this.elementRef.nativeElement.children[0].children[0];
    const style = window.getComputedStyle(wrapper);
    const matrix = new WebKitCSSMatrix(style.transform);
    this.transformLeft = matrix.m41;
    this.transformTop = matrix.m42;

    if(this.isFirstTime) {
      this.initialLeft = parseInt(style.left, 10) || 0;
      this.initialTop = parseInt(style.top, 10) || 0;
      this.isFirstTime = false;
    }

    this.clickTouchStart.emit(event)
  }

  private moveDrag(event: MouseEvent | Touch): void {
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    this.updateTransform(dx, dy);
    this.clickTouchMove.emit(event)
  }

  private endDrag(event: MouseEvent | Touch): void {
    this.initialLeft = this.transformLeft;
    this.initialTop = this.transformTop;
    this.isDragging = false;
    this.clickTouchEnd.emit(event)
  }

  //Calc zoom and pan data
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // public zoom
  // zoomIn true zoom +, false zoom -
  // event area to zoom in/out mouse/touch position
  // newscale set new scale (if this is set zoomIn not checking)
  zoom(zoomIn: boolean, event: any, newscale?: number, increaseByPercent: number = 0): void {
    increaseByPercent = increaseByPercent / 100;
    let clientX = 0;
    let clientY = 0;
    let sideMenu = this._sideBarService.getCurrentSideBarState() ? 435 : 0;
    if(event) {
      clientX = (event.clientX ? event.clientX : event.changedTouches[0].clientX) - sideMenu - this.elementRef.nativeElement.children[0].offsetLeft;
      clientY = (event.clientY ? event.clientY : event.changedTouches[0].clientY) - 50 - this.elementRef.nativeElement.children[0].offsetTop ;
    } else {
      const tmp = this.getCurrentState();
      clientX = tmp.initialLeft + tmp.innerWidth / 2;
      clientY = tmp.initialTop + tmp.innerHeight / 2;
    }
    const left = (clientX - this.initialLeft) / this.scale;
    const top = (clientY - this.initialTop) / this.scale;

    // this.scaleFactor = bowser.mac ? (this.scale > 2.2 ? 0.04 : this.scale < 1.1 ? 0.008 : 0.015) : 0.1;
    if(bowser.mac) {
      this.scaleFactor = this.scale > 2.2 ? 0.04 : this.scale < 1.1 ? 0.008 : 0.015
    }
    if(bowser.linux) {
      this.scaleFactor = this.scale > 2.2 ? 0.5 : this.scale < 1.1 ? 0.1 : 0.2
    }
    if(bowser.windows) {
      this.scaleFactor = this.scale > 2.2 ? 0.5 : this.scale < 1.0 ? 0.05 : 0.2
    }
    if(bowser.ios || bowser.android) {
      this.scaleFactor = this.scale > 2.2 ? 0.06 : this.scale < 1.1 ? this.scale < 0.5 ? 0.005 : 0.01  : 0.03;
    }
    if(!newscale) {
      this.scale += zoomIn ? (increaseByPercent || this.scaleFactor) : -(increaseByPercent || this.scaleFactor);
    } else {
      this.scale = newscale;
    }
    this.scale = Math.min(Math.max(0.4, this.scale), 5.0); // Minimum scale of 0.4 max 5.0 to prevent inverted content
    this.initialLeft = clientX - left * this.scale;
    this.initialTop = clientY - top * this.scale;
    this.isFirstTime = false;
    this.updateTransform();
    this.zoomValueChanged.emit(this.transFormScaleToPercent(this.scale))
    this.zoomChange.emit(event)
  }

  public transFormScaleToPercent(scale: number){
    const percentage = Math.round(scale * 100);
    return Math.trunc(percentage);
  }

  private getPanContainerAndLimits(): any {
    const wrapper = this.elementRef.nativeElement.children[0].children[0];
    const parentElement = wrapper;
    const maxX = parentElement.clientWidth - (wrapper.clientWidth * this.scale);
    const maxY = parentElement.clientHeight - (wrapper.clientHeight * this.scale);
    const maxXmove = wrapper.clientWidth * this.scale * 0.8;
    const maxYmove = wrapper.clientHeight * this.scale * 0.8;
    return {
      wrapper: wrapper,
      parentElement: parentElement,
      maxX: maxX,
      maxY: maxY,
      maxXmove: maxXmove,
      maxYmove: maxYmove
    }
  }

  increaseZoom(percent: number = 0){
    this.closeOpenedOverlays();
    this.zoom(true, null, null, percent)
  }

  decreaseZoom(percent: number = 0){
    this.closeOpenedOverlays();
    this.zoom(false, null,  null, percent)
  }

  // Update posistion and zoom
  private updateTransform(dx: number = 0, dy: number = 0): void {
    const containerAndLimits = this.getPanContainerAndLimits();
    // console.log(containerAndLimits)
    // console.log(this.initialLeft + dx)
    // console.log(-containerAndLimits.maxXmove)
    // console.log(this.initialLeft + dx > -containerAndLimits.maxXmove)
    // console.log(containerAndLimits.maxX + containerAndLimits.maxXmove)
    // console.log(this.initialLeft + dx < containerAndLimits.maxX + containerAndLimits.maxXmove)
    const left = this.clamp(this.initialLeft + dx, -containerAndLimits.maxXmove, containerAndLimits.maxX + containerAndLimits.maxXmove);
    const top = this.clamp(this.initialTop + dy, -containerAndLimits.maxYmove, containerAndLimits.maxY + containerAndLimits.maxYmove);
    this.transformLeft = left;
    this.transformTop = top;
    if(!dx && !dy) {
      this.initialLeft = left;
      this.initialTop = top;
    }
    this.renderer.setStyle(containerAndLimits.wrapper, 'transform', `translate(${this.transformLeft}px, ${this.transformTop}px) scale(${this.scale})`);
  }

  ngOnDestroy(): void {
    this.listeners.forEach((listener) => {
      listener();
    })
  }
}
