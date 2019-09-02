(function () {
    'use strict';

    function imageLoad(URL) {
        return {
            scope: {
                data: '=nsrc'
            },
            restrict: 'A',
            link: linkFn
        };

        function linkFn(scope, element, attrs) {
            loadState(element);

            scope.$watch(function () {
                return scope.data;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) return;
                loadState(element);
            });

            element.bind('load', function () {
                element.parent().find('.loadding').remove();
                element.css({
                    'display': 'block'
                });
            });

            element.bind('error', function () {
                element.parent().find('.loadding').remove();
                element.css({
                    'display': 'block'
                });
            });

        }

        function loadState(element) {
        element.parent().find('span').remove();
        element.css({
            'display': 'none'
        });
        // element.parent().append('<img style="width: 32px; height: 32px; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%);" class="loadding" src="images/loading.gif">');
        element.parent().find('.loadding').remove();
        element.parent().append('<div class="loadding cssload-spin-box"></div>');
        }
    }

    function onClickAndHold($parse, $interval) {
        return {
            link: function (scope, element, attrs) {
                var clickAndHoldFn = $parse(attrs.onClickAndHold);
                var doNotTriggerClick;
                var timeoutHandler;
                element.on('mousedown', function () {
                    $interval.cancel(timeoutHandler);
                    timeoutHandler = $interval(function () {
                        clickAndHoldFn(scope, {
//                            $event: event
                        });
                    }, 10);
                });
                element.on('mouseup mouseout', function() {
                    $interval.cancel(timeoutHandler);
                });

                if (attrs.onClick) {
                    var clickFn = $parse(attrs.onClick);
                    element.on('click', function (event) {
                        if (doNotTriggerClick) {
                            doNotTriggerClick = false;
                            return;
                        }
                        clickFn(scope, {
                            $event: event
                        });
                        scope.$apply();
                    });
                }
            }
        };
    }

    function draggable($document){
        return {
                restrict: 'A',
                scope: {
                    dragOptions: '=ngDraggable'
                },
                link: function (scope, elem) {
                    var startX, startY, x = 0,
                        y = 0,
                        start, stop, drag, container;

                    var width = elem[0].offsetWidth,
                        height = elem[0].offsetHeight;

                    // Obtain drag options
                    if (scope.dragOptions) {
                        start = scope.dragOptions.start;
                        drag = scope.dragOptions.drag;
                        stop = scope.dragOptions.stop;
                        var id = scope.dragOptions.container;
                        if (id) {
                        container = document.getElementById(id).getBoundingClientRect();
                        }
                    }

                    // Bind mousedown event
                    elem.on('mousedown', function (e) {
                        e.preventDefault();
                        startX = e.clientX - elem[0].offsetLeft;
                        startY = e.clientY - elem[0].offsetTop;
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);
                        if (start) start(e);
                    });

                    // Handle drag event
                    function mousemove(e) {
                        y = e.clientY - startY;
                        x = e.clientX - startX;
                        setPosition();
                        if (drag) drag(e);
                    }

                    // Unbind drag events
                    function mouseup(e) {
                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);
                        if (stop) stop(e);
                    }

                    // Move element, within container if provided
                    function setPosition() {
                        if (container) {
                        if (x < container.left) {
                            x = container.left;
                        } else if (x > container.right - width) {
                            x = container.right - width;
                        }
                        if (y < container.top) {
                            y = container.top;
                        } else if (y > container.bottom - height) {
                            y = container.bottom - height;
                        }
                        }

                        elem.css({
                        top: y + 'px',
                        left: x + 'px'
                        });
                    }
                }
        };
    }

    function autoFocus($timeout) {
        return {
            link: function(scope, element, attrs) {
                attrs.$observe("autoFocus", function(newValue){
                    if (newValue === "true")
                        $timeout(function(){element.focus()});
                });
            }
        }
    }

    function autoHideToolbar($timeout) {
        return {
            link: linkFn
        };

        function linkFn(scope, element, attrs) {
            if(isTouchSupported()) {
                var hideToolbar = false;
                var topbarEl = angular.element(element[0].querySelector('.videoPane-toolbar-top'));
                var bottombarEl = angular.element(element[0].querySelector('.videoPane-toolbar-bottom'));
                var controlScreenEl = angular.element(element[0].querySelector('.control-screen'));
                var outerContainer = angular.element(".outer-container");
/*
                element.on('click', function(event) {
                    if($( event.target ).is("video") || event.target.className.indexOf('janus-webrtc') > -1) {
                      var ptzControlEl = angular.element(element[0].querySelector('.ptz-control-container'))

                      if(hideToolbar) {
                        $timeout.cancel(hideToolbar);
                        topbarEl.addClass('hide-top-toolbar');
                        bottombarEl.addClass('hide-bottom-toolbar');
                        controlScreenEl.addClass('hide-control-screen');
                        ptzControlEl.addClass('hide-ptz-control');
                        hideToolbar = false;
                      } else {
                        hideToolbar = false;
                        topbarEl.removeClass('hide-top-toolbar');
                        bottombarEl.removeClass('hide-bottom-toolbar');
                        controlScreenEl.removeClass('hide-control-screen');
                        ptzControlEl.removeClass('hide-ptz-control');

                        hideToolbar = $timeout(function() {
                          topbarEl.addClass('hide-top-toolbar');
                          bottombarEl.addClass('hide-bottom-toolbar');
                          controlScreenEl.addClass('hide-control-screen');
                          ptzControlEl.addClass('hide-ptz-control');
                          hideToolbar = false;
                        }, 5000);
                      }
                    }
                })*/

                jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
                  return this.each(function(){
                    var clicks = 0, self = this;
                    jQuery(this).click(function(event){
                      clicks++;
                      if (clicks == 1) {
                        setTimeout(function(){
                          if(clicks == 1) {
                            single_click_callback.call(self, event);
                          } else {
                            double_click_callback.call(self, event);
                          }
                          clicks = 0;
                        }, timeout || 300);
                      }
                    });
                  });
                }

              $(element).single_double_click(function (event) {
                if($( event.target ).is("video") || event.target.className.indexOf('janus-webrtc') > -1) {
                  var ptzControlEl = angular.element(element[0].querySelector('.ptz-control-container'))

                  if(hideToolbar) {
                    $timeout.cancel(hideToolbar);
                    topbarEl.addClass('hide-top-toolbar');
                    bottombarEl.addClass('hide-bottom-toolbar');
                    controlScreenEl.addClass('hide-control-screen');
                    ptzControlEl.addClass('hide-ptz-control');
                    hideToolbar = false;
                  } else {
                    hideToolbar = false;
                    topbarEl.removeClass('hide-top-toolbar');
                    bottombarEl.removeClass('hide-bottom-toolbar');
                    controlScreenEl.removeClass('hide-control-screen');
                    ptzControlEl.removeClass('hide-ptz-control');

                    hideToolbar = $timeout(function() {
                      topbarEl.addClass('hide-top-toolbar');
                      bottombarEl.addClass('hide-bottom-toolbar');
                      controlScreenEl.addClass('hide-control-screen');
                      ptzControlEl.addClass('hide-ptz-control');
                      hideToolbar = false;
                    }, 5000);
                  }
                }
              }, function () {
                if(!outerContainer.hasClass("fullscreen-mobile")) {
                  outerContainer.addClass("fullscreen-mobile");
                } else {
                  outerContainer.removeClass("fullscreen-mobile");
                }
              })
            }

            function isTouchSupported() {
                var msTouchEnabled = window.navigator.msMaxTouchPoints;
                var generalTouchEnabled = "ontouchstart" in document.createElement("div");

                if(msTouchEnabled || generalTouchEnabled) {
                    return true;
                }

                return false;
            }
        }
    }

    angular.module('app')
        .directive('imageLoad', imageLoad)
        .directive('onClickAndHold', onClickAndHold)
        .directive('autoFocus', autoFocus)
        .directive('ngDraggable', draggable)
        .directive('autoHideToolbar', autoHideToolbar);
})();
