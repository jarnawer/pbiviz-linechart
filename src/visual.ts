/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
"use strict";
import "@babel/polyfill";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;

import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import {visualTransform} from './core/dataTransform';
import { VisualSettings } from "./settings";
import { ChartDataPoint, ChartViewModel } from "./viewmodels/model";
export class Visual implements IVisual {
  private settings: VisualSettings;
  private svg: d3.Selection<SVGElement, any, any, any>;
  private host: IVisualHost;
  private lineChart: d3.Selection<SVGElement, any, any, any>;
  private container: d3.Selection<SVGElement, any, any, any>;
  private xAxis: d3.Selection<SVGElement, any, any, any>;
  private yAxis: d3.Selection<SVGElement, any, any, any>;
  private margin:any;
  static Config = {
    xScalePadding: 0.1
  };

  /**
   * Creates instance of BarChart. This method is only called once.
   *
   * @constructor
   * @param {VisualConstructorOptions} options - Contains references to the element that will
   *                                             contain the visual and a reference to the host
   *                                             which contains services.
   */

  constructor(options: VisualConstructorOptions) {
    this.margin = { top: 50, right: 50, bottom: 50, left: 50 };
    this.host = options.host;
    let svg = (this.svg = d3
      .select(options.element)
      .append("svg")
      .classed("chart", true))
    
    this.container = svg
      .append("g")
      .classed("container", true)
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );
    

    this.xAxis = this.container.append("g").classed("xAxis", true);
    this.yAxis = this.container.append("g").classed("yAxis", true);

    this.initLine();
  }
  /**
   * Updates the state of the visual. Every sequential databinding and resize will call update.
   *
   * @function
   * @param {VisualUpdateOptions} options - Contains references to the size of the container
   *                                        and the dataView which contains all the data
   *                                        the visual had queried.
   */
  public update(options: VisualUpdateOptions) {

    let width = options.viewport.width;
    let height = options.viewport.height;
    let viewModel:ChartViewModel = visualTransform(options, this.host);    
    let offset_x = height - this.margin.bottom - this.margin.top;
    let offset_y = (this.margin.bottom + this.margin.top) * -1;
    this.svg.attr("width",width)
    this.svg.attr("height", height);

    let yScale = d3
      .scaleLinear()
      .domain([0, viewModel.dataMax])
      .rangeRound([0, height]);

    let xScale = d3
      .scaleTime()
      .domain(d3.extent(viewModel.dataPoints, d => d.x_axis))
      .rangeRound([0, width]);
    
     
    this.yAxis
    .attr(
        "transform",
        "translate(0," + (offset_y) + ")"
      )
      .call(d3.axisLeft(yScale))
    
    this.xAxis
    .attr(
        "transform",
        "translate(0," + offset_x + ")"
      )
      .call(d3.axisBottom(xScale))
     
    
    this.handleLineUpdate(viewModel.dataPoints,offset_y, xScale, yScale);
  }

  private initLine(){
    this.lineChart = this.container.append("g").classed("lineChart", true);
    this.lineChart.append("path").attr("id", "lineChart");
    this.lineChart.append("text").attr("id", "lineChartLabel");
  }

  private handleLineUpdate(dataPoints:ChartDataPoint[],offset_y:number,xScale:d3.ScaleTime<number, number>,yScale: d3.ScaleLinear<number, any>) {
    
    var line = d3.line<ChartDataPoint>().x(d => xScale(d.x_axis)).y(d => yScale(d.y_axis));
    console.log("datapoints->", dataPoints)
    this.lineChart
      .select("#lineChart")
      .datum(dataPoints)
      .attr("d", line)
      .attr(
        "transform",
        "translate(0," + offset_y + ")"
      )

    this.lineChart
      .select("#lineChart")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5);

 }

  private static parseSettings(dataView: DataView): VisualSettings {
    return VisualSettings.parse(dataView) as VisualSettings;
  }

  /**
   * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
   * objects and properties you want to expose to the users in the property pane.
   *
   */
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(),options);
  }
  /**
   * Destroy runs when the visual is removed. Any cleanup that the visual needs to
   * do should be done here.
   *
   * @function
   */
  public destroy(): void {
    //Perform any cleanup tasks here
  }
}
