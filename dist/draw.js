"use strict";

System.register([], function (_export, _context) {
    "use strict";

    var defaultOpt, option, toRadian, toAngle, calLineTo, doughnut, Draw;
    return {
        setters: [],
        execute: function () {
            defaultOpt = {
                width: 150,
                height: 150,
                padding: 10,
                gutter: 0,
                colors: ["#67C23A", //绿色 
                "gold", "#409EFF", //蓝色 
                "#F56C6C", //红色
                "grey", "#E6A23C", //橙色
                "LightPink", "black", "yellow", "white"],
                bgColor: "#1f1d1d",
                data: [1, 2, 3, 4]
            };

            option = function option(opt) {
                return {
                    dom: opt.dom,
                    width: opt.width ? opt.width : defaultOpt.width,
                    height: opt.height ? opt.height : defaultOpt.height,
                    padding: defaultOpt.padding,
                    gutter: defaultOpt.gutter,
                    colors: defaultOpt.colors,
                    bgColor: defaultOpt.bgColor,
                    data: opt.data ? opt.data : defaultOpt.data
                };
            };

            toRadian = function toRadian(angle) {
                return angle / 180 * Math.PI;
            };

            toAngle = function toAngle(radian) {
                return radian / Math.PI * 180;
            };

            calLineTo = function calLineTo(a, r) {
                a = -90 + a;
                var x = Math.cos(a * 2 * Math.PI / 360) * r;
                var y = Math.sin(a * 2 * Math.PI / 360) * r;
                return { x: x, y: y };
            };

            doughnut = function doughnut(opt) {
                console.log("draw.js/doughnut is run.");
                console.log("opt", opt);
                var drawSize = opt.width <= opt.height ? opt.width : opt.height;
                var Num = opt.data.length;
                var cv = opt.dom;
                var ctx = cv.getContext("2d");
                var ctx2 = cv.getContext("2d");

                // --------------------------------------//
                var x0 = (opt.width - opt.padding * 2) / 2 + opt.padding,
                    y0 = (opt.height - opt.padding * 2) / 2 + opt.padding,
                    radius = (drawSize - opt.padding * 2) / 2,
                    radiusInSide = radius * 0.75,
                    startAngle = -90,
                    step = 360 / Num;
                var colors = opt.colors.slice(0, opt.data.length);

                // 绘制饼图
                colors.forEach(function (value, index) {
                    ctx.beginPath();
                    ctx.fillStyle = value;
                    ctx.moveTo(x0, y0);
                    ctx.arc(x0, y0, radius, toRadian(startAngle), toRadian(startAngle += step));
                    ctx.fill();
                });
                // 绘制分割线
                colors.forEach(function (value, index) {
                    var lineTo = calLineTo(step * index, radius);
                    ctx2.beginPath();
                    ctx2.strokeStyle = opt.bgColor;
                    ctx2.lineWidth = radius / 20;
                    ctx2.moveTo(x0, y0);
                    ctx2.lineTo(x0 + lineTo.x, y0 + lineTo.y);
                    ctx2.stroke();
                    ctx2.closePath();
                });
                // 绘制内部圆
                ctx.beginPath();
                ctx.fillStyle = opt.bgColor;
                ctx.moveTo(x0, y0);
                ctx.arc(x0, y0, radiusInSide, 0, 360, false);
                ctx.fill();
                ctx.closePath();
            };

            _export("Draw", Draw = function Draw(opt) {
                doughnut(option(opt));
            });

            _export("Draw", Draw);
        }
    };
});
//# sourceMappingURL=draw.js.map
