export interface ChartViewModel {
    dataPoints: ChartDataPoint[][];
    axis:any[];
    dataMax: number;
};
export interface ChartDataPoint {
    y_axis: number;
    x_axis: any;
};

