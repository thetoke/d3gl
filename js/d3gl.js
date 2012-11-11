// Jiwon Kim and Dan Posch
// {jiwonk, dcposch}@cs.stanford.edu
// CS448B Final Project

// See README.md for examples.


// check prerequisites 
if(!d3 || !jQuery || !THREE || !requestAnimationFrame){
    throw "D3GL requires D3, JQuery, ThreeJS, and RequestAnimationFrame";
}

d3.gl = {};
d3.gl.globe = function(){
    // PUBLIC PROPERTIES
    // viewport dimensions, in pixels
    var width = 500;
    var height = 500;
    // texture name
    var texture = '../img/earth-tex.png';
    // callbacks. data => lat, lon, etc
    var fnLat, fnLon, fnTex;

    // PRIVATE VARS
	// constants
	var VIEW_ANGLE = 45,
	    NEAR = 0.1,
	    FAR = 100;
    var MOUSE_SENSITIVITY = [0.005, 0.005];
    var ZOOM_SENSITIVITY = 0.1; // (0 = no effect, 1 = infinite)
    var zoom = 2.0, rotation = [0, 0]; // azith, angle

    // sets up a ThreeJS globe
    function initGL(gl, tex){
        var scene = new THREE.Scene();

        // camera
        var camera = new THREE.PerspectiveCamera(
            VIEW_ANGLE, width/height,
            NEAR, FAR);
        camera.position.z = 2;
        scene.add(camera);

        // globe model
        var texture = THREE.ImageUtils.loadTexture(tex);
        var sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            map: texture
        });
        var radius = 1.0, segments = 80, rings = 40;
        var sphere = new THREE.Mesh(
           new THREE.SphereGeometry(radius, segments, rings),
           sphereMaterial);
        scene.add(sphere);

        // add a point light
        var pointLight = new THREE.PointLight( 0xFFFFFF );
        pointLight.position.x = 1;
        pointLight.position.y = 5;
        pointLight.position.z = 13;
        scene.add(pointLight);

        // start the renderer
        var renderer = new THREE.WebGLRenderer({
            antialias:true
        });
        renderer.setSize(width, height);

        gl.mesh = sphere;
        gl.renderer = renderer;
        gl.scene = scene;
        gl.camera = camera;
    }

    function initControls(elem){
        var dragStart;
        $(elem).mousedown(function(evt){
            dragStart = [evt.pageX, evt.pageY];
        }).mousemove(function(evt){
            if(!dragStart) return;
            update(evt);
            dragStart = [evt.pageX, evt.pageY];
        }).mouseup(function(evt){
            if(!dragStart) return;
            update(evt);
            dragStart = null;
        }).mousewheel(function(evt, delta, dx, dy){
            zoom *= Math.pow(1-ZOOM_SENSITIVITY, dy);
        });
        function update(evt){
            rotation[1] += (evt.pageX - dragStart[0])*MOUSE_SENSITIVITY[0]*zoom;
            rotation[0] += (evt.pageY - dragStart[1])*MOUSE_SENSITIVITY[1]*zoom;
        }
    }

    // This is not quite as clean as
    // an external stylesheet, but simpler for
    // the end user.
    function initStyle(elem){
        elem.style.cursor = "pointer";
    }

    // renders. see http://bost.ocks.org/mike/chart/
    function globe(g){
        // render into each canvas
        g.each(function(d,i){
            if(this.tagName == "canvas") throw "D3GL can only render into Canvas elements";
            var texture = fnTex(d);
            console.log("Rendering. "+
                "Dimensions: "+width+","+height+" "+
                "Texture: "+texture);

            // 3js state
            var gl = {};
            initGL(gl, texture);
            initControls(gl.renderer.domElement);
            initStyle(gl.renderer.domElement);
            this.appendChild(gl.renderer.domElement);
            
            // called 60 times per second
            function render(){
                gl.mesh.rotation.x = rotation[0];
                gl.mesh.rotation.y = rotation[1];
                gl.camera.position.z = 1+zoom;
                gl.renderer.render(gl.scene, gl.camera);
                requestAnimationFrame(render);
            }
            render();
        });
    }
    globe.width = function(val){
        if(!arguments.length) return width;
        width = val;
        return globe;
    }
    globe.height = function(val){
        if(!arguments.length) return height;
        height = val;
        return globe;
    }
    globe.latitude= function(val){
        if(!arguments.length) return fnLat;  
        if(typeof val === "function") fnLat = val;
        else fnLat = function(){return val;}
        return globe;
    }
    globe.longitude= function(val){
        if(!arguments.length) return fnLon;  
        if(typeof val === "function") fnLon = val;
        else fnLon = function(){return val;}
        return globe;
    }
    globe.texture = function(val){
        if(!arguments.length) return texture;  
        if(typeof val === "function") fnTex = val;
        else fnTex = function(){return val;}
        return globe;
    }
    return globe;
};
