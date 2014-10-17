(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["angular", "chartist"], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('angular'), require('chartist'));
    } else {
        root.ngChartist = factory(root.angular, root.Chartist);
    }
}(this, function (angular, Chartist) {

    'use strict';

    var ngChartist = angular.module('ngChartist', []);

    ngChartist.directive('chartist', ['$timeout', function ($timeout) {

        var CHART_TYPES = {
            Bar: {
                dataClass: '.ct-bar'
            },
            Line: {
                dataClass: '.ct-point'
            },
            Pie: {
                dataClass: '.ct-slice'
            }
        };

        function ChartistCtrl($scope) {
            // chartist specific
            this.data = $scope.data();
            this.type = $scope.type;

            this.events = $scope.events() || {};
            this.options = $scope.options() || null;
            this.responsiveOptions = $scope.responsiveOptions() || null;

            // non-chartist hooks
            this.handlers = $scope.handlers() || {};
        }

        return {
            restrict: 'EA',
            scope: {
                // mandatory
                data: '&chartistData',
                type: '@chartistChartType',
                // optional
                events: '&chartistEvents',
                options: '&chartistChartOptions',
                responsiveOptions: '&chartistResponsiveOptions',
                // other hooks
                handlers: '&chartistHandlers'
            },
            controller: ['$scope', ChartistCtrl],
            link: function (scope, element, attrs, ChartistCtrl) {
                var el = element[0];

                var data = ChartistCtrl.data;
                var type = ChartistCtrl.type;
                var events = ChartistCtrl.events;
                var options = ChartistCtrl.options;
                var responsiveOptions = ChartistCtrl.responsiveOptions;

                var handlers = ChartistCtrl.handlers;

                // init the chart
                var chart = Chartist[type](el, data, options, responsiveOptions);
                // store this when binding handlers
                var chartType = CHART_TYPES[type].dataClass;

                // register events that chartist emits
                Object.keys(events).forEach(function (eventName) {
                    var handler = events[eventName];

                    chart.on(eventName, handler);
                });

                $timeout(function () {
                    // convert the nodelist into an array so we can iterate nicely
                    var dataPoints = [].map.call(el.querySelectorAll(chartType), function (element) {
                        return element;
                    });

                    Object.keys(handlers).forEach(function (handler) {

                        dataPoints.forEach(function (element) {
                            element.addEventListener(handler, function (event) {
                                var $element = angular.element(this);

                                handlers[handler](event, $element, $element.attr('ct:value'));
                            });
                        });
                    });
                });

                // Deeply watch the data and create a new chart if data is updated
                // scope.$watch(scope.data, function(newData) {
                //     chart.detach();
                //     chart = Chartist[type](el, newData, options, responsiveOptions);
                // }, true);
            }
        };
    }]);

    return ngChartist;

}));