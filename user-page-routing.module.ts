import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultPageHolderComponent } from './default-page-holder/default-page-holder.component';
import { AuthGuard } from '../../core/guards/auth-guard/auth.guard';

const USER_PAGES_ROUTES: Routes = [
  {
    path: '', component: DefaultPageHolderComponent, children:
    [
      { path: 'mybookings', canActivate: [AuthGuard], loadChildren: () => import('./my-bookings/my-bookings.module').then(m => m.MyBookingsModule) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'booking', redirectTo: 'home', pathMatch: 'full' },
      { path: 'booking', canActivate: [AuthGuard], loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
      { path: 'home', canActivate: [AuthGuard], loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
      { path: 'colleagues', canActivate: [AuthGuard], loadChildren: () => import('./find-colleagues/find-colleagues.module').then(m => m.FindColleaguesModule) },
      { path: 'releases', canActivate: [AuthGuard], loadChildren: () => import('./manage-releases/manage-releases.module').then(m => m.ManageReleasesModule) },
    ]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(USER_PAGES_ROUTES)
  ],
  exports: [
    RouterModule
  ]
})

export class UserPageRoutingModule { }
