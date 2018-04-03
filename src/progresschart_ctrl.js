import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import unit from './unit';
import kbn from 'app/core/utils/kbn';
import './css/panel.css!';

export class ProgressChartCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    this.hiddenSeries = {};

    var panelDefaults = {
		colorArr:['#5eb1e4','#4888e0','#2adf6e','#FFB90F','#FF4500'],
		progressArr:[],
		barsArr:[]
    };

    _.defaults(this.panel, panelDefaults);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-progress-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }
  
  setUnitFormat(subItem, obj) {	
	obj.format = subItem.value;
	obj.valueShow = unit.formatValue(this.panel, obj.value, subItem.value);
    this.render();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
  }

  parseSeries(series) {	
	if(series && series.length > 0){
		series = unit.checkSeries(this.panel.targets, series);
		let that = this;
		this.panel.progressArr.forEach((value, index, arr) => {
			 if(series[index] && series[index].datapoints){
				 let datapoints = series[index].datapoints;
				 if(datapoints.length > 0){
					 value.value = datapoints[datapoints.length-1][0];
					 value.valueShow = unit.formatValue(that.panel, value.value, value.format);
					 let perValue = datapoints[datapoints.length-1][0];
					 if(perValue>100){
						 perValue = 100;
					 }
					 if(perValue < 0){
						 perValue = 0;
					 }
					 value.percent = perValue;
				 }else{
					 value.value = 0;
					 value.valueShow = 'N/A';
					 value.percent = 0;
				 }
			 }
		});

		let total = 0;
		let proLen = this.panel.progressArr.length;
		let perTotal = 0;
		for(var i=0; i<this.panel.barsArr.length; i++){
			let indTmp = proLen + i;
			if(series[indTmp] && series[indTmp].datapoints){
				 let datapoints = series[indTmp].datapoints; 
				 if(datapoints.length > 0){
					 this.panel.barsArr[i].value = datapoints[datapoints.length-1][0];
					 total = Math.round(total) + Math.round(this.panel.barsArr[i].value);
					 this.panel.barsArr[i].valueShow = unit.formatValue(this.panel, this.panel.barsArr[i].value, this.panel.barsArr[i].format);
				 }else{
					 this.panel.barsArr[i].value = 0;
					 this.panel.barsArr[i].valueShow = 'N/A';
				 }
			}else{
				total = Math.round(total) + Math.round(this.panel.barsArr[i].value);
			}
		}
		this.panel.barsArr.forEach((value, index, arr) => {
			 if(index == arr.length-1){
				 value.percent = 100- perTotal;
			 }else{
				 if(value.value){
					 value.percent = (value.value/total)*100;
					 value.percent = Math.floor(value.percent);
					 perTotal += value.percent;
				 }else{
					 value.percent = 0;
				 }
			 }
		})
	}else{
		this.panel.progressArr.forEach((value, index, arr) => {
			 value.value = 0;
			 value.valueShow = 'N/A';
			 value.percent = 0;
		})	
		this.panel.barsArr.forEach((value, index, arr) => {
			 value.value = 0;
			 value.valueShow = 'N/A';	 
		})	
	}	
  }
  
  seriesHandler(seriesData) {
	return seriesData;
  }

  onDataReceived(dataList) {
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseSeries(this.series);
    this.render(this.data);
  }
  
  getProcessStyle(proObj) {
	 return {'width':proObj.percent+'%'};
  }
  
  addProgress() {
	  let objTemp = {
		  label:'',unit:'',type:'solid',value:0,percent:'0%',format: 'short'
	  };
	  this.panel.progressArr.push(objTemp);
  }
  
  addBarMember() {
	  let objTemp = {
		  label:'',unit:'',value: 0,percent:'0%',format: 'short'
	  };
	  this.panel.barsArr.push(objTemp); 
  }
  
  delProgress(index) {
	  this.panel.progressArr.splice(index, 1); 
  }
  
  delBarMember(index) {
	  this.panel.barsArr.splice(index, 1); 
	  let total = 0;
	  this.panel.barsArr.forEach((value, index, arr) => {
		  total = Math.round(total) + Math.round(value.value);
	  })
	  this.panel.barsArr.forEach((value, index, arr) => {
		  value.percent = (value.value/total)*100+'%';
	  })	  
  }
  
  link(scope, elem) {
	this.events.on('render', () => {
	    const $panelContainer = elem.find('.panel-container');
	    const $progressPanel = elem.find('.progress-panel');
		$progressPanel.css('height', ($panelContainer[0].offsetHeight-40)+'px');
	});
  }
}

ProgressChartCtrl.templateUrl = 'module.html';
