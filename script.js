document.addEventListener("DOMContentLoaded", function() {


      $("#myPano").pano({
        img: "pano/PetitCervin.jpg"
      });



  var list = document.getElementById("backgrounds-list");
  list.addEventListener("click", function(event) {
  	var background = document.getElementById("myPano");
    
    if (event.target.tagName === 'LI') {
      document.getElementById("ballsWaveG").classList.add('show');
    	background.classList.add("blur");
      loadBackground('pano/' + event.target.dataset.back + '.jpg');
      document.getElementById('audio').src = 'bgmusic/'	+ event.target.dataset.back + '.mp3';
      document.getElementById('sound').src = 'bgsounds/' + event.target.dataset.sound + '.mp3';
    }
  })



  function loadBackground(srcBack) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', srcBack, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function(e) {
      var video = document.getElementById("myPano");
      video.style.backgroundImage = 'url(' + srcBack + ')';
      video.classList.remove("blur");
      document.getElementById("ballsWaveG").classList.remove('show');
    }

    xhr.send();
  }


(function () {
  'use strict';
  
  var context = null,
    audio = null,
    convolverNode = null,
    source = null,
    sound = 'bgsounds/windy.mp3',
    img = new Image(),
    
    
    filters = [],
      
    $$ = document.querySelectorAll.bind(document),
    $ = document.querySelector.bind(document),


  loadImpulse = function (src) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function(e) {
      context.decodeAudioData(
      xhr.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        convolverNode.buffer = buffer;
        source.connect(convolverNode);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
    }

    xhr.send();
  },


    createContext = function () {
      var previous = window.equalizer;
  
      // avoid multiple AudioContext creating
      if (previous && previous.context) {
        context = previous.context;
      } else {
        context = new AudioContext();
        convolverNode = context.createConvolver();
      }
    },
      
    /**
     * creates 10 input elements
     */
    createInputs = function (className, container) {
      var inputs = [], node, i;
      
      for (i = 0; i < 10; i++) {
        node = document.createElement('input');
        // remove dot
        node.className = className.slice(1);
        container.appendChild(node);
        inputs.push(node);
      }
      
      return inputs;
    },
    
    /**
     * init inputs range and step
     */
    initInputsData = function (inputs) {
      [].forEach.call(inputs, function (item) {
        item.setAttribute('min', -60);
        item.setAttribute('max', 60);
        item.setAttribute('step', 0.1);
        item.setAttribute('value', 0);
        item.setAttribute('type', 'range');
      });
    },
    
    /**
     * bind input.change events to the filters
     */
    initEvents = function (inputs) {
      [].forEach.call(inputs, function (item, i) {
        item.addEventListener('change', function (e) {
          filters[i].gain.value = e.target.value;
        }, false);
      });
    },
    
    /**
     * @param frequency {number}
     */
    createFilter = function (frequency) {
      var filter = context.createBiquadFilter();
     
      filter.type = 'peaking';
      filter.frequency.value = frequency;
      filter.gain.value = 0;
      filter.Q.value = 1;

      return filter;
    },
    
    /**
     * create filter for each frequency
     */
    createFilters = function () {
      var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
      
      // create filters
      filters = frequencies.map(function (frequency) {
        return createFilter(frequency);
      });
      
      // create chain
      filters.reduce(function (prev, curr) {
        prev.connect(curr);
        return curr;
      });
    },
    
    /**
     * check param
     * @returns {array|NodeList} input elements
     */
    validateParam = function (param) {
      if (!param) {
        throw new TypeError('equalizer: param required');
      }
      
      var container = $(param.container),
        inputs = $$(param.inputs);

      
      if (param.audio instanceof HTMLMediaElement) {
        audio = param.audio;
      } else if (typeof param.audio === 'string') {
        audio = $(param.audio);
        
        if (!audio) {
          throw new TypeError('equalizer: there\'s no element that match selector' +
            param.audio);
        }
      } else {
        throw new TypeError('equalizer: parameter "audio" must be string or an audio element');
      }
      
      if (!container && !inputs.length) {
        throw new TypeError('equalizer: there\'s no elements match "' +
          param.container + '" or "' + param.selector);
      }
      
      if (!inputs.length) {
        inputs = createInputs(param.selector || '', container);
      }
      //console.log(inputs);
      return inputs;
    },
    
    /**
     * create a chain
     */
    bindEqualizer = function () {
      source = context.createMediaElementSource(audio);
      
      loadImpulse("impulse-response/Rays.wav");
      
      convolverNode.connect(filters[0]);
      //filters[9].connect(context.destination);

    },

    bind3d = function() {
      var pannerNode = context.createPanner();
      pannerNode.panningModel = "HRTF";
      pannerNode.setPosition(10, 0, 0);
      context.listener.setPosition(0, 0, 0);
      context.listener.setOrientation(1, 0, 0, 0, 0, 1);
      
      //pannerNode.connect(source);
      filters[9].connect(pannerNode);
      pannerNode.connect(context.destination);
    },
    
    /**
     * main function
     */
    equalizer = function (param) {
      var inputs = validateParam(param);
      
      createContext();
      createFilters();
      initInputsData(inputs);
      initEvents(inputs);
      bindEqualizer();
      bind3d();
    };
  //==========================

  getBackgroundSize('#myPano', function(elem){
    var deg = 0;
    document.getElementById('degr').innerText=elem.height + ' ' + elem.width + ' ' + parseInt(elem.width/360) + ' ' + deg + 'deg';
    
    jQuery('#myPano').mousedown(function(e) {
      var posX = e.screenX;
      var relX = 0, rad = 0;
      jQuery('#myPano').mousemove(function(event) {
        console.log('MOVE');
        if (event.screenX < posX) {
          relX = Math.abs(posX - event.screenX);
          if (relX >= 12) {
            if (deg >= 360) deg = -1;
            relX = Math.round(relX/12);
            deg = deg + relX;
            posX = event.screenX;
            rad = (deg*3.14)/180;
            context.listener.setOrientation(Math.cos(rad), 0, Math.sin(rad), 0, 0, 1);
            document.getElementById('degr').innerText=elem.height + ' ' + elem.width + ' ' + parseInt(elem.width/360) + ' ' + deg + 'deg';
          }
        } else if (event.screenX > posX) {
          relX = Math.abs(posX - event.screenX);
          if (relX >= 12) {
            if (deg <= 0) deg = 361;
            relX = Math.round(relX/12);
            deg = deg - relX;
            posX = event.screenX;
            rad = (deg*3.14)/180;
            context.listener.setOrientation(Math.cos(rad), 0, Math.sin(rad), 0, 0, 1);
            document.getElementById('degr').innerText=elem.height + ' ' + elem.width + ' ' + parseInt(elem.width/360) + ' ' + deg + 'deg';
          }
        }
      })
      
      console.log(e)
    })
  });

  //===========================
  equalizer.context = context;
  
  window.equalizer = equalizer;
  document.getElementById('impulses').onclick = function(e){
    if (e.target.tagName == 'LI') {
      loadImpulse('impulse-response/' + e.target.textContent + '.wav');
    }
};
}());


    equalizer({
      audio: '#audio',
      container: '.eq-wrap'
    });



