import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetInfoPopupStateService {
  private readonly isOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isOpened$: Observable<boolean> = this.isOpened.asObservable();

  setOpenState(opened: boolean) {
    this.isOpened.next(opened);
  }

  public get openState(): boolean {
    return this.isOpened.value;
  }
}
