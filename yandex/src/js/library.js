
var SLIDES_TEMPLATES            = {
    
                                        start: {
                                            id: 'start',
                                            template: '<table><tbody><tr><td><h1>%header%</h1></td></tr></tbody></table><div class = "b-content">%content%</div><div class = "tmptag"></div>'
                                        },
                                        
                                        section: {
                                            id: 'section',
                                            template: '<table><tbody><tr><td><h1>%header%</h1></td></tr></tbody></table>'
                                        },
                                        
                                        simple: {
                                            template: '<h1>%header1%</h1>\n<h2>%header2%</h2><div class = "b-content">%content%</div>'
                                        },
                                        
                                        columns: {
                                            template: '<h1>%header1%</h1>\n<h2>%header2%</h2>'
                                        },
                                        
                                        end: {
                                            id: 'end',
                                            template: '<div class = "b-content">%content%</div><div class = "tmptag"></div>'
                                        }

                                  }
                                  
var NAVIGATION_TEMPLATE         = '<div id = "navigation">\
                                        <a href = "#/prev/" title = "Сюда" id = "arr-prev">&larr;</a>\
                                        <a href = "#/notes/" title = "Режим заметок" id = "notes-mode">×</a>\
                                        <a href = "#/next/" title = "Туда" id = "arr-next">&rarr;</a>\
                                  </div>';
                                  
var SLIDELIST_TEMPLATE          = '<div id = "slidelist">\
                                        <select>\
                                        </select>\
                                   </div>'
                                  
var STYLESHEET_TEMPLATE         = '<link rel = "stylesheet" type = "text/css" charset = "utf-8" media = "all" href = "css/%name%.css" />';

