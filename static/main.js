d3.csv("data.csv", function(d) {
    return d.temperature;
}, function(error, rows) {
    var min = Math.min.apply(null, rows);
    var max = Math.max.apply(null, rows);
    var midis = rows.map(function(x) {
        return Math.floor((x - min) * (30.0 / (max - min)) + 50);
    });

    console.log(midis);

    timbre.rec(function(output) {
        var msec  = timbre.timevalue("bpm120 l8");
        var synth = T("OscGen", {env:T("perc", {r:msec, ar:true})});

        T("interval", {interval:msec}, function(count) {
            if (count < midis.length) {
                synth.noteOn(midis[count], 100);
            } else {
                output.done();
            }
        }).start();

        output.send(synth);
    }).then(function(result) {
        var L = T("buffer", {buffer:result, loop:false});
        var R = T("buffer", {buffer:result, loop:false});

        var num = 400;
        var duration = L.duration;

        R.pitch = (duration * (num - 1)) / (duration * num);

        T("delay", {time:"bpm120 l16", fb:0.1, cross:true},
          T("pan", {pos:-0.6}, L), T("pan", {pos:+0.6}, R)
         ).play();
    })
});
