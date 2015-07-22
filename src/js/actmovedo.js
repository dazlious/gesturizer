var actMoveDo = actMoveDo || (function ($) {
        "use strict";

        function ActMoveDo(settings) {

            this.settings = {
                container: ".actmovedo",
                isTouchDevice: this.checkTouch(),
                isMouseDevice: this.checkMouse(),
                zoom: {
                    min: 0.0,
                    max: 1.0,
                    initial: 0.5,
                    steps: {
                        tap: 0.2,
                        scroll: 0.05
                    }
                },
                timeTreshold: {
                    tap: 200,
                    doubletap: 200,
                    longpress: 500,
                    swipeFlick: 300
                },
                distanceTreshold: {
                    swipeFlick: 100
                },
                callbacks: {
                    tap: null,
                    doubletap: null,
                    longpress: null,
                    pan: null,
                    flick: null,
                    zoom: null
                }
            };

            this.settings.eventNames = {
                start: {
                    touch: "touchstart",
                    mouse: "mousedown"
                },
                move: {
                    touch: "touchmove",
                    mouse: "mousemove"
                },
                end: {
                    touch: "touchend",
                    mouse: "mouseup"
                },
                scroll: this.getScrollEventName()
            };

            $.extend(this.settings, settings || {});

            this.current = {
                downEvent: false,
                hasMoved: false,
                multitouch: false,
                lastAction: null,
                start: null,
                timeStart: null,
                timeEnd: null,
                timeout: null
            };

            this.init();
            this.bindEvents();

        }

        ActMoveDo.prototype.init = function () {
            this.$container = $(this.settings.container);
        };

        ActMoveDo.prototype.bindEvents = function () {

            // if device is touch
            if (this.settings.isTouchDevice) {
                this.bindTouchEvents();
            }

            // if device is mouse
            if (this.settings.isMouseDevice) {
                this.bindMouseEvents();
            }

        };

        ActMoveDo.prototype.bindTouchEvents = function () {
            this.$container.on(this.settings.eventNames.start.touch, this.startHandler.bind(this));
            this.$container.on(this.settings.eventNames.move.touch, this.moveHandler.bind(this));
            this.$container.on(this.settings.eventNames.end.touch, this.endHandler.bind(this));
        };

        ActMoveDo.prototype.bindMouseEvents = function () {
            this.$container.on(this.settings.eventNames.scroll, this.scrollHandler.bind(this));
            this.$container.on(this.settings.eventNames.start.mouse, this.startHandler.bind(this));
            this.$container.on(this.settings.eventNames.move.mouse, this.moveHandler.bind(this));
            this.$container.on(this.settings.eventNames.end.mouse, this.endHandler.bind(this));
        };

        ActMoveDo.prototype.scrollHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var e = this.getEvent(event);
            this.getScrollDirection(e);
        };

        ActMoveDo.prototype.startHandler = function (event) {

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event);

            this.current.target = event.target;
            this.current.downEvent = true;
            this.current.timeStart = event.timeStamp;

            if (this.current.timeout) {
                this.current.timeout = clearTimeout(this.current.timeout);
            }

            // mouse is used
            if (e instanceof MouseEvent) {
                this.current.start = this.getRelativePosition(e);
            } // touch is used
            else {
                // singletouch startet
                if (e.length <= 1) {
                    this.current.start = this.getRelativePosition(e[0]);
                } // multitouch started
                else if (e.length === 2) {
                    this.current.multitouch = true;
                    var pos1 = this.getRelativePosition(e[0]),
                        pos2 = this.getRelativePosition(e[1]);
                    this.current.distance = this.getDistance(pos1, pos2);
                    this.current.start = [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2];
                }
            }
            switch (this.current.lastAction) {
                case null:
                    this.current.lastAction = "tap";
                    break;
                case "tap":
                    this.current.lastAction = "doubletap";
                    break;
                default:
                    break;
            }

            console.log(this.current);
        };

        ActMoveDo.prototype.moveHandler = function (event) {
            // if touchstart event was not fired
            if (!this.current.downEvent) {
                return false;
            }

            this.current.hasMoved = true;
            this.current.lastAction = "move";

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event),
                currentPos,
                currentDist,
                lastPos = (this.current.move) ? this.current.move : this.current.start,
                lastTime = (this.current.time) ? this.current.time : this.current.timeStart,
                currentTime = event.timeStamp;

            this.current.time = event.timeStamp;

            if (e instanceof MouseEvent) {
                currentPos = this.getRelativePosition(e);
            } // touch is used
            else {
                // singletouch startet
                if (e.length <= 1) {
                    currentPos = this.getRelativePosition(e[0]);
                }
            }

            currentDist = this.getDistance(lastPos, currentPos);
            var timeDiff = (currentTime - lastTime);

            this.current.speed = (currentDist / timeDiff) * 1000;
            this.current.move = currentPos;

            this.eventCallback(this.settings.callbacks.pan, {
                target: this.current.target,
                positions: {
                    start: this.current.start,
                    current: this.current.move,
                    last: lastPos
                },
                timeElapsed: {
                    sinceLast: timeDiff,
                    sinceStart: currentTime - this.current.timeStart
                },
                distanceToLastPoint: currentDist,
                speed: this.current.speed
            });

        };

        ActMoveDo.prototype.endHandler = function (event) {

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event);

            this.current.timeEnd = event.timeStamp;

            var timeDiff = this.current.timeEnd - this.current.timeStart;

            if (e instanceof MouseEvent) {
                this.current.end = this.getRelativePosition(e);
            } // touch is used
            else {
                // singletouch startet
                if (e.length <= 1) {
                    this.current.end = this.getRelativePosition(e[0]);
                }
            }

            if (!this.current.hasMoved && this.current.downEvent && !this.current.multitouch) {
                switch (this.current.lastAction) {
                    case "tap":
                        if (timeDiff < this.settings.timeTreshold.longpress) {
                            this.setTimeoutForEvent(this.settings.callbacks.tap, this.settings.timeTreshold.tap, {
                                target: this.current.target,
                                positions: {
                                    start: this.current.start,
                                    end: this.current.end
                                }
                            });
                        } else {
                            this.eventCallback(this.settings.callbacks.longpress, {
                                target: this.current.target,
                                positions: {
                                    start: this.current.start,
                                    end: this.current.end
                                }
                            });
                        }
                        break;
                    case "doubletap":
                        this.setTimeoutForEvent(this.settings.callbacks.doubletap, this.settings.timeTreshold.doubletap, {
                            target: this.current.target,
                            positions: {
                                start: this.current.start,
                                end: this.current.end
                            }
                        });
                        break;
                    default:
                        this.current.lastAction = null;
                }
            }
            else if (this.current.hasMoved && this.current.downEvent && !this.current.multitouch) {
                switch (this.current.lastAction) {
                    default:
                        this.current.lastAction = null;
                }
            }

            this.current.downEvent = false;
            this.current.hasMoved = false;
            this.current.multitouch = false;
        };

        ActMoveDo.prototype.setTimeoutForEvent = function (callback, timeout, args) {
            this.current.timeout = setTimeout(this.eventCallback.bind(this, callback, args), timeout);
        };

        ActMoveDo.prototype.eventCallback = function (callback, args) {
            if (callback) {
                callback(args);
            }
            this.current.lastAction = null;
        };

        ActMoveDo.prototype.getRelativePosition = function (e) {
            var target = e.target || e.srcElement,
                clientBounds = target.getBoundingClientRect(),
                x = (e.clientX - clientBounds.left) / clientBounds.width,
                y = (e.clientY - clientBounds.top) / clientBounds.height;
            return [x, y];
        };

        ActMoveDo.prototype.getDistance = function (point1, point2) {
            var a = point1[0] - point2[0],
                b = point1[1] - point2[1];
            return Math.sqrt(a * a + b * b);
        };

        ActMoveDo.prototype.getScrollDirection = function (event) {
            var axis = parseInt(event.axis, 10);
            // down
            if ((event.deltaY > 0) || ((axis === 2) && (event.detail > 0))) {
                console.log("down");
            }
            // up
            else if ((event.deltaY < 0) || ((axis === 2) && (event.detail < 0))) {
                console.log("up");
            }
        };

        ActMoveDo.prototype.checkTouch = function () {
            if (!navigator.MaxTouchPoints) {
                navigator.MaxTouchPoints = 0;
            }
            if (!navigator.msMaxTouchPoints) {
                navigator.msMaxTouchPoints = 0;
            }
            return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        };

        ActMoveDo.prototype.checkMouse = function () {
            return ('onmousedown' in window);
        };

        ActMoveDo.prototype.getScrollEventName = function () {
            if ('onmousewheel' in window) {
                return "mousewheel";
            } else {
                return "DOMMouseScroll";
            }
        };

        ActMoveDo.prototype.getEvent = function (e) {
            if (!e.originalEvent.touches) {
                e.originalEvent.touches = undefined;
            }
            if (!e.originalEvent.changedTouches) {
                e.originalEvent.changedTouches = undefined;
            }
            jQuery.event.fix(e);
            return e.originalEvent.touches || e.originalEvent.changedTouches || e.originalEvent;
        };

        return ActMoveDo;

    }(jQuery));