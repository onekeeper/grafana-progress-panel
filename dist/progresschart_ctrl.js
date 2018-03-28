'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', './css/panel.css!'], function (_export, _context) {
	"use strict";

	var MetricsPanelCtrl, _, kbn, _createClass, ProgressChartCtrl;

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
		}, function (_lodash) {
			_ = _lodash.default;
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
						barsArr: []
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
						this.addProgress.bind(this);
						this.addBarMember.bind(this);
						this.delProgress.bind(this);
						this.delBarMember.bind(this);
					}
				}, {
					key: 'setUnitFormat',
					value: function setUnitFormat(subItem, obj) {
						obj.format = subItem.value;
						obj.valueShow = this.formatValue(obj.value, subItem.value);
						this.render();
					}
				}, {
					key: 'getDecimalsForValue',
					value: function getDecimalsForValue(value) {
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
						if (Math.floor(value) === value) {
							dec = 0;
						}

						var result = {};
						result.decimals = Math.max(0, dec);
						result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

						return result;
					}
				}, {
					key: 'formatValue',
					value: function formatValue(value, format) {
						var decimalInfo = this.getDecimalsForValue(value);
						var formatFunc = kbn.valueFormats[format];
						if (formatFunc) {
							return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
						}
						return value;
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
					key: 'checkSeries',
					value: function checkSeries(targets, series) {
						var seriesFull = [];
						if (targets.length == series.length) {
							return seriesFull = series;
						} else {
							var fillFlag = false;
							for (var i = 0, length = targets.length; i < length; i++) {
								for (var j = 0, sLen = series.length; j < sLen; j++) {
									if (targets[i].item.filter == series[j].target) {
										seriesFull.push(series[j]);
										fillFlag = false;
										break;
									} else {
										fillFlag = true;
									}
								}
								if (fillFlag) {
									seriesFull.splice(i, 0, { 'target': targets[i].item.filter, datapoints: [] });
								}
							}
						}
						return seriesFull;
					}
				}, {
					key: 'parseSeries',
					value: function parseSeries(series) {
						if (series && series.length > 0) {
							series = this.checkSeries(this.panel.targets, series);
							var that = this;
							this.panel.progressArr.forEach(function (value, index, arr) {
								if (series[index] && series[index].datapoints) {
									var datapoints = series[index].datapoints;
									if (datapoints.length > 0) {
										value.value = datapoints[datapoints.length - 1][0];
										value.valueShow = that.formatValue(value.value, value.format);
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
										value.percent = '0';
									}
								}
							});

							var total = 0;
							var proLen = this.panel.progressArr.length;
							var perTotal = 0;
							for (var i = 0; i < this.panel.barsArr.length; i++) {
								var indTmp = proLen + i;
								if (series[indTmp] && series[indTmp].datapoints) {
									var datapoints = series[indTmp].datapoints;
									if (datapoints.length > 0) {
										this.panel.barsArr[i].value = datapoints[datapoints.length - 1][0];
										total += this.panel.barsArr[i].value;
										this.panel.barsArr[i].valueShow = this.formatValue(this.panel.barsArr[i].value, this.panel.barsArr[i].format);
									} else {
										this.panel.barsArr[i].value = 0;
										this.panel.barsArr[i].valueShow = 'N/A';
									}
								} else {
									total += this.panel.barsArr[i].value;
								}
							}
							this.panel.barsArr.forEach(function (value, index, arr) {
								if (index == arr.length - 1) {
									value.percent = 100 - perTotal;
								} else {
									if (value.value) {
										value.percent = value.value / total * 100;
										value.percent = Math.floor(value.percent);
										perTotal += value.percent;
									}
								}
							});
						}
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
						return { 'width': proObj.percent + '%' };
					}
				}, {
					key: 'addProgress',
					value: function addProgress() {
						var objTemp = {
							label: '', unit: '', type: 'solid', value: 0, percent: '0%', format: 'short'
						};
						this.panel.progressArr.push(objTemp);
					}
				}, {
					key: 'addBarMember',
					value: function addBarMember() {
						var objTemp = {
							label: '', unit: '', value: 0, percent: '0%', format: 'short'
						};
						this.panel.barsArr.push(objTemp);
					}
				}, {
					key: 'delProgress',
					value: function delProgress(index) {
						this.panel.progressArr.splice(index, 1);
					}
				}, {
					key: 'delBarMember',
					value: function delBarMember(index) {
						this.panel.barsArr.splice(index, 1);
						var total = 0;
						this.panel.barsArr.forEach(function (value, index, arr) {
							total += value.value;
						});
						this.panel.barsArr.forEach(function (value, index, arr) {
							value.percent = value.value / total * 100 + '%';
						});
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