if(typeof($) == 'function') {
    
    var aNotes              = new Array();
    var aSlides             = new Array();
    var isNavigationVisible = false;
    var title               = document.title;
    var aCurrentSlide       = 0;
    var aCtrlPressed        = false;
    var isPreview           = false;
    var aSlideList          = null;
    var isSlidelistVisible = false;
    
    function showSlide(aSlide) {
        aCurrentSlide = aSlide;
    
        $('.l-slide').empty().attr('class', '').addClass('l-slide').append(aSlides[aSlide].template);
        
        $('#slidelist select').get(0).selectedIndex = aSlide;

        if(typeof(aSlides[aSlide].id) == 'string') {
            $('body').attr('id', aSlides[aSlide].id);
        } else {
            $('body').removeAttr('id');
        }

        /*
        if($.browser.opera) {
            $('.inc, .dec').removeClass('inc').removeClass('dec');
        }
        */
            
        if(navigator.appVersion.indexOf('MSIE') != -1) { // I HATE ie!!!
            $('ul.inc > li').each(function() {
                $(this).addClass('inc');
            });
            $('ul.inc').removeClass('inc');
            
            $('ol.inc > li').each(function() {
                $(this).addClass('inc');
            });
            $('ol.inc').removeClass('inc');
        } else {
            $('.l-slide ul.inc, .l-slide ol.inc').removeClass('inc').children('li').addClass('inc');
        }

        if($('.l-slide .inc').length > 0) {
            if($('.l-slide .inc:first').is('div') && $('.l-slide .inc:first()').children('.inc').length > 0) {
                $('.l-slide .inc:first()').removeClass('inc').addClass('dec');
            }
            $('.l-slide .inc:first()').removeClass('inc').addClass('dec active');
        } else {
            $('.l-slide .dec:last()').addClass('active');
        }
        
        $('#pageNumber').removeClass('hidden').html(aSlide + 1);
        if(aSlide == 0 || aSlide == (aNotes.length - 1)) $('#pageNumber').addClass('hidden');
        
        $('#navigation a').removeClass('disable');
        if($.presentation.isFirstSlide()) $('#arr-prev').addClass('disable');
        if($.presentation.isLastSlide()) $('#arr-next').addClass('disable');
        
        //$('#arr-prev').attr('href', '#/presentation/slide-' + formatSlideNumber(aCurrentSlide) + '/');
        //$('#arr-next').attr('href', '#/presentation/slide-' + formatSlideNumber(aCurrentSlide + 2) + '/');
        
        $('#arr-prev').attr('href', '#' + buildUrl(aCurrentSlide));
        $('#arr-next').attr('href', '#' + buildUrl(aCurrentSlide + 2));
        
        $('#navigation select option').attr('selected', '');
        $($('#navigation select option').get(aSlide)).attr('selected', 'selected');
        

        //location.hash = '/presentation/slide-' + formatSlideNumber(aSlide + 1) + '/';
        location.hash = buildUrl(aSlide + 1);
        
    }
    
    function switchMode(isSlides) {
        $('link').each(function() {
            if($(this).attr('href').indexOf('notes') != -1 || $(this).attr('href').indexOf('presentation') != -1) {
                $(this).attr('media', $(this).attr('media') == 'all' ? 'print' : 'all');
            }
        });
        
        if(isSlides) {
            document.title = $(aNotes[0]).find('h1').html();
            $('body').addClass('presentation');
            $('.l-wrap').empty().append('<div class = "l-slide"></div>').append('<div id = "pageNumber"></div>').append(NAVIGATION_TEMPLATE).prepend(aSlidelist);
            $('#navigation, #slidelist').fadeTo('fast', 0);
            
            $(aSlidelist).children('select').change(function() {
                $.presentation.goTo(this.selectedIndex);
                this.blur();
            });

            $('#arr-prev').click(function() {
                if(!$(this).hasClass('disable')) $.presentation.goPrev();
                return false;
            });
            $('#arr-next').click(function() {
                if(!$(this).hasClass('disable')) $.presentation.goNext();
                return false;
            });
            $('#notes-mode').click(function() {
                $.presentation.switchMode();
                return false;
            })
            $.presentation.goTo(aCurrentSlide);
        } else {
            document.title = title;
                isPreview = false;
                $('body').removeClass('presentation').removeClass('preview');
            $('.l-wrap').empty().append('<ol id = "slides"></ol>');
            $('#slides').append(aNotes);
            location.hash = '#/notes/';
                    
            $('.b-mode-switcher a').each(function() {
                if(this.href.indexOf('preview') != -1) {
                    this.href = '#/preview/' + formatSlideNumber(aCurrentSlide + 1) + '/'; 
                } else {
                    this.href = '#/presentation/' + formatSlideNumber(aCurrentSlide + 1) + '/'; 
                }
            });
            
        }
            
    }
    
    function canGo(toNext) {
        
        if(aCtrlPressed) {
            if(toNext) {
                $('.inc, .active').removeClass('inc').removeClass('active').addClass('dec');
            } else {
                $('.dec').removeClass('dec').removeClass('active').addClass('inc');
            }
            aSlides[aCurrentSlide].template = $('.l-slide').html();
            return true;
        }
        
        //return true;        
        var result = true;
        
        if(toNext) {
            incCounter = $('.l-slide .inc').length;
            if(incCounter >= 0) {
                $('.l-slide .active').removeClass('active');
                if($('.l-slide .inc:first()').is('div') && $('.l-slide .inc:first()').children('.inc').length > 0) {
                    $('.l-slide .inc:first()').removeClass('inc').addClass('dec');
                    incCounter--;
                }
                $('.l-slide .inc:first()').removeClass('inc').addClass('dec active');
                incCounter--;
            }
            
            result = incCounter <= 0; 
        } else {
            if($('.l-slide .dec').length >= 0) {
                var $last = $('.l-slide .dec:last()');
                if($last.parent().is('div') && $last.parent().hasClass('dec') && $last.parent().find('.dec').length == 1) {
                    $last.parent().removeClass('dec').addClass('inc');
                }
                $('.l-slide .active:last()').removeClass('dec').removeClass('active').addClass('inc');
                $('.l-slide .dec:last()').addClass('active');
            }
            
            result = $('.l-slide .dec').length == 0;
        }
        
        if(result) aSlides[aCurrentSlide].template = $('.l-slide').html();
        
        return result && $('.l-slide .active').length == 0;
    }
    
    /*
     *  Entry point
     */
    $(document).ready(function() {
        
        setEngine();
        
        $('#slides > li:last()').addClass('last');
        aNotes = $('#slides > li');
        for(var i = 0; i < aNotes.length; i++) {
            whatIsThis(i, $(aNotes[i]).clone());
            /*
            $(aNotes[i]).children('h1').html('<a href = "#slide-' + (i + 1) + '">' + $(aNotes[i]).children('h1').text() + '</a>').children('a').click(function() {
                $.presentation.goTo(this.href.parseInt - 1);
                $.presentation.switchMode()
                return false;
            });
            */
        }
        
        if(aNotes.length > 0 && aNotes.length == aSlides.length && $.makePresentation( { aSlidesLength  : aSlides.length, 
                                 onShowSlide    : showSlide, 
                                 onSwitchMode   : switchMode,
                                 canGo          : canGo
                              } )) {
        } else {
            $('script').remove();
        }
        
        $('.b-mode-switcher a').click(function() {
            if(this.href.indexOf('preview') != -1) {
                isPreview = true;
                $('body').addClass('preview');
            }
            this.blur();
            $.presentation.switchMode();
            return false;
        });

        $('.l-wrap').mousemove(function(e) {
            if(typeof($.presentation) != 'object' || !$.presentation.isSlides) return false;
            
            var height = $('.l-wrap').height();
            var width = $('.l-wrap').width();
            var pos = height - parseInt(height * 0.2);
            if(!isNavigationVisible && e.pageY >= pos) {
                $('#navigation').fadeTo('slow', 1);
                isNavigationVisible = true;
            } else if(isNavigationVisible && e.pageY <= pos) {
                $('#navigation').animate( { opacity:0 }, 500 );
                isNavigationVisible = false;
            }
            
            var pos = parseInt(height * 0.1);
            var que = parseInt(width / 2);
            if(!isSlidelistVisible && e.pageY <= pos && e.pageX >= (que - 220) && e.pageX <= (que + 220)) {
                $('#slidelist').fadeTo('slow', 1);
                isSlidelistVisible = true;
            } else if(isSlidelistVisible && e.pageY >= pos) {
                $('#slidelist').animate( { opacity:0 }, 500 );
                isSlidelistVisible = false;
            }
        });
            
        aSlidelist = $(SLIDELIST_TEMPLATE);
        for(var i = 0; i < aSlides.length; i++) {
            $(aSlidelist).children('select').append('<option value = "slide-' + i + '">' + (i + 1) + '. ' + aSlides[i].title + '</option>');
        }
        
        if(location.hash.length > 0 && /^#\/(preview|presentation)\/\d+(\/)?$/.test(location.hash)) {
            var page = location.hash.match(/\d+/);
                page = page != null ? parseInt(page[0]) : 0;
                page = page > 0 && page <= $.presentation.settings.aSlidesLength ? --page : 0;
                
            if(location.hash.indexOf('preview') != -1) {
                isPreview = true;
                $('body').addClass('preview');
            }
              
            aCurrentSlide = page;  
            $.presentation.switchMode();
            //$.presentation.goTo(page);
        } else {
            location.hash = '#/notes/';
        }
        
        $(document).keydown(function(e) {
            if(e.keyCode == 17 && !aCtrlPressed) {
                aCtrlPressed = true;
            }
        });
        
        window.onload = function() {
        }
        
        $(document).keyup(function(e) {
            aCtrlPressed = aCtrlPressed && e.keyCode != 17;
        });
        
    });
    
    /*
     *  Check slide type
     */
    function whatIsThis(index, note) {
        if(index == 0) {
            isStartSlide(note);
        } else if(index == aNotes.length - 1) {
            isEndSlide(note);
        } else if($(note).hasClass('section')) {
            isSectionSlide(note);
        } else if($(note).children('.column').length > 0) {
            isColumnSlide(note);
        } else {
            isSimpleSlide(note);
        }
    }
    
    function isStartSlide(note) {
        var slide = clone(SLIDES_TEMPLATES.start);
            var t = $(note).children('h1').text();
                slide.title = t;
                slide.template = slide.template.replace(/%header%/, t);
            $(note).find('h1').remove();
            slide.template = slide.template.replace(/%content%/, $(note).html());
        
        aSlides.push(slide);
        
        $(note).remove();
    }
    
    function isEndSlide(note) {
        var slide = clone(SLIDES_TEMPLATES.end);
            slide.title = 'Заключительный слайд'
            slide.template = slide.template.replace(/%content%/, $(note).html());
            
        aSlides.push(slide);
    }
    
    function isSectionSlide(note) {
        var slide = clone(SLIDES_TEMPLATES.section);
            var t = $(note).children('h1').text();
                slide.title = t;
                slide.template = slide.template.replace(/%header%/, t);
            
        aSlides.push(slide);
    }
    
    function isColumnSlide(note) {
        var slide = clone(SLIDES_TEMPLATES.columns);
            var a = $(note).children('h1').text();
            slide.template = slide.template.replace(/%header1%/, $(note).children('h1').text());
            var t = $(note).children('h2').text();
                slide.title = t.length > 0 ? t : a;
                slide.template = slide.template.replace(/%header2%/, t);
                $(note).find('h1, h2').remove();
                
            $(note).find('.column:first()').addClass('column-left');
            if($(note).find('.column').length > 1) $(note).find('.column:last()').addClass('column-right');
            slide.template = slide.template + $(note).html();
            
        aSlides.push(slide);
    }
    
    function isSimpleSlide(note) {
        var slide = clone(SLIDES_TEMPLATES.simple);
            var a = $(note).children('h1').text();
            slide.template = slide.template.replace(/%header1%/, $(note).children('h1').text());
            var t = $(note).children('h2').text();
                slide.title = t.length > 0 ? t : a;
                slide.template = slide.template.replace(/%header2%/, t);
            $(note).children('h1, h2').remove();
            
            $(note).children('blockquote').each(function() {
                slide.id = 'quote';
                if($(this).html().indexOf('«') == -1) $(this).addClass('graphical');
            });
            
            slide.template = slide.template.replace(/%content%/, $(note).html());
        
        aSlides.push(slide);
    }

    /*
     *  Add 2 body class with current engine
     */ 
    function setEngine() {
        
        var engine = '';
            
        if($.browser.mozilla) {
            engine = 'gecko';
        } else if($.browser.safari) {
            engine = 'webkit';
        } else if($.browser.opera) {
            engine = 'opera';
        } else {
            if(navigator.appVersion.indexOf('MSIE 7') != -1) {
                engine = 'ie7';
            } else {
                engine = 'ie';
            }
        }
        
        /*$('head').append(STYLESHEET_TEMPLATE.replace(/%name%/, engine));*/
    }
    
    /*
     *  Add clone method
     */ 
    function clone(myObj) {
        if(typeof(myObj) != 'object') return myObj;
        if(myObj == null) return myObj;
    
        var myNewObj = new Object();
    
        for(var i in myObj) myNewObj[i] = clone(myObj[i]);
    
    	return myNewObj;
    }
    /*     
    Object.prototype.clone = function() {
        return eval(uneval(this));
    }
    */
    
    function formatSlideNumber(aSlide) {
        return aSlide >= 10 ? aSlide.toString() : '0' + aSlide.toString();
    }
    
    function buildUrl(aSlide) {
        return '/' + (isPreview ? 'preview' : 'presentation') + '/' + formatSlideNumber(aSlide) + '/'
    }

}

