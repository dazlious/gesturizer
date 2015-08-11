# Gesturizer

## compatibility

This library is compatible with

- Chrome
- Firefox
- Safari (at least down to 5.1.7)
- IE >= 9
- Android
- iOS
- Windows Phone

## examples
Watch my [list of examples](http://dazlious.github.io/gesturizer/)

##questions
**Which benefit do I obtain by using Gesturizer?**

Gesturizer is a small library for your js application, that triggers common gesture events. It is flexible, straight forward and easy to understand. Gesturizer **always uses relative positioning** and will never give you absolute pixel units.


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


**What should I do, if an error or compatibility issue occures while working with Gesturizer?**

Please send me [detailed information by opening an issue](https://github.com/dazlious/gesturizer/issues), concerning your needs.


## initialization

**You need jQuery in order to use the plugin**

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


### callbacks: object {property: function|string}

> default: tap: false,
   tapHold: false,
   doubletap: false,
   hold: false,
   pan: false,
   swipe: false,
   flick: false,
   zoom: false,
   wheel: false,
   pinch: false
   }

You can bind a callback function to the event or assign a string to it.


#### callback function:

In this case, you can act directly in the plugin initialization

    new gesturizer({
        callbacks:
            tap: function(response) {
                console.info(response);
            }
        }
    });


#### string assignment

In this case, your data is stored in a property called gesturizer of the response event object.

    new gesturizer({
        callbacks: {
            swipe: "swipe"
        }
    });

    $(".gesturizer").on("swipe", function(e) {
        console.log(e.gesturizer);
    });


### preventDefault: boolean
> default: true

### overwriteViewportSettings: boolean|string
> default: false

If you want to prevent zooming on the whole page or you want to change the meta-viewport content-attribute
When set to true, the default will be: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"

### stopPropagation: boolean
> default: true

If the event should be propagated - for ALL events (down, move, up, wheel)

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
> default: {tap: 200, hold: 500, swipe: 300, flick: 25}

You can overwrite the defaults tresholds. If you want your swipe to be called a bit slower, because you think it is too fast, just pass

    timeTreshold: {
        tap: 1000
    }

to the settings. Now the user has one second (1000ms) for making their second touch, in order to fire doupletap-event


### autoFireHold: number
> default: false

You can wether enable this, by assigning a number as milliseconds or disable it by assigning null|false|undefined. By default this feature is disabled.

When turned on, you can hold mouse or finger down and the event fires after your set timeout. This timeout is for both events: hold and tapHold


### distanceTreshold: object
> default: {swipe: 200}

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