function getBackgroundSize(selector, callback) {
  var img = new Image(),
      // here we will place image's width and height
      width, height,
      // here we get the size of the background and split it to array
      backgroundSize = $(selector).css('background-size').split(' ');
      console.log(backgroundSize[0]);

  // checking if width was set to pixel value
  if (/px/.test(backgroundSize[1])) width = parseInt(backgroundSize[1]);
  // checking if width was set to percent value
  if (/%/.test(backgroundSize[1])) width = $(selector).parent().width() * (parseInt(backgroundSize[1]) / 100);
  // checking if height was set to pixel value
  if (/px/.test(backgroundSize[0])) height = parseInt(backgroundSize[1]);
  // checking if height was set to percent value
  if (/%/.test(backgroundSize[0])) height = $(selector).parent().height() * (parseInt(backgroundSize[0]) / 100);
  if (/auto/.test(backgroundSize[0])) height = $(selector).parent().height();

  img.onload = function () {
    // check if width was set earlier, if not then set it now
    if (typeof width == 'undefined') width = this.width;
    // do the same with height
    if (typeof height == 'undefined') height = this.height;
    // call the callback
    imgWidth = parseInt(this.width/(this.height/height));
    callback({ width: imgWidth, height: height });
  }
  // extract image source from css using one, simple regex
  // src should be set AFTER onload handler
  img.src = $(selector).css('background-image').replace(/url\(['"]*(.*?)['"]*\)/g, '$1');
}


      /*var buffers,source,destination;

      window.stopButtonClick = function(index){
        source.stop(0);
      }

      window.playButtonClick = function(index){

        source = context.createBufferSource();
        source.buffer = buffers[0];
        destination = context.destination;

        convolverNode = context.createConvolver();
        convolverNode.buffer = buffers[1];

        source.connect(convolverNode);
        convolverNode.connect(destination);

        source.start(0);
      }

      var loader = new BufferLoader(context, [
        "sound/voicefull.mp3",
        "impulse-response/wheel.wav",
        "impulse-response/1950.wav",
        "impulse-response/basement.wav",
        "impulse-response/telephone.wav",
        "impulse-response/muffler.wav",
        "impulse-response/spring.wav",
        "impulse-response/echo.wav"
      ], onLoaded);

      function onLoaded(b) {
        buffers = b;
        $('body').addClass('readytoplay');
      }
      loader.load();

      $('.radio1').on('change', function(e){
        convolverNode.buffer = buffers[($('.radio1:checked').val()*1)];
      });*/


  
})








