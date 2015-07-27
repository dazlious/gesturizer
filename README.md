# Gesturizer

## compatibility

This library is compatible with

- Chrome
- Firefox
- Safari (at least down to 5.1.7)
- IE >= 9
- Android
- iOS
- Windows Phone (up to come)

## examples
Watch my [list of examples](http://dazlious.github.io/gesturizer/)

##questions
**What it Gesturizer supposed to do for me?**

Gesturizer is a small library for your js application, that triggers common gesture events. It is very flexible, easy to understand and very tiny.


**What are these support gestures?**

- tap
- doubletap
- hold (longpress)
- tap and hold
- pan (move around with mousedown)
- swipe
- flick (movement after panning)
- wheel
- zoom
- pinch


**What should I do, if I found an error or compatibility issue in Gesturizer?**

Please send me [detailed information by opening an issue](https://github.com/dazlious/gesturizer/issues), concerning your needs. I want to improve this library.

## initialization

**You need jQuery loaded for the plugin to work**

There a several methods to use this library. You will notice, that nothing happens, if you only initialize gesturizer, but have added no callbacks at all. See usage!

### use default class
This is the easiest way:

    <div class="gesturizer"></div>
    <script>
        new gesturizer();
    </script>

### use your own class or an ID

    <div id="your-id"></div>
    <script>
        new gesturizer({
            container: "#your-id"
        });
    </script>


## basic usage

There are two different methods listening to an event. First use case is a direct callback function bound to the specific event. The second use case is to assign a string to the event and bind it with the jQuery on()-handler.

    <div class="gesturizer"></div>
    <script>
        new gesturizer({
            callbacks: {
                swipe: "swipe",
                tap: function(response) {
                    console.info(response);
                }
            }
        });
        
        $(".gesturizer").on("swipe", function(e) {
            console.log(e.gesturizer);
        });
    </script>


## passing options

You can pass a list of options by parameterizing the constructor call.

    <script>
        var settings = {
            container: ".foo"
        };
        new gesturizer(settings);
    </script>



## settings

### container: string
> default: ".container"

This is the container, you want your gestures recognized to. Must be a valid jQuery-string-based-selector. settings.container is passed to this.$container and this.container by bind $(settings.container).

*e.g.: "#your-id", ".foo-gestures", ".bar:not(foo)", etc*


### isTouchDevice: boolean
> default: this.checkTouch()

Checks if your clients device has touch available or not. If Gesturizers checkTouch-function does not fit your needs, you can bind your own logic to this variable


### isMouseDevice: boolean
> default: this.checkMouse()

Checks if your clients device has mouse available or not. If Gesturizers checkMouse-function does not fit your needs, you can bind your own logic to this variable


### isIEDevice: boolean
> default: this.checkIETouch()

Checks if your clients device is using IE. If Gesturizers checkIETouch-function does not fit your needs, you can bind your own logic to this variable
If true, Gesturizer uses pointer-events instead of touch and mouse

### timeTreshold: object
> default: {tap: 200, hold: 500, swipe: 300, flick: 50}

You can overwrite the defaults tresholds. If you want your swipe to be called a bit slower, because you think it is too fast, just pass

    timeTreshold: {
        tap: 1000
    }

to the settings. Now the user has one second (1000ms) for making their second touch, in order to fire doupletap-event


### autoFireHold: number
> default: null

You can wether enable this, by assigning a number as milliseconds or disable it by assigning null|false|undefined. By default this feature is disabled.

When turned on, you can hold mouse or finger down and the event fires after your set timeout. This timeout is for both events: hold and tapHold


### distanceTreshold: object
> default: {swipe: 500}

You can overwrite the defaults distance treshold for swiping. This is the distance, that you have to travel, before a swipe would be detected.

    distanceTreshold: {
        swipe: 500
    }

Its unit is pixel.


### eventNames: object
> default: {start: {
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
                scroll: this.getScrollEventName()}

*You should not change this*

These are the original eventnames used to track the movement


## build your own
All you have to do, is install all devDependencies and run the watch task in grunt

    sudo npm install --save-dev
    grunt watch