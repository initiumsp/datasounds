d3.csv("data.csv", function(d) {
    return d;
}, function(error, rows) {
    var years = rows.map(function(x) { return x.year; });
    var rows = rows.map(function(x) { return parseFloat(x.temperature); });

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

        var tickIndex = 0;
        var lastTime = Date.now();

        function animate() {
            var nowTime = Date.now();
            var interval = nowTime - lastTime;
            if (interval >= msec) {
                tick(tickIndex);
                tickIndex += 1;
                lastTime += msec;
            }
            window.requestAnimationFrame(animate);
        }

        function tick(ticks) {
            if (ticks >= midis.length) return;

            console.log(years[ticks]);

            var r = Math.round((midis[ticks] - 50) * 152 / 30);
            var g = Math.round((midis[ticks] - 50) * 27 / 30);
            var b = Math.round((midis[ticks] - 50) * 30 / 30);

            var rgbStr = "rgb(" + r + "," + g + "," + b + ")"
            $("body").css("background-color", rgbStr);
            $("#title").text("Year " + years[ticks]);
        }

        animate();
    })
});

