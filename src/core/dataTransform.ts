import * as d3 from 'd3';
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { ChartViewModel, ChartDataPoint } from "../viewmodels/model";
import { dataPointSettings } from '../settings';

/**
     * Function that converts queried data into a view model that will be used by the visual
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     * @param {IVisualHost} host            - Contains references to the host which contains services
     */
    export function visualTransform(options: VisualUpdateOptions, host: IVisualHost): ChartViewModel {
        let dataView = options.dataViews;
        let viewModel: ChartViewModel = {
            dataPoints: [],
            dataMax: 0
        };
        
        if (!dataView
            || !dataView[0]
            || !dataView[0].table
            || !dataView[0].table.rows
            )
            return viewModel;
        
        let rows = dataView[0].table.rows;
        let chartDataPoints: ChartDataPoint[] = rows.map((r)=>{
            return {
                x_axis:new Date(r[1] as string), y_axis:r[0] as number
            } as ChartDataPoint
        });

        
        return {
            dataPoints: chartDataPoints,
            dataMax: d3.max(chartDataPoints.map(c=>c.y_axis))
        };
    }