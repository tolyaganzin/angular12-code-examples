import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor() { }

  isOpen:boolean = true;

  private _toggleSrc$$ = new BehaviorSubject<boolean>(this.isOpen);

  currentSideBarState$ = this._toggleSrc$$.asObservable();

  toggle(){
    this.isOpen = !this.isOpen;
    this._toggleSrc$$.next(this.isOpen);
  }

  closeSideBar(){
    this.isOpen = false;
    this._toggleSrc$$.next(false);
  }

  openSideBar(){
    this.isOpen = true;
    this._toggleSrc$$.next(true);
  }



  getCurrentSideBarState(){
    return this._toggleSrc$$.getValue();
  }

}
