
if(typeof($) == 'function') {
    
    /**
     * 
     * credits for this plugin go to brandonaaron.net
     *     
     * unfortunately his site is down
     * 
     * @param {Object} up
     * @param {Object} down
     * @param {Object} preventDefault
     */
    jQuery.fn.extend({
        mousewheel: function(up, down, preventDefault) {
            return this.hover(
                function() {
                    jQuery.event.mousewheel.giveFocus(this, up, down, preventDefault);
                },
                function() {
                    jQuery.event.mousewheel.removeFocus(this);
                }
            );
        },
        mousewheeldown: function(fn, preventDefault) {
            return this.mousewheel(function(){}, fn, preventDefault);
        },
        mousewheelup: function(fn, preventDefault) {
            return this.mousewheel(fn, function(){}, preventDefault);
        },
        unmousewheel: function() {
            return this.each(function() {
                //jQuery(this).unmouseover().unmouseout(); WTF?!
                jQuery.event.mousewheel.removeFocus(this);
            });
        },
        unmousewheeldown: jQuery.fn.unmousewheel,
        unmousewheelup: jQuery.fn.unmousewheel
    });
    
    
    jQuery.event.mousewheel = {
        giveFocus: function(el, up, down, preventDefault) {
            if (el._handleMousewheel) jQuery(el).unmousewheel();
            
            if (preventDefault == window.undefined && down && down.constructor != Function) {
                preventDefault = down;
                down = null;
            }
            
            el._handleMousewheel = function(event) {
                if (!event) event = window.event;
                if (preventDefault)
                    if (event.preventDefault) event.preventDefault();
                    else event.returnValue = false;
                var delta = 0;
                if (event.wheelDelta) {
                    delta = event.wheelDelta/120;
                    if (window.opera) delta = -delta;
                } else if (event.detail) {
                    delta = -event.detail/3;
                }
                if (up && (delta > 0 || !down))
                    up.apply(el, [event, delta]);
                else if (down && delta < 0)
                    down.apply(el, [event, delta]);
            };
            
            if (window.addEventListener)
                window.addEventListener('DOMMouseScroll', el._handleMousewheel, false);
            window.onmousewheel = document.onmousewheel = el._handleMousewheel;
        },
        
        removeFocus: function(el) {
            if (!el._handleMousewheel) return;
            
            if (window.removeEventListener)
                window.removeEventListener('DOMMouseScroll', el._handleMousewheel, false);
            window.onmousewheel = document.onmousewheel = null;
            el._handleMousewheel = null;
        }
    };

    /*
     *  Like constructor for jQuery plugin.
     */
    jQuery.makePresentation = function(settings) {
        
        settings = jQuery.extend({
            aSlidesLength   : 0,
            onShowSlide     : null,
            onSwitchMode    : null,
            canGo           : null
        }, settings);
        
        /*
         *  Presentation plugin
         */
        jQuery.presentation = {
            
            settings: settings,
            
            isSlides: false,
            aCounter: 0,
                
            /*
             *  Base
             */
            switchMode: function () {
                this.isSlides = !this.isSlides;
                
                if(typeof(this.settings.onSwitchMode) == 'function') {
                    this.settings.onSwitchMode(this.isSlides);
                }
            },
            
            /*
             *  Navigation
             */ 
            canGo: function() {
                return this.settings.aSlidesLength > 0;
            },
            
            canGoNext: function() {
                return this.canGo && (this.aCounter + 1) < this.settings.aSlidesLength;
            },
            
            canGoPrev: function() {
                return this.canGo && this.aCounter > 0;
            },
            
            goNext: function() {
                if(this.aCounter < 0) this.aCounter = 0;
                if(this.canGoNext() && (typeof(this.settings.canGo) != 'function' || this.settings.canGo(true))) this.goTo(++this.aCounter);
            },
            
            goPrev: function() {
                if(this.aCounter >= this.settings.aSlidesLenght) this.aCounter = this.settings.aSlidesLenght - 1;
                if(this.canGoPrev() && (typeof(this.settings.canGo) != 'function' || this.settings.canGo(false))) this.goTo(--this.aCounter);
            },
            
            goTo: function(aSlide) {
                if(aSlide >= 0 && aSlide < this.settings.aSlidesLength) {
                    this.aCounter = aSlide;
                    if(typeof(this.settings.onShowSlide) == 'function') this.settings.onShowSlide(aSlide);
                } else {
                    console.error('Out of bounds');                // REMOVE THIS LINE! MAYBE LATER...
                }
            },
            
            goToFirst: function () {
                this.aCounter = 0;
                this.goTo(this.aCounter);
            },
            
            goToLast: function() {
                this.aCounter = this.settings.aSlidesLength - 1;
                this.goTo(this.aCounter);
            },
            
            isFirstSlide: function() {
                return this.aCounter == 0;
            },
            
            isLastSlide: function() {
                return this.aCounter == this.settings.aSlidesLength - 1;
            }
            
        }
        
        /*
         *  Events
         */
        $(document).keyup(function(e) {

            if(typeof($.presentation) == 'object' && $.presentation.isSlides) {
                
                switch(e.keyCode) {
                    case 13: case 32: case 34: case 39: case 40:
                        if($.presentation.canGoNext()) $.presentation.goNext();
                        break;
                    case 33: case 37: case 38:
                        if($.presentation.canGoPrev()) $.presentation.goPrev();
                        break;
                    case 36:
                        if($.presentation.canGo()) $.presentation.goToFirst();
                        break;
                    case 35:
                        if($.presentation.canGo()) $.presentation.goToLast();
                        break;
                    case 27:
                        $.presentation.switchMode();
                        break;
                }
                
                return false;
                        
            }
            
            if(typeof($.presentation) == 'object' && !$.presentation.isSlides) {
                
                if(e.keyCode == 13) {
                    $.presentation.switchMode();
                    return false;
                }
            }

        });
        
        /*
        $(document).mouseup(function(e) {
            
            if(typeof($.presentation) == 'object' && $.presentation.isSlides) {
                
                var tagName = e.target.nodeName;
                    if(tagName != 'A' && tagName != 'INPUT' && tagName != 'SELECT') {
                        if(e.button < 2) {
                            if($.presentation.canGoNext()) $.presentation.goNext();
                        } else {
                            if($.presentation.canGoPrev()) $.presentation.goPrev();
                        }
                        
                    }
            }
            
        });
        */
        
        /*
         *  Mouse Scroll
         */
        var canGo = true;
        $('.l-wrap').mousewheel(function(e, delta){
            
            var tagName = e.target != null ? e.target.nodeName : '';
            if(typeof($.presentation) == 'object' && $.presentation.isSlides && tagName != 'SELECT' && tagName != 'OPTION') {
                
                if($.browser.opera) { // Наоборрот?!
                    if(delta > 0) {
                        if($.presentation.canGoNext()) $.presentation.goNext(); 
                    } else {
                        if($.presentation.canGoPrev()) $.presentation.goPrev();
                    }
                } else if($.browser.mozilla || $.browser.safari || ($.browser.msie && navigator.appVersion.indexOf('MSIE 7') != -1)) {
                    /*
                     * Событие срабатывает то один раз, то два... Хм... 
                     */
                    canGo = !canGo;
                    if(canGo) {
                        if(delta < 0) {
                            if($.presentation.canGoNext()) $.presentation.goNext();
                        } else {
                            if($.presentation.canGoPrev()) $.presentation.goPrev();
                        }
                    }
                } else {
                    if(delta < 0) {
                        if($.presentation.canGoNext()) $.presentation.goNext();
                    } else {
                        if($.presentation.canGoPrev()) $.presentation.goPrev();
                    }
                }
                
            }
            
            return false;
            
        });
        
        return true;
        
    }
    
}

