import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDate'
})
export class SortByDatePipe implements PipeTransform {

  transform<T>(items: T[], dateKey: keyof T): T[] {
    if (!Array.isArray(items) || !dateKey) {
      return items; // Return the original array if it's not an array or dateKey is not provided
    }

    return items.sort((a, b) => {
      const dateA = new Date(a[dateKey] as unknown as string).getTime();
      const dateB = new Date(b[dateKey] as unknown as string).getTime();
      return dateA - dateB; // Sort ascending (oldest first)
    });
  }
}

// Using the Pipe example
// <ul>
//   <li *ngFor="let item of items | sortByDate:'createdDate'">
//     {{ item.name }} - {{ item.createdDate | date }}
//   </li>
// </ul>