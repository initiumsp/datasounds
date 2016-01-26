var played = false;
$(".play").click(function() {
    if (played) {
        window.location.reload();
    } else {
        play();
        $(".play").text("Replay");
        $(".play").fadeOut();
        played = true;
    }
});

function play() {
    d3.csv("data.csv", function(d) {
        return d;
    }, function(error, data) {
        data.forEach(function(d, index) {
            console.log(index)

            d.year = parseInt(d.year);
            d.temperature = parseFloat(d.temperature);
            d.date = new Date(d.year, 0, 0, 0, 0, 0, 0);
            d.ind = index;
        });

        var years = data.map(function(x) { return x.year; });
        var rows = data.map(function(x) { return x.temperature; });

        var min = Math.min.apply(null, rows);
        var max = Math.max.apply(null, rows);
        var midis = rows.map(function(x) {
            return Math.floor((x - min) * (30.0 / (max - min)) + 50);
        });
        var msec = timbre.timevalue("bpm120 l8");

        var height = $(window).innerHeight();
        var width = $(window).innerWidth();

        var fullWidth = width * 5;

        var x = d3.scale.linear().range([0, fullWidth]);
        var y = d3.scale.linear().range([height, 0]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d) { return "" + data[d].year; });
        var yAxis = d3.svg.axis().scale(y).orient("left");

        var area = d3.svg.area()
            .x(function(d) { return x(d.ind); })
            .y0(height)
            .y1(function(d) { return y(d.temperature); });

        var line = d3.svg.line()
            .x(function(d) { return x(d.ind); })
            .y(function(d) { return y(d.temperature); });

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g");

        x.domain(d3.extent(data, function(d) { return d.ind; }));
        y.domain([20, 30]);

        // svg.append("path")
        //     .datum(data)
        //     .attr("class", "area")
        //     .attr("d", area);

        var widthOffsetBegin = width / 2;
        var widthOffset = widthOffsetBegin;

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (height - 50) + ")")
            .call(xAxis);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("r", 3.5);

        svg.attr("transform", "translate(" + widthOffset + ", 0)");

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
            var startTime = Date.now();
            var lastTime = Date.now();

            function animate() {
                var nowTime = Date.now();
                var interval = nowTime - lastTime;
                var fullInterval = nowTime - startTime;
                if (interval >= msec) {
                    tick(tickIndex);
                    tickIndex += 1;
                    lastTime += msec;
                }

                var movePercent = fullInterval / (250 * years.length);
                if (movePercent > 1) movePercent = 1;

                widthOffset = widthOffsetBegin - 5 * width * movePercent;

                svg.attr("transform", "translate(" + widthOffset + ",0)");

                window.requestAnimationFrame(animate);
            }

            function tick(ticks) {
                if (ticks >= midis.length) {
                    $(".play").fadeIn();
                    return;
                };

                console.log(data[ticks].temperature);

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
}
