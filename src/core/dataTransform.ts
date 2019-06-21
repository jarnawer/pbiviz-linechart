import * as d3 from 'd3';
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ColorPalette = powerbi.extensibility.IColorPalette;
import { ChartViewModel, ChartDataPoint } from "../viewmodels/model";
import { dataPointSettings } from '../settings';
import * as colorUtils from "powerbi-visuals-utils-colorutils";

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
        let colorPalette:ColorPalette = host.colorPalette;
        let colorHelper = new colorUtils.ColorHelper(colorPalette);
        console.log(dataView);
        let viewModel: ChartViewModel = {
            dataPoints: [],
            max_x:0,
            max_y: 0,
            color:[]
        };
        
        if (
          !dataView ||
          !dataView[0] ||
          !dataView[0] ||
          !dataView[0].categorical ||
          !dataView[0].categorical.categories ||
          !dataView[0].categorical.categories[0] ||
          !dataView[0].categorical.values 
        )
          return viewModel;
        
        let x_axis_values = dataView[0].categorical.categories[0].values
        let y_axis_values = dataView[0].categorical.values; 
        
        
        y_axis_values.forEach((item,index)=>{
            viewModel.dataPoints[index] = [];
            for(var i=0;i<=item.values.length;i++){
                let y_value =  item.values[i];
                if(y_value){
                    viewModel.dataPoints[index].push({
                        x_axis: x_axis_values[i],
                        y_axis: item.values[i]
                    } as ChartDataPoint)
                }
            }
            viewModel.dataPoints[index].sort(function(x, y){
                return d3.ascending(x.x_axis, y.x_axis);
            });
            
            viewModel.color[index] = getColor(index);
        });   
        viewModel.max_x = d3.max(x_axis_values.map(x=>x as number));
        viewModel.max_y = d3.max(y_axis_values.map(y=>y.maxLocal as number));
        console.log("viewmodel", viewModel)
        return viewModel;
    }

    function get_axis_value(value:any):any {
        if(typeof(value)==="number"){
            return value;
        }
        return new Date(value);
    }

    function getColor(index:number){
        switch(index){
            case 0:
                return "#E4002B";
            case 1:
                return "#001BFF";
            case 2:
                return "#FE8200";
            default:
                return "#000000"
        }
    }