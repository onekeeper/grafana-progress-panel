import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
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
	this.addProgress.bind(this);
	this.addBarMember.bind(this);
	this.delProgress.bind(this);
	this.delBarMember.bind(this);
  }
  
  setUnitFormat(subItem, obj) {	
	obj.format = subItem.value;
	obj.valueShow = this.formatValue(obj.value, subItem.value);
    this.render();
  }
  
  getDecimalsForValue(value) {
    if (_.isNumber(this.panel.decimals)) {
      return { decimals: this.panel.decimals, scaledDecimals: null };
    }

    var delta = value / 2;
    var dec = -Math.floor(Math.log(delta) / Math.LN10);

    var magn = Math.pow(10, -dec);
    var norm = delta / magn; // norm is between 1.0 and 10.0
    var size;

    if (norm < 1.5) {
      size = 1;
    } else if (norm < 3) {
      size = 2;
      // special case for 2.5, requires an extra decimal
      if (norm > 2.25) {
        size = 2.5;
        ++dec;
      }
    } else if (norm < 7.5) {
      size = 5;
    } else {
      size = 10;
    }

    size *= magn;

    // reduce starting decimals if not needed
    if (Math.floor(value) === value) { dec = 0; }

    var result = {};
    result.decimals = Math.max(0, dec);
    result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

    return result;
  }

  formatValue(value, format) {
    var decimalInfo = this.getDecimalsForValue(value);
    var formatFunc = kbn.valueFormats[format];
    if (formatFunc) {
      return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
    }
    return value;
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
  }
  
  checkSeries(targets, series){
	let seriesFull = [];
	if(targets.length == series.length){
		return seriesFull = series;
	}else{
		let fillFlag = false;
		for(var i=0,length = targets.length; i<length; i++){
			for(var j=0,sLen = series.length; j<sLen; j++){
				if(targets[i].item.filter == series[j].target){
					seriesFull.push(series[j]);
					fillFlag = false;
					break;
				}else{
					fillFlag = true;
				}
			}
			if(fillFlag){
				seriesFull.splice(i, 0, {'target':targets[i].item.filter, datapoints:[]});
			}
		}
	}
	return seriesFull;
  }

  parseSeries(series) {	
	if(series && series.length > 0){
		series = this.checkSeries(this.panel.targets, series);
		let that = this;
		this.panel.progressArr.forEach(function(value, index, arr){
			 if(series[index] && series[index].datapoints){
				 let datapoints = series[index].datapoints;
				 if(datapoints.length > 0){
					 value.value = datapoints[datapoints.length-1][0];
					 value.valueShow = that.formatValue(value.value, value.format);
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
					 value.valueShow = 'N/A'
					 value.percent = '0';
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
					 total += this.panel.barsArr[i].value;
					 this.panel.barsArr[i].valueShow = this.formatValue(this.panel.barsArr[i].value, this.panel.barsArr[i].format);
				 }else{
					 this.panel.barsArr[i].value = 0;
					 this.panel.barsArr[i].valueShow = 'N/A';
				 }
			}else{
				 total += this.panel.barsArr[i].value;
			}
		}
		this.panel.barsArr.forEach(function(value, index, arr){
			 if(index == arr.length-1){
				 value.percent = 100- perTotal;
			 }else{
				 if(value.value){
					 value.percent = (value.value/total)*100;
					 value.percent = Math.floor(value.percent);
					 perTotal += value.percent;
				 }
			 }
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
	  this.panel.barsArr.forEach(function(value, index, arr){
		  total += value.value;
	  })
	  this.panel.barsArr.forEach(function(value, index, arr){
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
