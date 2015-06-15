var Karma = {
  storeData: function() {
    localStorage["karma.data"] = JSON.stringify(this.data);
  },
  readData: function() {
    this.data = JSON.parse(localStorage["karma.data"] || "[]");
  },
  leaderboard: function() {
    return this.data.sort(this.compare);
  },
  compare: function(a, b) {
    return b.points - a.points;
  },
  modifyPointsFor: function(indexInArray, newPoints) {
    this.data[indexInArray].points = newPoints;
    this.storeData();
  },
  redrawUI: function() {
    $("#ppl").empty();
    if (this.data.length === 0) {
      $("#ppl").text("Nothing here, yo");
      return;
    }
    var sorted = this.leaderboard();
    var $template = $(".person:first"), $clonedLi;
    var ppl = sorted.map(function(p, i) {
      $clonedLi = $template.clone().show();
      $clonedLi.data("order", i);
      $clonedLi.find(".name").text(p.name);
      $clonedLi.find(".points").text(p.points);
      $clonedLi.find("input").val(p.points);
      return $clonedLi;
    });

    $("#ppl").append(ppl);
  },
  eventHandler: function(){
    $(document).on("click", function(e) {
      e.stopPropagation();
      if (!$(e.target).is(":input,.points")) {
        $(".person:has(:input:visible)").each(function(i, e) {
          Karma.updatePoints($(e).find("input"));
        });
        Karma.redrawUI();
      }
    });
    $("#ppl").on("click", ".points", function(event) {
      var $points = $(this);
      $points.hide();
      $points.siblings(".input").show();
    }).on("keyup", "input", function(event) {
      if (event.which === 13) {
        var $input = $(this);
        Karma.updatePoints($input);
        Karma.redrawUI();
      }
    });
  },
  updatePoints: function($input) {
    var $person = $input.parents(".person");
    var personIndex = $person.data("order");
    var newVal = $input.val();
    this.modifyPointsFor(personIndex, newVal);
    $person.find(".input").hide();
    $person.find(".points").text(newVal).show();
  },
  data: []
};

$(document).ready(function() {
  Karma.readData();
  Karma.redrawUI();
  Karma.eventHandler();
});
