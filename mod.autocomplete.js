/**
 * jQuery .autoComplete()
 *
 * Transforms an <input/> into an autoComplete box
 *
 * @Author Andre Mohren
 */

jQuery.fn.autoComplete = function(params) {

   /**
    * All possible parameters with their default value
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
      'putIdInto' : ''
   };
   jQuery.extend(options, params);

   jQuery(this).each(function() {
      //ToDo: save old blur function for later useage
      jQuery(this).unbind('blur')
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
      /**
       * HTML Code for the icon
       */
      var icon = jQuery('<div class="__AC_icon __AC_invalidated"></div>');
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
         icon.removeClass('__AC_invalidated __AC_validating __AC_editing __AC_freetext')
            .addClass('__AC_validated');
         jQuery(element).removeClass('__AC_invalidated __AC_validating __AC_editing __AC_freetext')
            .addClass('__AC_validated');
      };

      /**
       * Display the invalidated state
       */
      var invalidated = function() {
         icon.removeClass('__AC_validated __AC_validating __AC_editing __AC_freetext')
            .addClass('__AC_invalidated');
         jQuery(element).removeClass('__AC_validated __AC_validating __AC_editing __AC_freetext')
            .addClass('__AC_invalidated');
      };

      /**
       * Display the working state
       */
      var validating = function() {
         icon.removeClass('__AC_validated __AC_invalidated __AC_editing __AC_freetext')
            .addClass('__AC_validating');
         jQuery(element).removeClass('__AC_validated __AC_invalidated __AC_editing __AC_freetext')
            .addClass('__AC_validating');
      };

      /**
       * Display the editing state
       */
      var editing = function() {
         icon.removeClass('__AC_validated __AC_invalidated __AC_validating __AC_freetext')
            .addClass('__AC_editing');
         jQuery(element).removeClass('__AC_validated __AC_invalidated __AC_validating __AC_freetext')
            .addClass('__AC_editing');
      };

      /**
       * Display the freetext state
       */
      var freetext = function() {
         icon.removeClass('__AC_validated __AC_invalidated __AC_validating __AC_editing')
            .addClass('__AC_freetext');
         jQuery(element).removeClass('__AC_validated __AC_invalidated __AC_validating __AC_editing')
            .addClass('__AC_freetext');
      };

      /**
       * Show box
       */
      var showBox = function() {
         if (hasFocus || !options['closeWhenBlur']) {
            validating();
            boxShown = true;
            jQuery.get(
               options['requestUrl'],
               options['requestParam'] + '=' + typed,
               function(data) {
                  if (hasFocus || !options['closeWhenBlur']) {
                     var JSONdata = eval("("+data+")")['data'][0];
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
                     }
                     if (JSONdata['results'] != undefined) {
                        var position = box.find('.__AC_data');
                        for (var record in JSONdata['results']) {
                           if (typeof(JSONdata['results'][record]['customCallback']) != 'undefined') {
                              jQuery('<div class="__AC_record" title="' + JSONdata['results'][record]['value'] + '">' + JSONdata['results'][record]['info'] + '</div>')
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
                           } else {
                              jQuery('<div class="__AC_record" title="' + JSONdata['results'][record]['value'] + '">' + JSONdata['results'][record]['info'] + '</div>')
                                 .appendTo(position).click(function() {
                                    jQuery(element).val(jQuery(this).attr('title'));
                                    validated();
                                    hideBox();
                                    hoverEntry = false;
                                    typed = def = jQuery(this).attr('title');
                                    isFreetext = false;
                                    if (options['putIdInto'] != "") {
                                       jQuery(options['putIdInto']).val(JSONdata['results'][record]['id']);
                                    }
                                 }).hover(function() {
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
                     if (JSONdata['footer'] != undefined) {
                        box.find('.__AC_layer').append(JSONdata['footer']);
                     }
                     box.css({
                        'left':   element.offsetLeft + 'px',
                        'top':   element.offsetTop + jQuery(element).outerHeight() + 'px',
                        'width': jQuery(element).outerWidth() + 'px'
                     });
                     jQuery(element).parent().append(box);
                     editing();
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
          /**
           * Key enter
           */
         } else if (keyCapture.which == '13') {
            jQuery('.__AC_keyhover').click();
            jQuery(element).blur();
         } else if (typed.length < options['minimumKeys']) {
            hideBox();
         } else if (def != typed && typed.length >= options['minimumKeys']) {
            hideBox();
            timeout = window.setTimeout(function() {
               showBox();
            }, options['waitTime']);
         }
      });

      /**
       * Place the icon at the right place
       */
      icon.insertAfter(element).css({
         'height':  jQuery(element).outerHeight()
                    - parseInt(jQuery(element).css('border-top-width'))
                    - parseInt(jQuery(element).css('border-bottom-width'))+ 'px',
         'left':    element.offsetLeft + jQuery(element).outerWidth()
                    - jQuery(element).outerHeight() - 1 + 'px',
         'top':     element.offsetTop + parseInt(jQuery(element).css('border-top-width')) + 'px',
         'width':   jQuery(element).outerHeight()
                    - parseInt(jQuery(element).css('border-right-width')) + 'px'
      });

      /**
       * Do correct styling of the box at init
       */
      if (isValidated) {
         validated();
      } else {
         invalidated();
      }

   })

};
