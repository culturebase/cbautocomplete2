# Javascript-driven auto-completing input fields

This is a simple [jquery](http://jquery.com) plugin to provide autocompletion
options for input fields. The options are retrieved using an Ajax call, defined
when instantiating the plugin. The functionality is best explained with an
example. Say you have an Ajax endpoint at the path /getstuff.php and you want to
populate autocompletion options for an input element with id "findstuff" from
that, calling a callback function when the user has settled for an option. You'd
do that like this.

    $('#findstuff').autoComplete(
       'requestUrl': '/getstuff.php',
       'customCallbackFinal': function() {
          alert($('#findstuff').val());
       }
    );

There are more options to play with. Look at the inline documentation in
mod.autocomplete.js to learn about them. The data returned by the ajax handler
has to follow a specific JSON format. I'll give an example for that, too:

    { results: [
       { id: "10609", value: "Bauma", info: "Bauma [Schweiz]" },
       { id: "8064", value: "Baumgarten", info: "Baumgarten [Österreich]" },
       { id: "8355", value: "Baumgarten bei Gnas", info: "Baumgarten bei Gnas [Österreich]" },
       { id: "9931", value: "Baumgartenberg", info: "Baumgartenberg [Österreich]" }
    ]}

You can save the id of the selected entry in an extra element using the "putIdInto"
configuration option. The "value" shows up in the input field when selecting
the entry. The "info" text shows up in the list of available entries. You can
also add haeders and footers of various formats to the list. It's best to read
the source code to find out how.

Usually the user input is given as GET parameter "actualInput" to the ajax
handler. The name of the parameter can be overridden with the "requestParam"
configuration option.

