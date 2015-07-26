var actMoveDo = actMoveDo || (function ($) {
        "use strict";

        function ActMoveDo(settings) {

            this.settings = {
                container: ".actmovedo",
                isTouchDevice: this.checkTouch(),
                isMouseDevice: this.checkMouse(),
                timeTreshold: {
                    tap: 200,
                    doubletap: 200,
                    hold: 500,
                    swipe: 300,
                    flick: 50
                },
                distanceTreshold: {
                    swipe: 180
                },
                autoFireHold: null,
                callbacks: {
                    tap: null,
                    tapHold: null,
                    doubletap: null,
                    hold: null,
                    pan: null,
                    swipe: null,
                    flick: null,
                    zoom: null,
                    wheel: null,
                    pinch: null
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
                move: null,
                end: null,
                time: null,
                timeStart: null,
                timeEnd: null,
                timeout: null,
                holdTimeout: null
            };

            this.init();
            this.bindEvents();

        }

        ActMoveDo.prototype.init = function () {
            this.$container = $(this.settings.container);
            this.container = $(this.settings.container)[0];
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
            event = event || window.event;

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event) || event.originalEvent,
                directions = this.getScrollDirection(e),
                position = this.getRelativePosition(e);

            if (this.settings.callbacks.wheel) {
                this.eventCallback(this.settings.callbacks.wheel, {
                    target: event.target,
                    directions: directions,
                    position: position
                });
            }

            if (this.settings.callbacks.zoom) {
                this.eventCallback(this.settings.callbacks.zoom, {
                    target: event.target,
                    direction: (directions.indexOf("up") > -1) ? "in" : (directions.indexOf("down") > -1) ? "out" : "none",
                    position: position,
                    factor: (directions.indexOf("up") > -1) ? 1 : (directions.indexOf("down") > -1) ? -1 : 0
                });
            }
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
                    if (this.settings.autoFireHold) {
                        this.setTimeoutForEvent(this.settings.callbacks.hold, this.settings.autoFireHold, {
                            target: this.current.target,
                            positions: {
                                start: this.current.start
                            }
                        }, true);
                    }
                    break;
                case "tap":
                    this.current.lastAction = "doubletap";
                    if (this.settings.autoFireHold) {
                        this.setTimeoutForEvent(this.settings.callbacks.tapHold, this.settings.autoFireHold, {
                            target: this.current.target,
                            positions: {
                                start: this.current.start
                            }
                        }, true);
                    }
                    break;
                default:
                    break;
            }
        };

        ActMoveDo.prototype.moveHandler = function (event) {
            // if touchstart event was not fired
            if (!this.current.downEvent) {
                return false;
            }

            if (this.current.timeout) {
                this.current.timeout = clearTimeout(this.current.timeout);
            }
            if (this.current.holdTimeout) {
                this.current.holdTimeout = clearTimeout(this.current.holdTimeout);
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
                currentDist = this.getDistance(lastPos, currentPos);
            } // touch is used
            else {
                // singletouch startet
                if (e.length <= 1) {
                    currentPos = this.getRelativePosition(e[0]);
                    currentDist = this.getDistance(lastPos, currentPos);
                } else if (e.length === 2) {
                    var pos1 = this.getRelativePosition(e[0]),
                        pos2 = this.getRelativePosition(e[1]);
                    currentDist = this.getDistance(pos1, pos2);
                    currentPos = [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2];
                }
            }

            var timeDiff = (currentTime - lastTime);

            if (this.current.multitouch) {
                this.current.difference = currentDist - this.current.distance;
                this.current.distance = currentDist;
                this.current.oldMove = this.current.move;
                this.current.move = currentPos;
                if (this.settings.callbacks.pinch) {
                    this.eventCallback(this.settings.callbacks.pinch, {
                        target: event.target,
                        positions: {
                            start: this.current.start,
                            current: this.current.move,
                            last: this.current.oldMove
                        },
                        distance: {
                            current: currentDist,
                            differenceToLast: this.current.difference
                        }
                    });
                }
                if (this.settings.callbacks.zoom) {
                    this.eventCallback(this.settings.callbacks.zoom, {
                        target: event.target,
                        positions: {
                            start: this.current.start,
                            current: this.current.move,
                            last: this.current.oldMove
                        },
                        direction: (this.current.difference < 0) ? "out" : (this.current.difference > 0) ? "in" : "none",
                        factor: this.current.difference
                    });
                }
            } else {
                this.current.speed = this.calculateSpeed(currentDist, timeDiff);

                this.current.oldMove = this.current.move;
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
            }


        };

        ActMoveDo.prototype.endHandler = function (event) {

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event);

            this.current.timeEnd = event.timeStamp;

            var timeDiff = this.current.timeEnd - this.current.timeStart,
                timeDiffToLastMove = this.current.timeEnd - this.current.time;


            if (this.current.holdTimeout) {
                this.current.holdTimeout = clearTimeout(this.current.holdTimeout);
            }

            if (e instanceof MouseEvent) {
                this.current.end = this.getRelativePosition(e);
            } // touch is used
            else {
                // singletouch startet
                if (e.length <= 1) {
                    this.current.end = this.getRelativePosition(e[0]);
                }
            }

            // called only when not moved
            if (!this.current.hasMoved && this.current.downEvent && !this.current.multitouch) {
                switch (this.current.lastAction) {
                    case "tap":
                        if (timeDiff < this.settings.timeTreshold.hold) {
                            this.setTimeoutForEvent(this.settings.callbacks.tap, this.settings.timeTreshold.tap, {
                                target: this.current.target,
                                positions: {
                                    start: this.current.start
                                }
                            });
                        } else {
                            this.eventCallback(this.settings.callbacks.hold, {
                                target: this.current.target,
                                positions: {
                                    start: this.current.start
                                }
                            });
                        }
                        break;
                    case "doubletap":
                        if (timeDiff < this.settings.timeTreshold.hold) {
                            this.setTimeoutForEvent(this.settings.callbacks.doubletap, this.settings.timeTreshold.doubletap, {
                                target: this.current.target,
                                positions: {
                                    start: this.current.start,
                                    end: this.current.end
                                }
                            });
                        } else {
                            this.eventCallback(this.settings.callbacks.tapHold, {
                                target: this.current.target,
                                positions: {
                                    start: this.current.start,
                                    end: this.current.end
                                }
                            });
                        }
                        break;
                    default:
                        this.current.lastAction = null;
                }
            }
            // if was moved
            else if (this.current.hasMoved && this.current.downEvent && !this.current.multitouch) {

                if (this.settings.callbacks.swipe || this.settings.callbacks.flick) {

                    var direction;

                    if (this.settings.callbacks.swipe) {
                        direction = [this.current.end[0] - this.current.start[0], this.current.end[1] - this.current.start[1]];
                    } else if (this.settings.callbacks.flick) {
                        direction = [this.current.end[0] - this.current.oldMove[0], this.current.end[1] - this.current.oldMove[1]];
                    }

                    var vLDirection = this.vectorLength(direction),
                        directionNormalized = [direction[0] / vLDirection, direction[1] / vLDirection],
                        distance = this.getDistance(this.current.end, this.current.start),
                        speed = this.calculateSpeed(distance, timeDiff);

                    if (this.settings.callbacks.swipe && timeDiff <= this.settings.timeTreshold.swipe) {
                        var originalStart = this.getAbsolutePosition(this.container, this.current.start),
                            originalEnd = this.getAbsolutePosition(this.container, this.current.end);
                        if (this.getDistance(originalEnd, originalStart) >= this.settings.distanceTreshold.swipe) {
                            var directions = this.getSwipeDirections(directionNormalized);
                            this.eventCallback(this.settings.callbacks.swipe, {
                                positions: {
                                    start: this.current.start,
                                    end: this.current.end
                                },
                                speed: speed,
                                directions: {
                                    named: directions,
                                    detailed: directionNormalized
                                }
                            });
                        }
                    }

                    if (this.settings.callbacks.flick && (timeDiffToLastMove <= this.settings.timeTreshold.flick)) {
                        this.eventCallback(this.settings.callbacks.flick, {
                            speed: speed,
                            direction: directionNormalized,
                            positions: {
                                start: this.current.start,
                                end: this.current.end
                            }
                        });
                    }
                }

                switch (this.current.lastAction) {
                    default:
                        this.current.lastAction = null;
                }
            }

            this.current.downEvent = false;
            this.current.hasMoved = false;
            this.current.multitouch = false;
        };

        ActMoveDo.prototype.calculateSpeed = function (distance, time) {
            return (distance / time) * 100;
        };

        ActMoveDo.prototype.getSwipeDirections = function (direction) {
            var directions = [];
            if (direction[0] < 0) {
                directions.push("left");
            }
            if (direction[0] > 0) {
                directions.push("right");
            }
            if (direction[1] < 0) {
                directions.push("up");
            }
            if (direction[1] > 0) {
                directions.push("down");
            }
            return directions;
        };

        ActMoveDo.prototype.vectorLength = function (v) {
            return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]));
        };

        ActMoveDo.prototype.setTimeoutForEvent = function (callback, timeout, args, holdTimeout) {
            if (holdTimeout) {
                this.current.holdTimeout = setTimeout(this.eventCallback.bind(this, callback, args), timeout);
            } else {
                this.current.timeout = setTimeout(this.eventCallback.bind(this, callback, args), timeout);
            }
        };

        ActMoveDo.prototype.eventCallback = function (callback, args) {
            if (callback) {
                if (typeof callback === "string") {
                    this.$container.trigger({
                        type: callback,
                        actmovedo: args
                    });
                } else if (typeof callback === "function") {
                    callback(args);
                }
            }
            this.current.lastAction = null;
        };

        ActMoveDo.prototype.getRelativePosition = function (e) {
            var target = this.container,
                clientBounds = target.getBoundingClientRect(),
                x = (e.clientX - clientBounds.left) / clientBounds.width,
                y = (e.clientY - clientBounds.top) / clientBounds.height;
            return [x, y];
        };

        ActMoveDo.prototype.getAbsolutePosition = function (target, point) {
            var clientBounds = target.getBoundingClientRect(),
                x = point[0] * clientBounds.width,
                y = point[1] * clientBounds.height;
            return [x, y];
        };

        ActMoveDo.prototype.getDistance = function (point1, point2) {
            var a = point1[0] - point2[0],
                b = point1[1] - point2[1];
            return Math.sqrt(a * a + b * b);
        };

        ActMoveDo.prototype.getScrollDirection = function (event) {
            var axis = parseInt(event.axis, 10),
                direction = [];
            // down
            if (event.wheelDelta < 0 || (event.deltaY > 0) || (event.wheelDeltaY < 0) || ((axis === 2) && (event.detail > 0))) {
                direction.push("down");
            }
            // up
            else if (event.wheelDelta > 0 || (event.deltaY < 0) || (event.wheelDeltaY > 0) || ((axis === 2) && (event.detail < 0))) {
                direction.push("up");
            }

            // right
            if ((event.deltaX > 0) || (event.wheelDeltaX > 0) || ((axis === 1) && (event.detail > 0))) {
                direction.push("right");
            }
            // left
            else if ((event.deltaX < 0) || (event.wheelDeltaX < 0) || ((axis === 1) && (event.detail < 0))) {
                direction.push("left");
            }

            return direction;
        };

        ActMoveDo.prototype.checkTouch = function () {
            return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        };

        ActMoveDo.prototype.checkMouse = function () {
            return ('onmousedown' in window);
        };

        ActMoveDo.prototype.getScrollEventName = function () {
            return "onwheel" in document.createElement("div") ? "wheel" :
                document.onmousewheel !== undefined ? "mousewheel" :
                    "DOMMouseScroll";
        };

        ActMoveDo.prototype.getEvent = function (e) {
            jQuery.event.fix(e);
            // fixing end event has no more touches
            if (e.originalEvent.touches && e.originalEvent.touches.length === 0) {
                return e.originalEvent.changedTouches || e.originalEvent;
            }
            return e.originalEvent.touches || e.originalEvent.changedTouches || e.originalEvent;
        };

        return ActMoveDo;

    }(jQuery));