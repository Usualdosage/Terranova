(function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
        return;
    }

    var rad = 0.5;
    var axis = new THREE.Vector3(0.5,0.5,0);

    var container = document.getElementById('container');
    var normVertShader = document.getElementById('norm-vert-shader');
    var normFragShader = document.getElementById('norm-frag-shader');

    var scene;
    var renderer;
    var camera;
    var clock;
    var controls;
    var stats;

    var moon;
    var starfield;
    var light = {
        speed: 0.1,
        distance: 1000,
        position: new THREE.Vector3(0, 0, 0),
        orbit: function (center, time) {
            this.position.x =
                (center.x + this.distance) * Math.sin(time * -this.speed);

            this.position.z =
                (center.z + this.distance) * Math.cos(time * this.speed);
        }
    };

    function createMoon(textureMap, normalMap) {
        var radius = 100;
        var xSegments = 50;
        var ySegments = 50;
        var geo = new THREE.SphereGeometry(radius, xSegments, ySegments);

        var mat = new THREE.ShaderMaterial({
            uniforms: {
                lightPosition: {
                    type: 'v3',
                    value: light.position
                },
                textureMap: {
                    type: 't',
                    value: textureMap
                },
                normalMap: {
                    type: 't',
                    value: normalMap
                },
                uvScale: {
                    type: 'v2',
                    value: new THREE.Vector2(1.0, 1.0)
                }
            },
            vertexShader: normVertShader.innerText,
            fragmentShader: normFragShader.innerText
        });

        var mesh = new THREE.Mesh(geo, mat);
        mesh.geometry.computeTangents();
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 180, 0);
        scene.add(mesh);
        return mesh;
    }

    function createSkybox(texture) {
        var size = 15000;

        var cubemap = THREE.ShaderLib.cube;
        cubemap.uniforms.tCube.value = texture;

        var mat = new THREE.ShaderMaterial({
            fragmentShader: cubemap.fragmentShader,
            vertexShader: cubemap.vertexShader,
            uniforms: cubemap.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        var geo = new THREE.CubeGeometry(size, size, size);
        
        var mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        
        return mesh;
    }

    function init() {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true
        });

        renderer.setClearColor(0x000000, 1);
        renderer.setSize(container.offsetWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        var fov = 20;
        var aspect = container.offsetWidth / window.innerHeight;
        var near = 1;
        var far = 65536;
        
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 0, 800);

        scene = new THREE.Scene();
        scene.add(camera);

        controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 0.5;
        controls.dynamicDampingFactor = 0.5;

        clock = new THREE.Clock();
    }

    function animate() {
        requestAnimationFrame(animate);
        light.orbit(moon.position, clock.getElapsedTime());
        controls.update(camera);
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        renderer.setSize(container.offsetWidth, window.innerHeight);
        camera.aspect = container.offsetWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    function loadAssets(options) {
        var paths = options.paths;
        var onComplete = options.onComplete;
        var total = 0;
        var completed = 0;
        var textures = { };
        var key;

        for (key in paths)
            if (paths.hasOwnProperty(key)) total++;

        for (key in paths) {
            if (paths.hasOwnProperty(key)) {
                var path = paths[key];
                if (typeof path === 'string')
                    THREE.ImageUtils.loadTexture(path, null, getOnLoad(path, key));
                else if (typeof path === 'object')
                    THREE.ImageUtils.loadTextureCube(path, null, getOnLoad(path, key));
            }
        }

        function getOnLoad(path, name) {
            return function (tex) {
                textures[name] = tex;
                completed++;                
                if (completed === total && typeof onComplete === 'function') {
                    onComplete({
                        textures: textures
                    });
                }
            };
        }
    }

    /* When the window loads, we immediately begin loading assets. While the
        assets loading Three.JS is initialized. When all assets finish loading
        they can be used to create objects in the scene and animation begins */
    function onWindowLoaded() {
        loadAssets({
            paths: {
                moon: 'img/maps/moon.jpg',
                moonNormal: 'img/maps/normal.jpg',
                starfield: [
                    'img/starfield/front.png',
                    'img/starfield/back.png',
                    'img/starfield/left.png',
                    'img/starfield/right.png',
                    'img/starfield/top.png',
                    'img/starfield/bottom.png'
                ]
            },
            onComplete: function (evt) {
                var textures = evt.textures;
                moon = createMoon(textures.moon, textures.moonNormal);
                starfield = createSkybox(textures.starfield);
                animate();
            }
        });

        init();
    }

    /* Window load event kicks off execution */
    window.addEventListener('load', onWindowLoaded, false);
    window.addEventListener('resize', onWindowResize, false);

    Highcharts.theme = {
        colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
            '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
        chart: {
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                    [0, '#000'],
                    [1, '#000']
                ]
            },
            style: {
                fontFamily: '\'Jura\', sans-serif'
            },
            plotBorderColor: '#606063'
        },
        title: {
            style: {
                color: '#1e73fc',
                textTransform: 'uppercase',
                fontSize: '20px'
            }
        },
        subtitle: {
            style: {
                color: '#1e73fc',
                textTransform: 'uppercase'
            }
        },
        xAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#1e73fc'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            title: {
                style: {
                    color: '#1e73fc'
    
                }
            }
        },
        yAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#1e73fc'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            tickWidth: 1,
            title: {
                style: {
                    color: '#1e73fc'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            style: {
                color: '#1e73fc'
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    color: '#1e73fc'
                },
                marker: {
                    lineColor: '#333'
                }
            },
            boxplot: {
                fillColor: '#505053'
            },
            candlestick: {
                lineColor: 'white'
            },
            errorbar: {
                color: 'white'
            }
        },
        legend: {
            itemStyle: {
                color: '#1e73fc'
            },
            itemHoverStyle: {
                color: '#1e73fc'
            },
            itemHiddenStyle: {
                color: '#606063'
            }
        },
        credits: {
            style: {
                color: '#666'
            }
        },
        labels: {
            style: {
                color: '#1e73fc'
            }
        },
    
        drilldown: {
            activeAxisLabelStyle: {
                color: '#F0F0F3'
            },
            activeDataLabelStyle: {
                color: '#F0F0F3'
            }
        },
    
        navigation: {
            buttonOptions: {
                symbolStroke: '#DDDDDD',
                theme: {
                    fill: '#505053'
                }
            }
        },
    
        // scroll charts
        rangeSelector: {
            buttonTheme: {
                fill: '#505053',
                stroke: '#000000',
                style: {
                    color: '#CCC'
                },
                states: {
                    hover: {
                        fill: '#707073',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    },
                    select: {
                        fill: '#000003',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    }
                }
            },
            inputBoxBorderColor: '#505053',
            inputStyle: {
                backgroundColor: '#333',
                color: 'silver'
            },
            labelStyle: {
                color: 'silver'
            }
        },
    
        navigator: {
            handles: {
                backgroundColor: '#666',
                borderColor: '#AAA'
            },
            outlineColor: '#CCC',
            maskFill: 'rgba(255,255,255,0.1)',
            series: {
                color: '#7798BF',
                lineColor: '#A6C7ED'
            },
            xAxis: {
                gridLineColor: '#505053'
            }
        },
    
        scrollbar: {
            barBackgroundColor: '#808083',
            barBorderColor: '#808083',
            buttonArrowColor: '#CCC',
            buttonBackgroundColor: '#606063',
            buttonBorderColor: '#606063',
            rifleColor: '#FFF',
            trackBackgroundColor: '#404043',
            trackBorderColor: '#404043'
        },
    
        // special colors for some of the
        legendBackgroundColor: '#000',
        background2: '#000',
        dataLabelsColor: '#1e73fc',
        textColor: '#1e73fc',
        contrastTextColor: '#F0F0F3',
        maskColor: 'rgba(255,255,255,0.3)'
    };
    
    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);

  
