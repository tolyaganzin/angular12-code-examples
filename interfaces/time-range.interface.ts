export interface ITimeRange {
    id: number;
    name: string;
    from:  moment.Moment;
    to: moment.Moment;
  }
  
  export interface ITime {
    label: string;
    //Actual value as a moment object
    value: moment.Moment
  }
  
  