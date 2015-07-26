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


## build your own
All you have to do, is install all devDependencies and run the watch task in grunt

    sudo npm install --save-dev
    grunt watch