Highcharts.chart('chart', {
    chart: {
        type: 'area'
    },
    title: {
        text: ''
    },
    xAxis: {
        allowDecimals: false,
        labels: {
            formatter: function () {
                return this.value; // clean, unformatted number for year
            }
        }
    },
    yAxis: {
        title: {
            text: 'Levels'
        },
        labels: {
            formatter: function () {
                return this.value + '%';
            }
        }
    },
    tooltip: {
        pointFormat: '{point.y:,.0f}% to target'
    },
    plotOptions: {
        area: {
            pointStart: 0,
            marker: {
                enabled: false,
                symbol: 'circle',
                radius: 2,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            }
        }
    },
    series: [{
        name: 'Oxygen',
        data: [
            0, 0, 0, 1, 1, 2, 3, 5, 7, 8, 9, 10
        ]
    }, {
        name: 'Biology',
        data: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]
    },{
        name: 'Temperature',
        data: [
            0, 1, 4, 6, 11, 12, 13, 15, 19, 20, 22, 23
        ]
    },{
        name: 'Water',
        data: [
            0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 3
        ]
    },{
        name: 'Pressure',
        data: [
            0, 0, 0, 1, 3, 5, 7, 11, 13, 16, 18, 20
        ]
    }]
});

})(); // End INIT
