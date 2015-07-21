var actMoveDo = actMoveDo || (function($) {
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
                        tap: 0.5,
                        scroll: 0.05
                    }
                },
                callbacks: {
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
                start: [0,0]
            };

            this.init();
            this.bindEvents();

        }

        ActMoveDo.prototype.init = function() {
            this.$container = $(this.settings.container);
        };

        ActMoveDo.prototype.bindEvents = function() {


            // if device is touch
            if (this.settings.isTouchDevice) {
                this.bindTouchEvents();
            }

            // if device is mouse
            if (this.settings.isMouseDevice) {
                this.bindMouseEvents();
            }

        };

        ActMoveDo.prototype.bindTouchEvents = function() {
            this.$container.on(this.settings.eventNames.start.touch, this.startHandler.bind(this));
            this.$container.on(this.settings.eventNames.move.touch, this.moveHandler.bind(this));
            this.$container.on(this.settings.eventNames.end.touch, this.endHandler.bind(this));
        };

        ActMoveDo.prototype.bindMouseEvents = function() {
            this.$container.on(this.settings.eventNames.scroll, this.scrollHandler.bind(this));
            this.$container.on(this.settings.eventNames.start.mouse, this.startHandler.bind(this));
            this.$container.on(this.settings.eventNames.move.mouse, this.moveHandler.bind(this));
            this.$container.on(this.settings.eventNames.end.mouse, this.endHandler.bind(this));
        };

        ActMoveDo.prototype.scrollHandler = function(event) {
            event.stopPropagation();
            event.preventDefault();
            var e = this.getEvent(event);

            this.getScrollDirection(e);
        };

        ActMoveDo.prototype.startHandler = function(event) {

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event);

            this.current.downEvent = true;

            // mouse is used
            if (e instanceof MouseEvent) {
                console.log("mouse down", e);
            } // touch is used
            else {
                // singletouch startet
                if (e.length <= 1) {
                    console.log("single touch", e);
                } // multitouch started
                else {
                    console.log("multi touch", e);

                }
                console.log(e);
            }
        };

        ActMoveDo.prototype.moveHandler = function(event) {
            // if touchstart event was not fired
            if (!this.current.downEvent) {
                return false;
            }

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event);

            console.log("move", e);
        };

        ActMoveDo.prototype.endHandler = function(event) {

            this.current.downEvent = false;

            event.stopPropagation();
            event.preventDefault();

            var e = this.getEvent(event);

            console.log("end", e);
        };

        ActMoveDo.prototype.getScrollDirection = function(event) {
            // down
            if ((event.deltaY > 0) || ((event.axis === 2) && (event.detail > 0))) {
                console.log("down");
            }
            // up
            else if ((event.deltaY < 0) || ((event.axis === 2) && (event.detail < 0))) {
                console.log("up");
            }
        };

        ActMoveDo.prototype.checkTouch = function() {
            return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        };

        ActMoveDo.prototype.checkMouse = function() {
            return ('onmousedown' in window);
        };

        ActMoveDo.prototype.checkScrollWheel = function() {
            return ("onwheel" in window);
        };



        ActMoveDo.prototype.getScrollEventName = function() {
            if ('onmousewheel' in window) {
                return "mousewheel";
            } else {
                return "DOMMouseScroll";
            }
        };

        ActMoveDo.prototype.getEvent = function(e) {
            return e.originalEvent.touches || e.originalEvent.changedTouches || e.originalEvent;
        };

    return ActMoveDo;

}(jQuery));