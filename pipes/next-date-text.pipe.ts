import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment/moment';
import { DateFormatDependedOnScreenSizePipe } from '../date-format-depended-on-screen-size/date-format-depended-on-screen-size.pipe';

@Pipe({
  name: 'nextDateText'
})
export class NextDateTextPipe implements PipeTransform {
  constructor(private dateFormatDependedOnScreenSizePipe: DateFormatDependedOnScreenSizePipe) {}

  transform(dates: Date[], nextDay = false): string {
    if (nextDay) {
      return this.dateFormatDependedOnScreenSizePipe.transform(moment(dates[0]).add(1, 'd').toDate(), false);
    }
    return this.dateFormatDependedOnScreenSizePipe.transform(moment(dates[0]).subtract(1, 'd').toDate(), false);
  }
}
