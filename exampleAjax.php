<?php
require('lib/cms/functions.misc.php');
/**
 * This file return all cities found mathing the given param.
 */
$handler = new CbDb();
$query = "
   SELECT `tcity`.`id`,
          `tcity`.`comment`,
          `tcountry`.`comment` AS `country`
     FROM `cb3`.`tcity`
LEFT JOIN `tcountry`
       ON `tcountry`.`id` = `tcity`.`country_id`
    WHERE `tcity`.`comment` LIKE '%s%%'
";

$return = array();
$daten = $handler->query($query, $_GET['actualInput']);
foreach ($daten as $data) {
   $return[] = '{ id: "'.$data['id'].'", value: "'.trim($data['comment']).'", info: "'.trim($data['comment']).' ['.trim($data['country']).']" }';
}
require_once('lib/framework/cb.php');
CbMl::init("generic");
$footer = 'jQuery("<div>'.ml('autocomplete_city_missing').'</div>").click(function(){
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
   }).val("'.$_GET['actualInput'].'").focus(function() {
      jQuery(this).unbind("focus").css({
         "color": "#000000"
      });
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
})';
echo '{ results: ['.join(',', $return).'],  footer: '.$footer.' }';
?>
