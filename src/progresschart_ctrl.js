import { MetricsPanelCtrl } from 'app/plugins/sdk';
import  { Draw } from './draw'
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
			colorArr: ['#5eb1e4', '#4888e0', '#2adf6e', '#FFB90F', '#FF4500'],
			progressArr: [],
			barsArr: [],
			doughnutsArr: [],
		};

		this.dataTemp = {
			progressArr: [],
			barsArr: [],
			doughnutsArr: [],
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
		this.dataTemp = {
			progressArr: unit.checkProgressArr(this.panel.progressArr, this.dataTemp.progressArr),
			barsArr: unit.checkProgressArr(this.panel.barsArr, this.dataTemp.barsArr),
			doughnutsArr: unit.checkProgressArr(this.panel.doughnutsArr, this.dataTemp.doughnutsArr)
		};
		if (series && series.length > 0) {
			series = unit.checkSeries(this.panel.targets, series);
			this.dataTemp.progressArr.forEach((value, index, arr) => {
				if (series[index] && series[index].datapoints) {
					let datapoints = series[index].datapoints;
					if (datapoints.length > 0) {
						value.value = datapoints[datapoints.length - 1][0];
						value.valueShow = unit.formatValue(this.panel, value.value, this.panel.progressArr[index].format);
						let perValue = datapoints[datapoints.length - 1][0];
						if (perValue > 100) {
							perValue = 100;
						}
						if (perValue < 0) {
							perValue = 0;
						}
						value.percent = perValue;
					} else {
						value.value = 0;
						value.valueShow = 'N/A';
						value.percent = 0;
					}
				}
			});

			let total = 0,
				proLen = this.panel.progressArr.length,
				perTotal = 0;
			for (var i = 0; i < this.dataTemp.barsArr.length; i++) {
				let indTmp = proLen + i;
				if (series[indTmp] && series[indTmp].datapoints) {
					let datapoints = series[indTmp].datapoints;
					if (datapoints.length > 0) {
						this.dataTemp.barsArr[i].value = datapoints[datapoints.length - 1][0];
						total = Math.round(total) + Math.round(this.dataTemp.barsArr[i].value);
						this.dataTemp.barsArr[i].valueShow = unit.formatValue(this.panel, this.dataTemp.barsArr[i].value, this.panel.barsArr[i].format);
					} else {
						this.dataTemp.barsArr[i].value = 0;
						this.dataTemp.barsArr[i].valueShow = 'N/A';
					}
				} else {
					total = Math.round(total) + Math.round(this.dataTemp.barsArr[i].value);
				}
			}
			this.dataTemp.barsArr.forEach((value, index, arr) => {
				if (index == arr.length - 1) {
					value.percent = 100 - perTotal;
				} else {
					if (value.value) {
						value.percent = (value.value / total) * 100;
						value.percent = Math.floor(value.percent);
						perTotal += value.percent;
					} else {
						value.percent = 0;
					}
				}
			})
			// -----------------------------------------------------------------Doughnut 数据处理-----------------------------------------------------------------
			this.draw(this.getDoughnutList());
		} else {
			this.dataTemp.progressArr.forEach((value, index, arr) => {
				value.value = 0;
				value.valueShow = 'N/A';
				value.percent = 0;
			})
			this.dataTemp.barsArr.forEach((value, index, arr) => {
				value.value = 0;
				value.percent = index == 0 ? 100 : 0;
				value.valueShow = 'N/A';
			})
			// -----------------------------------------------------------------Doughnut 空数据处理-----------------------------------------------------------------
			this.draw(this.getDoughnutList());
		}
		return this.dataTemp;
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
		return { 'width': proObj && proObj.percent ? proObj.percent + "%" : 0 + '%' };
	}

	getBarStyle(index) {
		return { 'width': this.dataTemp.barsArr[index].percent + '%', 'background-color': this.panel.colorArr[index] };
	}

	addProgress() {
		let objTempEdit = {
			label: '', unit: '', type: 'solid', format: 'short'
		},
			objTemp = { value: 0, valueShow: '', percent: 0 };
		this.panel.progressArr.push(objTempEdit);
		this.dataTemp.progressArr.push(objTemp);
	}

	addBarMember() {
		let objTempEdit = {
			label: '', unit: '', format: 'short'
		},
		objTemp = { value: 0, valueShow: '', percent: 0 };
		this.panel.barsArr.push(objTempEdit);
		this.dataTemp.barsArr.push(objTemp);
	}

	// -----------------------------------------------------------------Doughnut DOM 添加-----------------------------------------------------------------
	addDoughnutMember() {
		let autoID = ()=>{
			for(let i = 1;i>0;i++){
				if(document.querySelectorAll("#doughnut_"+i).length==0) return i;
			}
		}
		let objTempEdit = {
			id: autoID(), label: '',
		},
		objTemp = { value: 0, valueShow: '', percent: 0 };
		this.panel.doughnutsArr.push(objTempEdit);
		this.dataTemp.doughnutsArr.push(objTemp);
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------

	delProgress(index) {
		this.panel.progressArr.splice(index, 1);
		this.dataTemp.progressArr.splice(index, 1);
		this.render();
	}

	delBarMember(index) {
		this.panel.barsArr.splice(index, 1);
		this.dataTemp.barsArr.splice(index, 1);
		let total = 0;
		this.dataTemp.barsArr.forEach((value, index, arr) => {
			total = Math.round(total) + Math.round(value.value);
		});
		this.dataTemp.barsArr.forEach((value, index, arr) => {
			if (total === 0) {
				value.percent = index == 0 ? 100 : 0;
			} else {
				value.percent = (value.value / total) * 100;
			}
		});
		this.render();
	}

	// -----------------------------------------------------------------Doughnut DOM 删除-----------------------------------------------------------------
	delDoughnutMember(index) {
		this.panel.doughnutsArr.splice(index, 1);
		this.dataTemp.doughnutsArr.splice(index, 1);
		this.render();
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------

	// -----------------------------------------------------------------Doughnut DOM 绘画-----------------------------------------------------------------
	draw(domList) {
		console.log("progresschart.js/draw is run.");
		for(let i in domList) {
			let dom = domList[i];
			// dom.width = document.querySelectorAll(".doughnuts-contanier")[0].clientWidth / domList.length;
			dom.width = document.querySelectorAll("#doughnut_"+this.panel.doughnutsArr[0].id)[0].clientWidth;
			dom.height = 100;
			Draw({
				dom: dom,
				width: dom.width,
				height: dom.height,
			});
		}
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------
	
	getDoughnutList() {
		let domList = [];
		for(let i in this.panel.doughnutsArr) {
			// if(document.querySelectorAll(".doughnut-contanier")[i]) {
			// 	domList.push(document.querySelectorAll(".doughnut-contanier")[i].children[1]);
			// }
			let target = document.querySelectorAll("#doughnut_"+this.panel.doughnutsArr[i].id)[0];
			console.log("target:",target);
			if(target) {
				domList.push(target.children[1]);
			}
		}
		return domList;
	}
	// ---------------------------------------------圆环图初始化----------------------------------------------------------------------------------------------------------
	doughnutInit(index, id, $event) {
		console.log(index, id, $event);
		// this.render();
		// let arr = [];
		// if(index == (len - 1)){
		// 	arr = this.getDoughnutList();
		// 	this.draw(arr);
		// }
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------

	link(scope, elem) {
		this.events.on('render', () => {
			const $panelContainer = elem.find('.panel-container');
			const $progressPanel = elem.find('.progress-panel');
			$progressPanel.css('height', ($panelContainer[0].offsetHeight - 40) + 'px');
		});
	}
}

ProgressChartCtrl.templateUrl = 'module.html';
