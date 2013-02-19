/**
 * TODO's
 * 1) scroll when using arrow keys and marked element is not visible
 * 2) fix ie6 style issues
 */
/**
 * jQuery .autoComplete()
 *
 * Transforms an <input/> into an autoComplete box
 *
 * @Author Andre Mohren
 */

jQuery.fn.autoComplete = function(params) {

   /**
    * Predefined parameters with their default value
    */
   var options = {
      /**
       * How long has the entered string to be before we start to search?
       */
      'minimumKeys':   '2',
      /**
       * How long to wait after pressing a key for start searching?
       */
      'waitTime':      '1000',
      /**
       * Is the <inpout/> value already validated at loading time?
       */
      'validated':     false,
      /**
       * Which url will be called to get out completion data?
       */
      'requestUrl':    '/module/jscript/lib/jquery_plugins/autocomplete2/exampleAjax.php',
      /**
       * Should we close the box and reset the <input/> when its losing focus?
       */
      'closeWhenBlur': true,
      /**
       * Name of the search-param which will be send as _GET to PHP.
       */
      'requestParam':  'actualInput',
      /**
       * Are not validated values allowed?
       */
      'allowFreetext':  false,
      /**
       * Where do we put the selected id?
       */
      'putIdInto': '',
      /**
       * Custom callback for click?
       */
      'customCallback': false,
      /**
       * Custom callback final for click?
       */
      'customCallbackFinal': false,
      /**
       * Header
       */
      'header': false,
      /**
       * Footer
       */
      'footer': false,
      /**
       * Free text entry in footer
       */
      'footerFreetext' : false,
      /**
       * Description line in case of free text entry in footer
       */
      'footerMissingText' : '',
      /**
       * Info line in case of free text entry in footer
       */
      'footerInfoText' : '',
      /**
       * Trap "enter" keypress to avoid submitting forms?
       */
      'trapEnter': false,
      /**
       * Provide a callback for showbox
       */
      'onShow' : false
   };

   /*
    * All other parameters are passed on as extra request parameters
    */
   var extra = {};
   for(var param in params) {
      if (options[param] != undefined) {
         options[param] = params[param];
      } else {
         extra[param] = params[param];
      }
   }
   options.extraParams = extra;

   jQuery(this).each(function() {
      //ToDo: save old blur function for later useage
      jQuery(this).unbind('blur');
      //ToDo: bind only <input/>
      //ToDo: compare parameters with old box
      //ToDo: icon not over border
      //ToDo: scroll when using key-selecting

      /**
       * Our <input/>
       */
      var element = this;
      /**
       * Used for saving the timeout
       */
      var timeout = '';
      /**
       * HTML Code for the box
       */
      var box = jQuery('<div class="__AC_position"><div class="__AC_close"></div><div class="__AC_layer"></div></div>');
      var validatingBox = jQuery('<div class="__AC_position"><div class="__AC_layer __AC_validating"></div></div>');

      /**
       * The default value of the box
       */
      var def = jQuery(element).val();
      /**
       * Used for temporary saving what we have typed into the box
       */
      var typed = '';
      /**
       * Is the box open at the moment?
       */
      var boxShown = false;
      /**
       * Do we mouseover an entry at the moment?
       */
      var hoverEntry = false;
      /**
       * The default state of the box
       */
      var isValidated = options['validated'];
      /**
       * Has the box focus?
       */
      var hasFocus = false;
      /**
       * Is our last saved value freetext?
       */
      var isFreetext = false;
      /**
       * The original value
       */
      var originalVal = jQuery(element).val();

      /**
       * Display the validated state
       */
      var validated = function() {
         jQuery(element).removeClass('__AC_invalidated __AC_validating __AC_editing __AC_freetext')
            .addClass('__AC_validated');
         validatingBox.remove();
      };

      /**
       * Display the invalidated state
       */
      var invalidated = function() {
         jQuery(element).removeClass('__AC_validated __AC_validating __AC_editing __AC_freetext')
            .addClass('__AC_invalidated');
         validatingBox.remove();
      };

      /**
       * Display the working state
       */
      var validating = function() {
         jQuery(element).removeClass('__AC_validated __AC_invalidated __AC_editing __AC_freetext')
            .addClass('__AC_validating');
         validatingBox.remove();
      };

      /**
       * Display the editing state
       */
      var editing = function() {
         jQuery(element).removeClass('__AC_validated __AC_invalidated __AC_validating __AC_freetext')
            .addClass('__AC_editing');

         jQuery(element).one('keypress', function(e) {
            if (!boxShown && e.which != 13 && e.which != 27) {
               showValidatingBox();
            }
         });
      };

      /**
       * Display the freetext state
       */
      var freetext = function() {
         jQuery(element).removeClass('__AC_validated __AC_invalidated __AC_validating __AC_editing')
            .addClass('__AC_freetext');
         validatingBox.remove();
      };

      var selectEntry = function() {
         jQuery(element).val(jQuery(this).attr('title'));
         validated();
         hideBox();
         hoverEntry = false;
         typed = def = jQuery(this).attr('title');
         isFreetext = false;
         if (options['putIdInto'] != "") {
            jQuery(options['putIdInto']).val(jQuery(this).attr('id'));
         }
         if (options['customCallbackFinal']) {
            options['customCallbackFinal']();
         }
      };

      /**
       * Show box
       */
      var showBox = function() {
         if (hasFocus || !options['closeWhenBlur']) {
            validating();
            boxShown = true;
            options.extraParams[options.requestParam] = typed;
            jQuery.getJSON(
               options['requestUrl'],
               options.extraParams,
               function(JSONdata) {
                  if (hasFocus || !options['closeWhenBlur']) {

                     /* handle deprecated format: {data : [{ results : [...] }] */
                     if (JSONdata.data != undefined && JSONdata.results == undefined) JSONdata = JSONdata.data[0];

                     box.find('.__AC_layer').html('<div class="__AC_data"></div>');
                     box.find('.__AC_close').click(function() {
                        hoverEntry = false;
                        jQuery(element).val('').blur();
                     }).hover(function() {
                           hoverEntry = true;
                        }, function() {
                           hoverEntry = false;
                        }
                     );
                     if (JSONdata['header'] != undefined) {
                        box.find('.__AC_layer').prepend(JSONdata['header']);
                     } else if (options['header']) {
                        box.find('.__AC_layer').prepend(jQuery(options['header']).clone(true));
                     }
                     if (JSONdata['results'] != undefined) {
                        var position = box.find('.__AC_data');
                        for (var record in JSONdata['results']) {
                           if (typeof(JSONdata['results'][record]['customCallback']) != 'undefined') {
                              jQuery('<div class="__AC_record" title="' + JSONdata['results'][record]['value'] + '" id="' + JSONdata['results'][record]['id'] + '">' + JSONdata['results'][record]['info'] + '</div>')
                                 .appendTo(position).click(JSONdata['results'][record]['customCallback']).hover(function() {
                                    jQuery(this).addClass('__AC_ie8HoverFix');
                                    hoverEntry = true;
                                    jQuery('.__AC_keyhover').removeClass('__AC_keyhover');
                                    isFreetext = false;
                                 }, function() {
                                    jQuery(this).removeClass('__AC_ie8HoverFix');
                                    hoverEntry = false;
                                 }
                              );
                           } else if (options['customCallback']) {
                              jQuery('<div class="__AC_record" title="' + JSONdata['results'][record]['value'] + '" id="' + JSONdata['results'][record]['id'] + '">' + JSONdata['results'][record]['info'] + '</div>')
                                 .appendTo(position).click(options['customCallback']).hover(function() {
                                    jQuery(this).addClass('__AC_ie8HoverFix');
                                    hoverEntry = true;
                                    jQuery('.__AC_keyhover').removeClass('__AC_keyhover');
                                    isFreetext = false;
                                 }, function() {
                                    jQuery(this).removeClass('__AC_ie8HoverFix');
                                    hoverEntry = false;
                                 }
                              );
                           } else {
                              jQuery('<div class="__AC_record" title="' + JSONdata['results'][record]['value'] + '" id="' + JSONdata['results'][record]['id'] + '">' + JSONdata['results'][record]['info'] + '</div>')
                                 .appendTo(position).click(selectEntry).hover(function() {
                                    jQuery(this).addClass('__AC_ie8HoverFix');
                                    jQuery('.__AC_keyhover').removeClass('__AC_keyhover');
                                    hoverEntry = true;
                                 }, function() {
                                    jQuery(this).removeClass('__AC_ie8HoverFix');
                                    hoverEntry = false;
                                 }
                              );
                           }
                        }
                     }

                     var footerFreetext = options['footerFreetext'] || JSONdata['footerFreetext'];
                     var footerMissingText = options['footerMissingText'] || JSONdata['footerMissingText'];
                     var footerInfoText = options['footerInfoText'] || JSONdata['footerInfoText'];
                     if (JSONdata['footer'] != undefined) {
                        box.find('.__AC_layer').append(JSONdata['footer']);
                     } else if (options['footer']) {
                        box.find('.__AC_layer').append(jQuery(options['footer']).clone(true));
                     } else if (footerFreetext) {
                        box.find('.__AC_layer').append(jQuery("<div>" + footerMissingText + "</div>").click(function(){
                           jQuery(element).val("");
                           jQuery("<div><input/><span>go</span></div>").find("span").click(function(){
                              var name = jQuery(this).parent().find("input").val();
                              hideBox();
                              hoverEntry = false;
                              if (name != "") {
                                 freetext();
                                 isFreetext = true;
                              } else {
                                 invalidated();
                                 isFreetext = false;
                              }
                              jQuery(element).val(name);
                              def = typed = name;
                              jQuery(element).blur();
                           }).css({
                              "background-color": "#f0a823",
                              "color": "#ffffff",
                              "padding": "2px",
                              "width": "14px",
                              "height": "14px",
                              "display": "block",
                              "text-align": "center",
                              "cursor": "pointer",
                              "margin-left": parseInt(jQuery(".__AC_data").innerWidth()) - 28 + "px"
                           }).parent().find("input").keyup(function(e){
                              if (e.which == 13) {
                                 jQuery(this).parent().find("span").click();
                              }
                           }).css({
                              "border": "0px",
                              "color": "#c0c0c0",
                              "display": "block",
                              "float": "left",
                              "width": parseInt(jQuery(".__AC_data").innerWidth()) - 30 + "px",
                              "height": "18px"
                           }).val(footerInfoText).focus(function() {
                              jQuery(this).unbind("focus").css({
                                 "color": "#000000"
                              }).val("");
                           }).parent().hover(function() {
                              hoverEntry = true;
                           }, function() {
                              hoverEntry = false;
                           }).insertAfter(this);
                           jQuery(this).remove();
                           jQuery(".__AC_data").remove()
                        }).hover(function() {
                           hoverEntry = true;
                        }, function() {
                           hoverEntry = false;
                        }).css({
                           "color": "#BB3A11",
                           "background-color": "#F9F5E1",
                           "margin-right": "10px",
                           "margin-top": "10px",
                           "padding": "2px",
                           "text-align": "right",
                           "cursor": "pointer"
                        }));
                     }
                     box.css('width', jQuery(element).outerWidth() + 'px')
                     jQuery(element).parent().append(box);
                     editing();
                     if (options['onShow'] && typeof options['onShow'] === 'function') {
                        options['onShow']();
                     }
                  }
               }
            );
         }
      };

      /**
       * Hide the box
       */
      var hideBox = function() {
         box.remove();
         boxShown = false;
      };

      var showValidatingBox = function() {
            validatingBox.appendTo(jQuery(element).parent())
                  .css('width', jQuery(element).outerWidth() + 'px');
      }

      /**
       * Function which will be triggered when we focus the box.
       */
      jQuery(element).focus(function() {
         hasFocus = true;
         if (!isValidated && originalVal == jQuery(element).val()) {
            jQuery(element).val('');
         }
         editing();
      });

      /**
       * Leaving the box
       */
      jQuery(element).blur(function() {
         hasFocus = false;
         if (jQuery(element).val() == '') {
            hideBox();
            jQuery(element).val(originalVal);
            if (isValidated) {
               validated();
            } else {
               invalidated();
            }
         } else  if (options['allowFreetext']) {
            hideBox();
            freetext();
         } else if (!hoverEntry && options['closeWhenBlur']) {
            hideBox();
            if (def != jQuery(element).val()) {
               jQuery(element).val(def);
            }
            if (isFreetext) {
               freetext();
            } else if (isValidated || def == typed) {
               validated();
            } else {
               jQuery(element).val(def);
               invalidated();
            }
         } else if (def == typed) {
            if (isFreetext) {
               freetext();
            } else {
               validated();
            }
         }
      });


      /**
       * Key enter, has to be done on keypress so that it happens before any submit events
       */
      jQuery(element).keypress(function(keyCapture) {
         if (keyCapture.which == '13') {
            selectEntry.call(jQuery('.__AC_keyhover'));
            return !options.trapEnter;
         }
         return true;
      });

      /**
       * Pressing and button which the box has focus
       */
      jQuery(element).keyup(function(keyCapture) {
         clearTimeout(timeout);
         typed = jQuery(element).val();
          /**
           * Key escape
           */
         if (keyCapture.which == 27) {
            hideBox();
            jQuery(element).blur();
          /**
           * Key up-arrow
           */
         } else if (keyCapture.which == '38') {
            if (jQuery('.__AC_keyhover').length == 0 || jQuery('.__AC_keyhover').prev().length == 0) { // || first
               jQuery('.__AC_keyhover').removeClass('__AC_keyhover');
               jQuery('.__AC_data div:last-child').addClass('__AC_keyhover');
            } else {
               jQuery('.__AC_keyhover').removeClass('__AC_keyhover').prev().addClass('__AC_keyhover');
            }
          /**
           * Key down-arrow
           */
         } else if (keyCapture.which == '40') {
            if (jQuery('.__AC_keyhover').length == 0 || jQuery('.__AC_keyhover').next().length == 0) { // || last
               jQuery('.__AC_keyhover').removeClass('__AC_keyhover');
               jQuery('.__AC_data div:first-child').addClass('__AC_keyhover');
            } else {
               jQuery('.__AC_keyhover').removeClass('__AC_keyhover').next().addClass('__AC_keyhover');
            }
         } else if (typed.length < options['minimumKeys']) {
            hideBox();
            showValidatingBox();
         } else if (def != typed && typed.length >= options['minimumKeys']) {
            hideBox();
            showValidatingBox();
            timeout = window.setTimeout(function() {
               showBox();
            }, options['waitTime']);
         }
      });

      /**
       * Do correct styling of the box at init
       */
      if (isValidated) {
         validated();
      } else {
         invalidated();
      }

   });
};
