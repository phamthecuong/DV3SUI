(function () {
    'use strict';

    angular.module('app').directive('ptzControl', ptzControl);

    ptzControl.$inject = ["$timeout", "ApiFactory", "PanesFactory", "LISTENER_NAMES"];

    function ptzControl($timeout, ApiFactory, PanesFactory, listenerNames) {
        return {
            replace: true,
            template: template,
            link: linkFn
        };

        function template() {
            return [
                '<div class="ptz-control">',
                    '<canvas id="ptzCanvas{{ index }}" class="canvas"></canvas>',
                '</div>'
            ].join('\n');
        }

        function linkFn(scope, element, attrs) {

            var el = $(element);
            var canvasEl = el.find('.canvas');
            var elProps = {
                w: el.innerWidth() - 10,
                h: el.innerHeight() - 10
            };

            $timeout(canvasDraw, 100);

            $(window).on('resize', resize);

            var cWidth;
            var cHeight;
            var theCanvas;
            var ctx;

            var xValue = 0;
            var yValue = 0;
            var zValue = 1;
            var irisValue = 2.8;
            var focusValue = 32;

            var cameraMoved = true;

            scope.cameraX = 0;
            scope.cameraY = 0;
            scope.cameraZ = 0;
            scope.cameraIris = 0;
            scope.cameraFocus = 0;

            scope.$watch('cameraX', camera);
            scope.$watch('cameraY', camera);

            PanesFactory.subscribeEvent(scope, listenerNames.FULL_SCREEN_PANNEL, resize);
            PanesFactory.subscribeEvent(scope, listenerNames.DISPLAY_TIMELINE, resize);
            PanesFactory.subscribeEvent(scope, listenerNames.DISPLAY_SEARCH_VIEW, resize);


    /* -------------------- FUNCTION DETAIL -------------------- */


            function resize() {
                $timeout(canvasDraw, 200);
            }

            function camera(n, o) {
                if(Math.abs(n-o) >= 0.01) {
                    var moveByData = {
                        speed: {
                            x: scope.cameraX,
                            y: scope.cameraY,
                            z: scope.cameraZ,
                            iris: scope.cameraIris,
                            focus: scope.cameraFocus
                        },
                        time: 1000
                    };

                    cameraMoveBy(moveByData);
                }
            }

            function canvasDraw() {
                 elProps = {
                    w: el.innerWidth() - 10,
                    h: el.innerHeight() - 10
                };
                if(elProps.w >= elProps.h) {
                    cWidth = elProps.h;
                    cHeight = elProps.h;
                } else {
                    cWidth = elProps.w;
                    cHeight = elProps.w;
                }

                var letsdraw;
                canvasEl.css({ width: cWidth, height: cHeight });
                theCanvas = document.getElementById('ptzCanvas'+scope.index);

                if(theCanvas !== null) {
                    var ptzId = 'ptzCanvas' + scope.index;
                    ctx = theCanvas.getContext('2d');
                    theCanvas.width = canvasEl.width();
                    theCanvas.height = canvasEl.height();
                    var mousedownCount = false;
                    var _cw = theCanvas.width/2;
                    var _ch = theCanvas.height/2;
                    var off = 5;
                    var rect = theCanvas.getBoundingClientRect();

                    canvasEl.mousemove(mousemove);
                    canvasEl.mousedown(mousedown);
                    canvasEl.mouseup(mouseup);
                    $(window).mouseup(windowMouseup);
                }

                function mousemove(event) {
                    event.stopPropagation();
                    ctx.clearRect(0,0,theCanvas.width,theCanvas.height);
                    drawCircles();
                    drawOnMouseMove( event );

                    if(!letsdraw) {
                        ctx.strokeStyle = '#FFFFFF';
                        if ( cameraMoved ) {
                            xValue = 0;
                            yValue = 0;
                            scope.cameraX = xValue;
                            scope.cameraY = yValue;
                        } else {
                            var _nx = _cw-(event.pageX-rect.left);
                            var _ny = _ch-(event.pageY-rect.top);
                            var _tx = (event.pageX-(_cw+rect.left))/(_cw-off);
                            var _ty = (-(event.pageY-(_ch+rect.top)))/(_cw-off);

                            xValue = _tx;
                            yValue = _ty;
                            scope.cameraX = xValue;
                            scope.cameraY = yValue;
                            ctx.strokeStyle = '#1cbbff';
                        }
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(_cw, _ch);
                        ctx.lineTo(event.pageX-rect.left, event.pageY-rect.top);
                        ctx.stroke();
                    }
                }

                function drawOnMouseMove ( event ) {
                    var mouseX = event.pageX-rect.left;
                    var mouseY = event.pageY-rect.top;

                //  small filled circle on mouse position
                    ctx.beginPath();
                    ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'lime';
                    ctx.fill();

                    var x = _cw - mouseX;
                    var y = _ch - mouseY;
                    var alpha = Math.atan2(-y,-x);
                    var radius = _cw-off;
                    var zx = _cw + radius*Math.cos(alpha);
                    var zy = _ch + radius*Math.sin(alpha);
                    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                    ctx.lineWidth = 8;
                    ctx.beginPath();
                    ctx.moveTo(_cw, _ch);
                    ctx.lineTo(zx, zy);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(zx, zy, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'cyan';
                    ctx.fill();
                }

                function drawCircles () {

                //  outer circle
                    ctx.beginPath();

                    if(_cw <= off) { return; }

                    ctx.arc(_cw, _ch, _cw-off, 0, 2 * Math.PI, false);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fill();
                //  middle circle
                    ctx.beginPath();
                    ctx.arc(_cw, _ch, theCanvas.width/3, 0, 2 * Math.PI, false);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fill();
                //  inner circle
                    ctx.beginPath();
                    ctx.arc(_cw, _ch, theCanvas.width/5, 0, 2 * Math.PI, false);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fill();
                }

                function mousedown(event) {
                    event.stopPropagation();
                    letsdraw = {
                        x: event.pageX - rect.left,
                        y: event.pageY - rect.top
                    };
                }

                function mouseup(event) {
                    letsdraw = null;
                    var moveByData = {
                        speed: { x: 0, y: 0, z: scope.cameraZ, iris: scope.cameraIris, focus: scope.cameraFocus },
                        time: 1000
                    };
                    cameraMoveBy(moveByData);
                    cameraMoved = false;
                }

                function windowMouseup(event) {
                    event.stopPropagation();
                    letsdraw = null;
                }
            }

            function cameraMoveBy(data) {
                ApiFactory
                .cameraMoveBy(scope.pane.live.sessionId, scope.pane.live.paneId, data)
                .then(
                    function(res) {
                        console.log("Test moveby success");
                        cameraMoved = true;
                    }, function(err) {
                    }
                );
            }

        }
    }
})();
