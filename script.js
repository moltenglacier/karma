var Karma = {
  dbRef: new Firebase("https://ch-karma.firebaseio.com/"),
  addPerson: function(personName) {
    this.dbRef.push({ name: personName, points: 0});
  },
  // storeData: function() {
  //   this.dbRef.set({ users: this.data });
  // },
  leaderboard: function() {
    return this.data.sort(this.compare);
  },
  compare: function(a, b) {
    return b.points - a.points;
  },
  modifyPointsFor: function(indexInArray, userId, newPoints) {
    this.data[indexInArray].points = newPoints;
    // this.storeData();
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
      $clonedLi.data("userId", p.userId);
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
    var order = $person.data("order");
    var userId = $person.data("userId");
    var newVal = $input.val();
    this.modifyPointsFor(order, userId, newVal);
    $person.find(".input").hide();
    $person.find(".points").text(newVal).show();
  },
  data: []
};

$(document).ready(function() {
  Karma.eventHandler();

  $("#newPersonForm").on("submit", function() {
    var $newPersonName = $("#newPersonName");
    Karma.addPerson($newPersonName.val());
    return false;
  });

  var user = {};
  Karma.dbRef.on("child_added", function(snap) {
    if (snap.val()) {
      user = snap.val();
      user.userId = snap.key();
      Karma.data.push(user);
      Karma.redrawUI();
    }
  });

});
