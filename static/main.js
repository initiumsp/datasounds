d3.csv("data.csv", function(d) {
    return d.temperature;
}, function(error, rows) {
    var min = Math.min.apply(null, rows);
    var max = Math.max.apply(null, rows);
    var midis = rows.map(function(x) {
        return Math.floor((x - min) * (30.0 / (max - min)) + 50);
    });
    var msec = timbre.timevalue("bpm120 l8");

    timbre.rec(function(output) {

        var synth = T("OscGen", {env:T("perc", {r:msec, ar:true})});

        var interval = T("interval", {interval:msec}, function(count) {
            if (count < midis.length) {
                synth.noteOn(midis[count], 100);
            } else {
                output.done();
            }
        })

        interval.start();

        output.send(synth);
    }).then(function(result) {
        var L = T("buffer", {buffer:result, loop:false});
        var R = T("buffer", {buffer:result, loop:false});

        var num = 400;
        var duration = L.duration;

        R.pitch = (duration * (num - 1)) / (duration * num);

        var panL = T("pan", {pos:-0.6}, L);
        var panR = T("pan", {pos:+0.6}, R)
        T("delay", {time:"bpm120 l16", fb:0.1, cross:true},
          panL, panR
         ).play();

        var ticks = 0;

        function animate() {
            console.log(ticks);

            /* Add your code here
               Something you may want to use:

               midis: array, midis[ticks] corresponds to current midi sound,
                             ranging from 50-80.
            */

            ticks += 1;
        }

        setInterval(animate, msec);
    })
});

