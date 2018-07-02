'use strict';

System.register(['app/plugins/sdk', './draw', 'lodash', './unit', 'app/core/utils/kbn', './css/panel.css!'], function (_export, _context) {
	"use strict";

	var MetricsPanelCtrl, Draw, _, unit, kbn, _createClass, ProgressChartCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	return {
		setters: [function (_appPluginsSdk) {
			MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
		}, function (_draw) {
			Draw = _draw.Draw;
		}, function (_lodash) {
			_ = _lodash.default;
		}, function (_unit) {
			unit = _unit.default;
		}, function (_appCoreUtilsKbn) {
			kbn = _appCoreUtilsKbn.default;
		}, function (_cssPanelCss) {}],
		execute: function () {
			_createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}

				return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

			_export('ProgressChartCtrl', ProgressChartCtrl = function (_MetricsPanelCtrl) {
				_inherits(ProgressChartCtrl, _MetricsPanelCtrl);

				function ProgressChartCtrl($scope, $injector, $rootScope) {
					_classCallCheck(this, ProgressChartCtrl);

					var _this = _possibleConstructorReturn(this, (ProgressChartCtrl.__proto__ || Object.getPrototypeOf(ProgressChartCtrl)).call(this, $scope, $injector));

					_this.$rootScope = $rootScope;
					_this.hiddenSeries = {};

					var panelDefaults = {
						colorArr: ['#5eb1e4', '#4888e0', '#2adf6e', '#FFB90F', '#FF4500'],
						progressArr: [],
						barsArr: [],
						doughnutsArr: []
					};

					_this.dataTemp = {
						progressArr: [],
						barsArr: [],
						doughnutsArr: []
					};

					_.defaults(_this.panel, panelDefaults);

					_this.events.on('render', _this.onRender.bind(_this));
					_this.events.on('data-received', _this.onDataReceived.bind(_this));
					_this.events.on('data-error', _this.onDataError.bind(_this));
					_this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
					_this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
					return _this;
				}

				_createClass(ProgressChartCtrl, [{
					key: 'onInitEditMode',
					value: function onInitEditMode() {
						this.addEditorTab('Options', 'public/plugins/grafana-progress-panel/editor.html', 2);
						this.unitFormats = kbn.getUnitFormats();
					}
				}, {
					key: 'setUnitFormat',
					value: function setUnitFormat(subItem, obj) {
						obj.format = subItem.value;
						obj.valueShow = unit.formatValue(this.panel, obj.value, subItem.value);
						this.render();
					}
				}, {
					key: 'onDataError',
					value: function onDataError() {
						this.series = [];
						this.render();
					}
				}, {
					key: 'onRender',
					value: function onRender() {
						this.data = this.parseSeries(this.series);
					}
				}, {
					key: 'parseSeries',
					value: function parseSeries(series) {
						var _this2 = this;

						this.dataTemp = {
							progressArr: unit.checkProgressArr(this.panel.progressArr, this.dataTemp.progressArr),
							barsArr: unit.checkProgressArr(this.panel.barsArr, this.dataTemp.barsArr),
							doughnutsArr: unit.checkProgressArr(this.panel.doughnutsArr, this.dataTemp.doughnutsArr)
						};
						if (series && series.length > 0) {
							series = unit.checkSeries(this.panel.targets, series);
							this.dataTemp.progressArr.forEach(function (value, index, arr) {
								if (series[index] && series[index].datapoints) {
									var datapoints = series[index].datapoints;
									if (datapoints.length > 0) {
										value.value = datapoints[datapoints.length - 1][0];
										value.valueShow = unit.formatValue(_this2.panel, value.value, _this2.panel.progressArr[index].format);
										var perValue = datapoints[datapoints.length - 1][0];
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

							var total = 0,
							    proLen = this.panel.progressArr.length,
							    perTotal = 0;
							for (var i = 0; i < this.dataTemp.barsArr.length; i++) {
								var indTmp = proLen + i;
								if (series[indTmp] && series[indTmp].datapoints) {
									var datapoints = series[indTmp].datapoints;
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
							this.dataTemp.barsArr.forEach(function (value, index, arr) {
								if (index == arr.length - 1) {
									value.percent = 100 - perTotal;
								} else {
									if (value.value) {
										value.percent = value.value / total * 100;
										value.percent = Math.floor(value.percent);
										perTotal += value.percent;
									} else {
										value.percent = 0;
									}
								}
							});
							// -----------------------------------------------------------------Doughnut 数据处理-----------------------------------------------------------------
							this.draw(this.getDOM());
						} else {
							this.dataTemp.progressArr.forEach(function (value, index, arr) {
								value.value = 0;
								value.valueShow = 'N/A';
								value.percent = 0;
							});
							this.dataTemp.barsArr.forEach(function (value, index, arr) {
								value.value = 0;
								value.percent = index == 0 ? 100 : 0;
								value.valueShow = 'N/A';
							});
							// -----------------------------------------------------------------Doughnut 空数据处理-----------------------------------------------------------------
							this.draw(this.getDOM());
						}
						return this.dataTemp;
					}
				}, {
					key: 'seriesHandler',
					value: function seriesHandler(seriesData) {
						return seriesData;
					}
				}, {
					key: 'onDataReceived',
					value: function onDataReceived(dataList) {
						this.series = dataList.map(this.seriesHandler.bind(this));
						this.data = this.parseSeries(this.series);
						this.render(this.data);
					}
				}, {
					key: 'getProcessStyle',
					value: function getProcessStyle(proObj) {
						return { 'width': proObj && proObj.percent ? proObj.percent + "%" : 0 + '%' };
					}
				}, {
					key: 'getBarStyle',
					value: function getBarStyle(index) {
						return { 'width': this.dataTemp.barsArr[index].percent + '%', 'background-color': this.panel.colorArr[index] };
					}
				}, {
					key: 'getDoughnutStyle',
					value: function getDoughnutStyle(index) {
						console.log("progresschart.js/getDoughnutStyle is run.");

						return {
							'width': document.querySelectorAll(".doughnut-contanier")[index].clientWidth,
							// 'height': "100px",
							'height': document.querySelectorAll(".doughnut-contanier")[index].clientHeight
						};
					}
				}, {
					key: 'addProgress',
					value: function addProgress() {
						var objTempEdit = {
							label: '', unit: '', type: 'solid', format: 'short'
						},
						    objTemp = { value: 0, valueShow: '', percent: 0 };
						this.panel.progressArr.push(objTempEdit);
						this.dataTemp.progressArr.push(objTemp);
					}
				}, {
					key: 'addBarMember',
					value: function addBarMember() {
						var objTempEdit = {
							label: '', unit: '', format: 'short'
						},
						    objTemp = { value: 0, valueShow: '', percent: 0 };
						this.panel.barsArr.push(objTempEdit);
						this.dataTemp.barsArr.push(objTemp);
					}
				}, {
					key: 'addDoughnutMember',
					value: function addDoughnutMember() {
						var objTempEdit = {
							label: ''
						},
						    objTemp = { value: 0, valueShow: '', percent: 0 };
						this.panel.doughnutsArr.push(objTempEdit);
						this.dataTemp.doughnutsArr.push(objTemp);
					}
				}, {
					key: 'delProgress',
					value: function delProgress(index) {
						this.panel.progressArr.splice(index, 1);
						this.dataTemp.progressArr.splice(index, 1);
						this.render();
					}
				}, {
					key: 'delBarMember',
					value: function delBarMember(index) {
						this.panel.barsArr.splice(index, 1);
						this.dataTemp.barsArr.splice(index, 1);
						var total = 0;
						this.dataTemp.barsArr.forEach(function (value, index, arr) {
							total = Math.round(total) + Math.round(value.value);
						});
						this.dataTemp.barsArr.forEach(function (value, index, arr) {
							if (total === 0) {
								value.percent = index == 0 ? 100 : 0;
							} else {
								value.percent = value.value / total * 100;
							}
						});
						this.render();
					}
				}, {
					key: 'delDoughnutMember',
					value: function delDoughnutMember(index) {
						this.panel.doughnutsArr.splice(index, 1);
						this.dataTemp.doughnutsArr.splice(index, 1);
						this.render();
					}
				}, {
					key: 'draw',
					value: function draw(domList) {
						console.log("progresschart.js/draw is run.");
						console.log("domList", domList);
						for (var i in domList) {
							var dom = domList[i];
							console.log(dom);
							Draw({
								dom: dom,
								width: dom.clientWidth,
								height: dom.clientHeight
							});
						}
					}
				}, {
					key: 'getDOM',
					value: function getDOM() {
						var domList = [];
						for (var i in this.panel.doughnutsArr) {
							if (document.querySelectorAll(".doughnut-contanier")[i]) {
								domList.push(document.querySelectorAll(".doughnut-contanier")[i].children[1]);
							}
						}
						return domList;
					}
				}, {
					key: 'doughnutInit',
					value: function doughnutInit(index, len) {
						console.log("this.doughnutsArr.length", len);
						console.log("index", index);
						var arr = [];
						if (index == len - 1) {
							for (var i = 0; i < len; i++) {
								var dom = document.querySelectorAll(".doughnut-contanier")[i].children[1];
								arr.push(dom);
							}
							console.log("arr", arr);
							this.draw(arr);
						}
					}
				}, {
					key: 'link',
					value: function link(scope, elem) {
						this.events.on('render', function () {
							var $panelContainer = elem.find('.panel-container');
							var $progressPanel = elem.find('.progress-panel');
							$progressPanel.css('height', $panelContainer[0].offsetHeight - 40 + 'px');
						});
					}
				}]);

				return ProgressChartCtrl;
			}(MetricsPanelCtrl));

			_export('ProgressChartCtrl', ProgressChartCtrl);

			ProgressChartCtrl.templateUrl = 'module.html';
		}
	};
});
//# sourceMappingURL=progresschart_ctrl.js.map
